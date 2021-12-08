#!/bin/bash

apt update
apt install xz-utils
apt install curl
mkdir /temp
cd /temp
curl -L -O https://nodejs.org/dist/v16.13.1/node-v16.13.1-linux-x64.tar.xz
tar -xf node-v16.13.1-linux-x64.tar.xz 
curl -L -O https://raw.githubusercontent.com/ericsciple/testing/master/copy-file/copy.sh
chmod +x copy.sh
