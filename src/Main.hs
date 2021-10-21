{-# LANGUAGE OverloadedStrings #-}
module Main where

import qualified ADL.Core.StringMap as SM
import qualified Data.Text as T
import qualified Data.Text.IO as T
import qualified Data.Text.Lazy as LT;
import qualified Data.ByteString.Char8 as CBS
import qualified Data.ByteString.Lazy as LBS
import qualified Data.HashMap.Strict as HM
import qualified Commands.LetsEncrypt as LE
import qualified Commands.ProxyMode as P
import qualified Commands as C
import qualified Util as U
import qualified Log as L

import ADL.Config(ToolConfig(..), LetsEncryptConfig(..), DeployMode(..), ProxyModeConfig(..))
import ADL.Core(adlFromByteString, AdlValue)
import Blobs(releaseBlobStore, BlobStore(..))
import Commands.ProxyMode.LocalState(nginxConfTemplate)
import Control.Exception(SomeException)
import Control.Monad.Catch(finally,catch)
import Control.Monad.IO.Class
import Control.Monad.Reader(runReaderT)
import Data.List(isPrefixOf)
import Data.Maybe(fromMaybe)
import Data.Monoid
import Data.Semigroup ((<>))
import Data.Version(showVersion)
import HelpText(helpText)
import Options.Applicative
import Paths_camus2(version)
import System.Directory(doesFileExist)
import System.Environment(getArgs, lookupEnv, getExecutablePath)
import System.Exit(exitWith,ExitCode(..))
import System.FilePath(takeBaseName, takeDirectory, takeExtension, (</>))
import System.Posix.Files(fileExist)
import Types(REnv(..),IOR, getToolConfig)
import Util.Aws(mkAwsEnvFn0, AwsEnv)

data Command
  = Help
  | ListReleases
  | ShowLog
  | Version
  | ShowDefaultNginxConfig
  | FetchContext (Maybe Int)
  | UnpackRelease (T.Text,FilePath)
  | ExpandTemplate (FilePath,FilePath)
  | AwsDockerLoginCmd
  | Status Bool
  | Start (T.Text,Maybe T.Text)
  | Stop T.Text
  | Connect (T.Text,T.Text)
  | Disconnect T.Text
  | RestartFrontendProxy
  | ShutdownFrontendProxy
  | GenerateSslCertificate
  | SlaveFlush
  | SlaveUpdate (Maybe Int)
  | LeGetCerts
  | LeAuthHook
  | LeCleanupHook

commandParserInfo :: ParserInfo Command
commandParserInfo = info (commandParser <**> helper) (
    fullDesc
    <> header "camus2 - a deployment management tool"
  )

commandParser :: Parser Command
commandParser = subparser
  (  command "help"
     (info' (pure Help) "Show detailed program help")
  <> command "list-releases"
     (info' (pure ListReleases) "List available releases")
  <> command "version"
     (info' (pure Version) "Show program version")
  <> command "show-log"
     (info' (pure ShowLog) "Show the history of releases deployed via the start command.")
  <> command "show-default-nginx-config"
     (info' (pure ShowDefaultNginxConfig) "Outputs the default template for the nginx config.")
  <> command "fetch-context"
     (info' fetchContextParser "Downloads the environmental information files from infrastructure")
  <> command "unpack"
     (info' unpackParser "Unpack and configure the specified release into the given directory")
  <> command "expand-template"
     (info' expandTemplateParser "Injects the config contexts specified into a template")
  <> command "aws-docker-login-cmd"
     (info' (pure AwsDockerLoginCmd) "Runs the appropriate docker login command to access configured repositories")
  <> command "status"
     (info' statusParser "Show the proxy system status: specifically the endpoints and live deploys")
  <> command "start"
     (info' startParser "Create and start a deployment (if it's not already running)")
  <> command "stop"
     (info' stopParser "Stop and remove a deployment")
  <> command "connect"
     (info' connectParser "Connect an endpoint to a running deployment")
  <> command "disconnect"
     (info' disconnectParser "Disconnect an endpoint")
  <> command "restart-frontend-proxy"
     (info' (pure RestartFrontendProxy) "Restart the nginx frontend proxy")
   <> command "shutdown-frontend-proxy"
     (info' (pure ShutdownFrontendProxy) "Shutdown the nginx frontend proxy")
  <> command "generate-ssl-certificate"
     (info' (pure GenerateSslCertificate) "Generate an ssl certificate using the http-01 challenge")
  <> command "slave-flush"
     (info' (pure SlaveFlush) "Remove old slave state records from S3")
  <> command "slave-update"
     (info' slaveUpdateParser "If in slave mode, fetch the master state from S3 and update local state to match")
  <> command "le-get-certs"
     (info' (pure LeGetCerts) "(internal helper for generate-ssl-certificate)")
  <> command "le-auth-hook"
     (info' (pure LeAuthHook) "(internal helper for generate-ssl-certificate)")
  <> command "le-cleanup-hook"
     (info' (pure LeCleanupHook) "(internal helper for generate-ssl-certificate)")
  )

fetchContextParser :: Parser Command
fetchContextParser = FetchContext <$> retryFlag
 where
   retryFlag :: Parser (Maybe Int)
   retryFlag = flag Nothing (Just 10)
     (  long "retry"
     <> help "retry if sources unavailable"
     )

unpackParser :: Parser Command
unpackParser = UnpackRelease <$> arguments
 where
   arguments = (,) <$> releaseArgument <*> directoryArgument "TODIR"

expandTemplateParser :: Parser Command
expandTemplateParser = ExpandTemplate <$> arguments
 where
   arguments = (,) <$> fileArgument "TEMPLATE" <*> fileArgument "OUTFILE"

statusParser :: Parser Command
statusParser = Status <$> showSlaves
 where
   showSlaves :: Parser Bool
   showSlaves = flag False True
     (  long "show-slaves"
     <> help "include per slave status"
     )

startParser :: Parser Command
startParser = Start <$> arguments
 where
   arguments = (,) <$> releaseArgument <*> (Just <$> asDeploy <|> pure Nothing)
   asDeploy = argument str (metavar "ASDEPLOY")

stopParser :: Parser Command
stopParser = Stop <$> deployArgument

connectParser :: Parser Command
connectParser = Connect <$> arguments
 where
   arguments = (,) <$> endpointArgument <*> deployArgument

disconnectParser :: Parser Command
disconnectParser = Disconnect <$> endpointArgument

slaveUpdateParser :: Parser Command
slaveUpdateParser = SlaveUpdate <$> (Just <$> repeatOption <|> pure Nothing)
 where
   repeatOption :: Parser Int
   repeatOption = option auto
     (  long "repeat"
     <> metavar "SECS"
     <> help "run forever, repeating with specifed period"
     )

directoryArgument :: String -> Parser FilePath
directoryArgument var = argument str
  (  metavar var
  <> action "directory"  -- bash completion on directories
  )

fileArgument :: String -> Parser FilePath
fileArgument var = argument str
  (  metavar var
  <> action "file"  -- bash completion on files
  )

releaseArgument :: Parser T.Text
releaseArgument = argument str
  (  metavar "RELEASE"
  <> completer (mkCompleter completeAvailableReleases)
  )

deployArgument :: Parser T.Text
deployArgument = argument str
  (  metavar "DEPLOY"
  <> completer (mkCompleter completeRunningDeploys)
  )

endpointArgument :: Parser T.Text
endpointArgument = argument str
  (  metavar "ENDPOINT"
  <> completer (mkCompleter completeConfiguredEndpoints)
  )

info' :: Parser a -> String -> ParserInfo a
info' p desc = info (helper <*> p) (fullDesc <> progDesc desc)

main :: IO ()
main = do
   cmd <- execParser commandParserInfo
   runCommand cmd

runCommand :: Command -> IO ()
runCommand Help = helpCmd
runCommand Version = putStrLn (showVersion version)
runCommand ListReleases = runWithConfig (C.listReleases)
runCommand ShowLog = runWithConfig (C.showLog)
runCommand ShowDefaultNginxConfig = C.showDefaultNginxConfig
runCommand (FetchContext retry) = runWithConfigAndLog (U.fetchConfigContext retry)
runCommand (UnpackRelease (release,toDir)) = runWithConfigAndLog (U.unpackRelease id release toDir)
runCommand (ExpandTemplate (templatePath,destPath)) = runWithConfigAndLog (U.injectContext id templatePath destPath)
runCommand AwsDockerLoginCmd = runWithConfigAndLog (C.awsDockerLoginCmd)
runCommand (Status showSlaves) = runWithConfig (P.showStatus showSlaves)
runCommand (Start (release,mdeploy)) = runWithConfigAndLog (C.createAndStart release (fromMaybe (deployNameFromRelease release) mdeploy))
runCommand (Stop deploy) = runWithConfigAndLog (C.stopDeploy deploy)
runCommand (Connect (endpoint,deploy)) = runWithConfigAndLog (P.connect endpoint deploy)
runCommand (Disconnect endpoint) = runWithConfigAndLog (P.disconnect endpoint)
runCommand RestartFrontendProxy = runWithConfigAndLog (P.restartProxy)
runCommand ShutdownFrontendProxy = runWithConfigAndLog (P.shutdownProxy)
runCommand GenerateSslCertificate = runWithConfigAndLog (P.generateSslCertificate)
runCommand SlaveFlush = runWithConfigAndLog (P.slaveFlush)
runCommand (SlaveUpdate repeat) = runWithConfigAndLog (P.slaveUpdate repeat)
runCommand LeGetCerts = getLetsEncryptConfig >>= LE.getCerts
runCommand LeAuthHook = getLetsEncryptConfig >>= LE.authHook
runCommand LeCleanupHook = getLetsEncryptConfig >>= LE.cleanupHook

-- Function called to bash complete releases
completeAvailableReleases :: String -> IO [String]
completeAvailableReleases prefix = evalWithConfig $ do
  bs <- releaseBlobStore
  names <- liftIO $ bs_namesWithPrefix bs (T.pack prefix)
  return (map T.unpack names)

-- Function called to bash complete live deploys
completeRunningDeploys :: String -> IO [String]
completeRunningDeploys prefix = evalWithConfig $ do
  runningDeploys <- P.runningDeploys
  return (filter (isPrefixOf prefix) (map T.unpack runningDeploys))

-- Function called to bash complete live deploys
completeConfiguredEndpoints :: String -> IO [String]
completeConfiguredEndpoints prefix = evalWithConfig $ do
   tcfg <- getToolConfig
   case tc_deployMode tcfg of
     DeployMode_proxy pm -> do
       let endpoints = map (T.unpack . fst) (SM.toList (pm_endPoints pm))
       return (filter (isPrefixOf prefix) endpoints)
     _ -> return []

deployNameFromRelease :: T.Text -> T.Text
deployNameFromRelease release = T.pack (takeBaseName (T.unpack release))

helpCmd :: IO ()
helpCmd = do
  CBS.putStrLn helpText

-- | Load the config file and evaluate the action
evalWithConfig :: IOR a -> IO a
evalWithConfig ma = do
  tcfg <- loadToolConfig
  let logger = L.logger (L.logStdout L.Info)
  runReaderT ma (REnv tcfg logger)

-- | Load the config file and run the action
runWithConfig :: IOR () -> IO ()
runWithConfig ma = do
  tcfg <- loadToolConfig
  let logger = L.logger (L.logStdout L.Info)
  catch (runReaderT ma (REnv tcfg logger)) (ehandler logger)
  where
    ehandler logger e = L.error logger ("Exception: " <> LT.pack (show (e::SomeException)))

-- | Load the config file and run the action, writing log messages to the configured logfile
runWithConfigAndLog :: IOR () -> IO ()
runWithConfigAndLog ma = do
  tcfg <- loadToolConfig
  logToFile <-  L.logFile L.Info (T.unpack (tc_logFile tcfg))
  let logToStdout = L.logStdout L.Info
      logger = L.logger (L.combineLogFns logToFile logToStdout)
  finally (catch (runReaderT ma (REnv tcfg logger)) (ehandler logger)) (L.l_close (L.l_logfns logger))
  where
    ehandler logger e = L.error logger ("Exception: " <> LT.pack (show (e::SomeException)))

loadToolConfig :: IO ToolConfig
loadToolConfig = getConfig "CAMUS2_CONFIG" ["etc/camus2.json", "etc/camus2.yaml"]

getLetsEncryptConfig :: IO LetsEncryptConfig
getLetsEncryptConfig = getConfig "HX_LETSENCRYPT_CONFIG" ["etc/letsencrypt-aws.json"]

-- fetch an ADL config file, either from the path in the
-- given environment variable, or from a prefix relative
-- default path.
getConfig :: (AdlValue a) => String -> [FilePath] -> IO a
getConfig envVarName prefixPaths = do
  mEnvPath <- lookupEnv envVarName
  configPaths <- case mEnvPath of
   (Just configPath) -> return [configPath]
   Nothing -> do
     exePath <- getExecutablePath
     let prefix = takeDirectory (takeDirectory exePath)
     return [prefix </> path | path <- prefixPaths]
  getAwsEnv <- mkAwsEnvFn0
  mContent <- readFirst getAwsEnv configPaths
  case mContent of
    Nothing -> error ("Config file not found, tried: " <> show configPaths)
    (Just (configPath, lbs)) -> do
      let pr = parseContent configPath lbs
          from = "from " <> T.pack configPath
      case U.decodeAdlParseResult from pr of
        (Left err) -> error (T.unpack err)
        (Right a) -> return a
  where
    readFirst :: IO AwsEnv -> [FilePath] -> IO (Maybe (FilePath, LBS.ByteString))
    readFirst getAwsEnv [] = return Nothing
    readFirst getAwsEnv (path:paths) = do
      mlbs <- U.readFileOrS3 getAwsEnv path
      case mlbs of
        Nothing -> readFirst getAwsEnv paths
        Just lbs -> return (Just (path,lbs))

    parseContent configPath lbs = case takeExtension configPath of
      ".json" -> adlFromByteString lbs
      ".yaml" -> U.adlFromYamlByteString lbs
      _ -> error ("Unknown file type for config file: " <> configPath <> " (expected .json or .yaml)")
