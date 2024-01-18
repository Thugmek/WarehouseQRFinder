#!/bin/bash

export NODE_OPTIONS=--openssl-legacy-provider
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

npm run --prefix "$parent_path/../Frontend/react-bootstrap" build

rm -rf /var/www/
ls "$parent_path/../Frontend/react-bootstrap/build/"
cp -r "$parent_path/../Frontend/react-bootstrap/build" /var/www
