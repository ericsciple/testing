#!/bin/sh

printenv | sort

echo '****************************************'

cp /eslint-compact.json "$HOME/"
echo "::add-matcher::$HOME/eslint-compact.json"