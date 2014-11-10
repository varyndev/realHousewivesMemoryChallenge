#!/bin/bash
# Package the contents of the distrib folder for delivery.
# Assumes you already have the distrib folder up to date.
# Reads the version out of the source file, makes the archive file based on todays date and the app version.
#
curdate=$(date +%Y%m%d)
version=$(grep 'GameVersion:' ./source/js/MemoryMatch.js | cut -d \" -f2)
filename=TC-${curdate}-${version}
rm -f ./distrib/${filename}.zip
zip -r -X ./distrib/${filename}.zip ./distrib/ -x "*.zip" -x "*.DS_Store"
