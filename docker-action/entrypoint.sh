#!/bin/sh

printenv | sort

echo '****************************************'

cp /eslint-compact.json $RUNNER_TEMP/
echo "::add-matcher::$RUNNER_TEMP/eslint-compact.json"