#!/bin/bash

set -e
set -x

rm -rf /temp/copy-files || true
mkdir -p /temp/copy-files

/temp/node-v16.13.1-linux-x64/bin/node -e "fs=require('fs'); fs.copyFileSync('$1', '/temp/copy-files/copy-1'); "
stat /temp/copy-files/copy-1
diff "$1" /temp/copy-files/copy-1

/temp/node-v16.13.1-linux-x64/bin/node -e "fs=require('fs'); fs.copyFileSync('/temp/copy-files/copy-1', '/temp/copy-files/copy-2'); "
stat /temp/copy-files/copy-2
diff /temp/copy-files/copy-1 /temp/copy-files/copy-2

echo done
