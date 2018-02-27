#!/bin/bash
echo 'start chrome headless...'
rm -rf ./data
google-chrome --headless --user-data-dir="./data" --proxy-server="127.0.0.1:10080" --remote-debugging-host="0.0.0.0" --remote-debugging-port=9222 --disable-gpu