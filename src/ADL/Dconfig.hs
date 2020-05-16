{-# LANGUAGE OverloadedStrings #-}
module ADL.Dconfig(
    ConfigNameJsonSourceMap,
    ConfigSource(..),
    DynamicConfigMode,
    DynamicConfigName,
    DynamicConfigNameJSrcMap,
    DynamicConfigNameMode(..),
    DynamicConfigNameModeMap,
    DynamicConfigOptions,
    DynamicJsonSource(..),
    JsonSource(..),
    mkDynamicConfigNameMode,
    mkDynamicJsonSource,
) where

import ADL.Core
import Control.Applicative( (<$>), (<*>), (<|>) )
import Prelude( ($) )
import qualified ADL.Sys.Types
import qualified ADL.Types
import qualified Data.Aeson as JS
import qualified Data.HashMap.Strict as HM
import qualified Data.Proxy
import qualified Data.Text as T
import qualified Prelude

type ConfigNameJsonSourceMap = (ADL.Types.StringKeyMap ADL.Types.ConfigName JsonSource)

data ConfigSource
    = Cs_static ADL.Types.ConfigName
    | Cs_dynamic DynamicConfigNameMode
    deriving (Prelude.Eq,Prelude.Ord,Prelude.Show)

instance AdlValue ConfigSource where
    atype _ = "dconfig.ConfigSource"
    
    jsonGen = genUnion (\jv -> case jv of
        Cs_static v -> genUnionValue "static" v
        Cs_dynamic v -> genUnionValue "dynamic" v
        )
    
    jsonParser = parseUnion $ \disc -> case disc of
        "static" ->  parseUnionValue Cs_static
        "dynamic" ->  parseUnionValue Cs_dynamic
        _ -> parseFail "expected a discriminator for ConfigSource (static,dynamic)" 

type DynamicConfigMode = T.Text

type DynamicConfigName = ADL.Types.ConfigName

type DynamicConfigNameJSrcMap = (ADL.Types.StringKeyMap DynamicConfigName DynamicJsonSource)

data DynamicConfigNameMode = DynamicConfigNameMode
    { dynamicConfigNameMode_name :: DynamicConfigName
    , dynamicConfigNameMode_mode :: DynamicConfigMode
    }
    deriving (Prelude.Eq,Prelude.Ord,Prelude.Show)

mkDynamicConfigNameMode :: DynamicConfigName -> DynamicConfigMode -> DynamicConfigNameMode
mkDynamicConfigNameMode name mode = DynamicConfigNameMode name mode

instance AdlValue DynamicConfigNameMode where
    atype _ = "dconfig.DynamicConfigNameMode"
    
    jsonGen = genObject
        [ genField "name" dynamicConfigNameMode_name
        , genField "mode" dynamicConfigNameMode_mode
        ]
    
    jsonParser = DynamicConfigNameMode
        <$> parseField "name"
        <*> parseField "mode"

type DynamicConfigNameModeMap = (ADL.Types.StringKeyMap DynamicConfigName DynamicConfigMode)

type DynamicConfigOptions = (ADL.Types.StringKeyMap DynamicConfigName (ADL.Sys.Types.Set DynamicConfigMode))

data DynamicJsonSource = DynamicJsonSource
    { djsrc_defaultMode :: DynamicConfigMode
    , djsrc_modes :: (ADL.Types.StringKeyMap DynamicConfigMode JsonSource)
    }
    deriving (Prelude.Eq,Prelude.Ord,Prelude.Show)

mkDynamicJsonSource :: DynamicConfigMode -> (ADL.Types.StringKeyMap DynamicConfigMode JsonSource) -> DynamicJsonSource
mkDynamicJsonSource defaultMode modes = DynamicJsonSource defaultMode modes

instance AdlValue DynamicJsonSource where
    atype _ = "dconfig.DynamicJsonSource"
    
    jsonGen = genObject
        [ genField "defaultMode" djsrc_defaultMode
        , genField "modes" djsrc_modes
        ]
    
    jsonParser = DynamicJsonSource
        <$> parseField "defaultMode"
        <*> parseField "modes"

data JsonSource
    = Jsrc_file ADL.Types.FilePath
    | Jsrc_s3 ADL.Types.S3Path
    | Jsrc_awsSecretArn T.Text
    deriving (Prelude.Eq,Prelude.Ord,Prelude.Show)

instance AdlValue JsonSource where
    atype _ = "dconfig.JsonSource"
    
    jsonGen = genUnion (\jv -> case jv of
        Jsrc_file v -> genUnionValue "file" v
        Jsrc_s3 v -> genUnionValue "s3" v
        Jsrc_awsSecretArn v -> genUnionValue "awsSecretArn" v
        )
    
    jsonParser = parseUnion $ \disc -> case disc of
        "file" ->  parseUnionValue Jsrc_file
        "s3" ->  parseUnionValue Jsrc_s3
        "awsSecretArn" ->  parseUnionValue Jsrc_awsSecretArn
        _ -> parseFail "expected a discriminator for JsonSource (file,s3,awsSecretArn)" 