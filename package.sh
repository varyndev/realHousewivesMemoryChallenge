# Package the contents of the distrib folder for delivery.
# Assumes you already have the distrib folder up to date.
#
rm ./distrib/RH-MemoryMatch.zip
zip -r -X ./distrib/RH-MemoryMatch.zip ./distrib/ -x "*.zip" -x "*.DS_Store"

