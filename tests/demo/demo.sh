#!/bin/bash

echo "Emulating camus2 basics"

echo "Emulating dev and infra steps"
(cd development; ./dev.sh; ./infra.sh)


cd machine; cd opt/bin

echo "Emulating launch of a deploy on a machine"

echo
echo "./c2  #help"
./c2

echo
echo "./c2 start release-xx-yy-zz.zip:"
./c2 start release-xx-yy-zz.zip

echo
echo "./c2 show-config-modes"
./c2 show-config-modes

echo
echo "./c2 show-config-modes queue"
./c2 show-config-modes queue

echo
echo "./c2 show-config-modes processor"
./c2 show-config-modes processor

echo
echo "./c2 show-config-modes frontend"
./c2 show-config-modes frontend

echo
echo "./c2 reconfig release-xx-yy-zz.zip frontend offline"
./c2 reconfig release-xx-yy-zz.zip frontend offline

