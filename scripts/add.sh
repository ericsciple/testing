#!/bin/bash

set -e

scriptdir="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
node "$scriptdir/internal/add.js"
