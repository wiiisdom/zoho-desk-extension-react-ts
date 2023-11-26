/*
Copyright (c) 2017, ZOHO CORPORATION
License: MIT
*/

var express = require('express');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var morgan = require('morgan');
var serveIndex = require('serve-index');
var https = require('https');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var manifest = require('../plugin-manifest.json');
var { moduleSupport } = manifest;

process.env.PWD = process.env.PWD || process.cwd();

var expressApp = express();
var port = 5000;

if (moduleSupport) {
  var devMiddleware = require('webpack-dev-middleware');
  var webpack = require('webpack');
  var getWebpackConfig = require('../webpack.config.js');
  var compiler = webpack(getWebpackConfig('development'));

  expressApp.use(
    devMiddleware(compiler, {
      publicPath: '/app/'
    })
  );
}

expressApp.set('port', port);
expressApp.use(morgan('dev'));
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: false }));
expressApp.use(errorHandler());

expressApp.use('/', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let connectSrc = '';
  let manifest = fs
    .readFileSync(path.join(__dirname, '..', 'plugin-manifest.json'))
    .toString();
  manifest = JSON.parse(manifest);
  if (
    manifest != null &&
    manifest.cspDomains != null &&
    manifest.cspDomains['connect-src'] != null
  ) {
    let connectDomains = manifest.cspDomains['connect-src'];
    if (validateDomains(connectDomains)) {
      console.log(
        chalk.bold.red(
          connectDomains + ' - found to be invalid URL(s) in connect-src'
        )
      );
      next();
      return false;
    }
    connectSrc = connectDomains.join(' ');
  }
  res.setHeader(
    'Content-Security-Policy',
    'connect-src https://*.zohostatic.com https://*.sigmausercontent.com ' +
      connectSrc
  );
  next();
});

expressApp.get('/plugin-manifest.json', function (req, res) {
  let newManifest = fs
    .readFileSync(path.join(__dirname, '..', 'plugin-manifest.json'))
    .toString();
  newManifest = JSON.parse(newManifest);
  let projectName = path.dirname(__dirname).split(path.sep).pop();
  newManifest.name = projectName;
  res.send(newManifest);
});

expressApp.get('/resources.json', function (req, res) {
  var resourceJson = path.join(__dirname, '..', 'resources.json');
  if (fs.existsSync(resourceJson)) {
    res.sendFile(resourceJson);
  } else {
    res.send({});
  }
});

expressApp.use('/app', express.static('app'));
expressApp.use('/app', serveIndex('app'));

expressApp.get('/', function (req, res) {
  res.redirect('/app');
});

var options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

https
  .createServer(options, expressApp)
  .listen(port, function () {
    console.log(chalk.green('Zet running at ht' + 'tps://127.0.0.1:' + port));
    console.log(
      chalk.bold.cyan(
        'Note: Please enable the host (https://127.0.0.1:' +
          port +
          ') in a new tab and authorize the connection by clicking Advanced->Proceed to 127.0.0.1 (unsafe).'
      )
    );
    if (moduleSupport) {
      console.log(chalk.green('Webpack is compiling...'));
    }
  })
  .on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
      console.log(chalk.bold.red(port + ' port is already in use'));
    }
  });

function validateDomains(domainsList) {
  var invalidURLs = domainsList.filter(function (domain) {
    return !isValidURL(domain);
  });

  return invalidURLs && invalidURLs.length > 0;
}

function isValidURL(url) {
  try {
    var parsedURL = new URL(url);
    if (
      parsedURL.protocol !== 'http' + ':' &&
      parsedURL.protocol !== 'https' + ':' &&
      parsedURL.protocol !== 'wss' + ':'
    ) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
}
