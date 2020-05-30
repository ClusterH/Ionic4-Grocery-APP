#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var ncp = require('ncp').ncp;

ncp.limit = 16;

var rootdir = process.argv[2];

var androidPath = path.join(rootdir, 'platforms', 'android');
if (fs.existsSync(androidPath))
    ncp(path.join(rootdir, 'hooks', 'after_prepare', 'copy', 'android'), androidPath);

var iosPath = path.join(rootdir, 'platforms', 'ios');
if (fs.existsSync(iosPath))
    ncp(path.join(rootdir, 'hooks', 'after_prepare', 'copy', 'ios'), iosPath);
