#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

set -x

SCRIPT_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$SCRIPT_DIR/..
ADLC=$SCRIPT_DIR/adlc

APP_ADL_DIR=$ROOT/adl
APP_ADL_FILES=`find $APP_ADL_DIR -iname '*.adl'`

${ADLC} haskell \
    -O $ROOT/src \
    --package=ADL \
    --rtpackage=ADL.Core \
    --include-rt \
    --searchdir $APP_ADL_DIR \
    --manifest=$ROOT/src/ADL/.manifest \
    ${APP_ADL_FILES}


# Generate Typescript for unit testing code
OUTPUT_DIR=$ROOT/test/adl-gen
$ADLC typescript \
  --searchdir $APP_ADL_DIR \
  --outputdir $OUTPUT_DIR \
  --manifest=$OUTPUT_DIR/.manifest \
  --include-rt \
  --include-resolver \
  --runtime-dir runtime \
  ${ADL_STDLIB_SYS_FILES} \
  $APP_ADL_FILES
