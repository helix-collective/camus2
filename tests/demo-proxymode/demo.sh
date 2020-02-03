#!/bin/bash

echo "Emulating camus2 basics"

echo "Emulating dev and infra steps"
(cd development; ./dev.sh; ./infra.sh)


cd machine; cd opt/bin

echo "Emulating launch of a deploy on a machine"

echo
echo "./c2 start release-xx-yy-zz.zip:"
./c2 start release-xx-yy-zz.zip

echo "./c2 reconfig release-xx-yy-zz.zip queue inactive"
./c2 reconfig release-xx-yy-zz.zip queue inactive

#echo
#e#cho "./c2 stop release-xx-yy-zz.zip:"
#./c2 stop release-xx-yy-zz.zip
