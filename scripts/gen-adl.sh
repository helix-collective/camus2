#!/bin/bash
set -ex

SCRIPT_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$SCRIPT_DIR/..
ADLC=$SCRIPT_DIR/adlc

if [ -z "${ADL_STDLIB_SYS_FILES:-}" ] ; then
  ADL_STDLIB_SYS_FILES=$($SCRIPT_DIR/adlc-stdlib | grep sys | grep -v adlast | grep -v annotations | grep -v dynamic)
fi

# The ADL compilers internal copy of the standard library
if [ -z "${ADL_STDLIB_DIR:-}" ] ; then
  ADL_STDLIB_DIR=$($ADLC show --adlstdlib)
fi

APP_ADL_DIR=$ROOT/adl
APP_ADL_FILES=`find $APP_ADL_DIR -iname '*.adl'`

rm -rf $ROOT/src/ADL
${ADLC} haskell \
    -O $ROOT/src \
    --package=ADL \
    --rtpackage=ADL.Core \
    --include-rt \
    --searchdir $APP_ADL_DIR \
    --searchdir $ADL_STDLIB_DIR \
    ${APP_ADL_FILES} \
    ${ADL_STDLIB_SYS_FILES}
