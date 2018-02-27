#!/bin/bash
./script/start-chrome-headless.sh &
echo 'start plum...'
node index.js &