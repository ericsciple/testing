#!/bin/bash

set -ex

echo ''
echo ----------------------------------------
echo Dumping info about file system
echo ----------------------------------------
df

echo ''
echo ----------------------------------------
echo Installing dependencies
echo ----------------------------------------
apt update
apt -y install curl
apt -y install gcc

echo ''
echo ----------------------------------------
echo Downloading c program
echo ----------------------------------------
mkdir -p /temp
cd /temp
curl -L -O https://raw.githubusercontent.com/ericsciple/testing/main/copy-file/copy-file.c

echo ''
echo ----------------------------------------
echo Compiling copy program
echo ----------------------------------------
gcc copy-file -o copy-file

echo ''
echo ----------------------------------------
echo Preparing files directory
echo ----------------------------------------
rm -rf /temp/files || true
mkdir /temp/files

echo ''
echo ----------------------------------------
echo Copying /etc/hosts to /temp/files/copy-1
echo ----------------------------------------
./copy-file /etc/hosts /temp/files/copy-1

echo ''
echo ----------------------------------------
echo Copying /temp/files/copy-1 to /temp/files/copy-2
echo ----------------------------------------
./copy-file /temp/files/copy-1 /temp/files/copy-2
