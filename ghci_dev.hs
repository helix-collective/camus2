
-- Run in hx-deploy-tool$ stack --docker ghci
-- :script ghci_dev.hs

-- use shorter prompt (as opposed to showing all the imported modules on each prompt)
:set prompt  "$: "
:set prompt-cont  "| "

import qualified ADL.Sys.Types as ST
import qualified Data.Map as M
import qualified Data.Set as S
import qualified ADL.Types
import qualified ADL.Core.StringMap as SM
import qualified Data.Text as T
import qualified ADL.Sys.Types as ST

import ADL.Config(ToolConfig(..), DeployMode(..), ProxyModeConfig(..), DynamicConfigOptions(..), DynamicJsonSource(..), JsonSource(..))
import ADL.Types(DynamicConfigName, StringKeyMap, DynamicConfigMode, DeployLabel, ReleaseLabel)
import ADL.Release(ReleaseConfig(..))
import ADL.Core(adlFromJsonFile')

import Data.List(sortOn)
import Data.Maybe(fromMaybe)
import Data.Monoid
import Data.Foldable(for_)
import Data.Time.Clock.POSIX(getCurrentTime)
import Data.Traversable(for)
import Types(IOR, REnv(..), getToolConfig, scopeInfo)
import Util(unpackRelease, fetchConfigContext, jsrcLabel)
import Util.Aws(mkAwsEnv)
import Commands.ProxyMode.LocalState(nginxConfTemplate)

type DynamicConfigSources = (StringKeyMap DynamicConfigName DynamicJsonSource)

:{
demoFunc :: T.Text -> T.Text -> T.Text
demoFunc a b = b
:}
