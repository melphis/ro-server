#!/bin/bash

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../ && pwd )"

rm -rf $PROJECT_DIR/build/
mkdir -p $PROJECT_DIR/build/server
cp $PROJECT_DIR/server/package.json $PROJECT_DIR/build/server/
cp $PROJECT_DIR/server/parser.service $PROJECT_DIR/build

cd $PROJECT_DIR/server
rm -rf $PROJECT_DIR/dist
npm run build:webpack
mv $PROJECT_DIR/server/dist/ $PROJECT_DIR/build/server/

cd $PROJECT_DIR/build/server
npm install --only=prod

cd $PROJECT_DIR/client/
npm run build

cd $PROJECT_DIR/
mkdir build/client
mv client/dist/ build/client/

mv build parser
tar -czf buid.tar.gz parser
rm -rf parser
