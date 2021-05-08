{-# LANGUAGE OverloadedStrings #-}
module ADL.Release(
    ReleaseConfig(..),
    mkReleaseConfig,
) where

import ADL.Core
import Control.Applicative( (<$>), (<*>), (<|>) )
import Prelude( ($) )
import qualified ADL.Types
import qualified Data.Aeson as JS
import qualified Data.HashMap.Strict as HM
import qualified Data.Map as M
import qualified Data.Proxy
import qualified Data.Text as T
import qualified Prelude

data ReleaseConfig = ReleaseConfig
    { rc_downloads :: [ADL.Types.FilePath]
    , rc_templates :: [ADL.Types.FilePath]
    , rc_prestartCommand :: T.Text
    , rc_startCommand :: T.Text
    , rc_stopCommand :: T.Text
    , rc_configSources :: StringMap (ADL.Types.FilePath)
    }
    deriving (Prelude.Eq,Prelude.Ord,Prelude.Show)

mkReleaseConfig :: [ADL.Types.FilePath] -> [ADL.Types.FilePath] -> T.Text -> T.Text -> T.Text -> ReleaseConfig
mkReleaseConfig downloads templates prestartCommand startCommand stopCommand = ReleaseConfig downloads templates prestartCommand startCommand stopCommand (stringMapFromList [])

instance AdlValue ReleaseConfig where
    atype _ = "release.ReleaseConfig"
    
    jsonGen = genObject
        [ genField "downloads" rc_downloads
        , genField "templates" rc_templates
        , genField "prestartCommand" rc_prestartCommand
        , genField "startCommand" rc_startCommand
        , genField "stopCommand" rc_stopCommand
        , genField "configSources" rc_configSources
        ]
    
    jsonParser = ReleaseConfig
        <$> parseField "downloads"
        <*> parseField "templates"
        <*> parseField "prestartCommand"
        <*> parseField "startCommand"
        <*> parseField "stopCommand"
        <*> parseFieldDef "configSources" (stringMapFromList [])