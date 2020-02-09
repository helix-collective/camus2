
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

type X = (ADL.Types.StringKeyMap ADL.Types.DeployLabel (ADL.Types.StringKeyMap ADL.Types.DynamicConfigName ADL.Types.DynamicConfigMode))

dconfigs_old = SM.fromList [ (T.pack "deployA", SM.fromList [(T.pack "name", T.pack "mode")]), (T.pack "deployB", SM.fromList [(T.pack "name", T.pack "mode")]) ]
dconfigs_new = SM.fromList [ (T.pack "deployA", SM.fromList [(T.pack "name", T.pack "mode2")]), (T.pack "deployB", SM.fromList [(T.pack "name", T.pack "mode")]) ]

:{
makepair :: kx -> ky -> (kx,ky)
makepair x y = (x,y)
:}

:{
demoFunc :: T.Text -> T.Text -> T.Text
demoFunc a b = b
:}
