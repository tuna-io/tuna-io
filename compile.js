var webpack = require('webpack');
var path = require('path');
var toml = require('toml');
var fs = require('fs');
var config = toml.parse(String(fs.readFileSync('config.toml')));

var plugins = [];
var entries = [
  path.join(__dirname, 'client/src', config.client.entry)
];
var publicPath = path.join('/', config.common.static, '/');
var styleLoader; // set dynamically based on if we're in hot mode 

// if the hot setting is set, inject the clientside code
if (config.common.hot) {
  if (!Object.prototype.hasOwnProperty.call(config.common, 'hmr')) {
    throw 'Cannot run hot mode without a hmr server. (hint: set the hmr config option)';
  }
  if (!Object.prototype.hasOwnProperty.call(config.common, 'env') || config.common.env !== 'development') {
    throw 'Cannot run hot mode in production';
  }
  entries.push('webpack-hot-middleware/client?path=http://' + path.join(config.common.hmr, '__webpack_hmr'));
  plugins.push(new webpack.optimize.OccurenceOrderPlugin());
  plugins.push(new webpack.HotModuleReplacementPlugin());
  plugins.push(new webpack.NoErrorsPlugin());

  // update the public path to serve from the hmr server  
  publicPath = 'http://' + path.join(config.common.hmr, '/', config.common.static, '/');
  // the default method of style loading can be used in hot mode
  styleLoader = {
    test: /\.s?css$/,
    loaders: ['style', 'css', 'sass']
  };
} else {
  // set the env var programmatically - this is required for react-transform-hmr
  process.env.NODE_ENV = 'production';
  // when in production we will save the css bundle so we don't need webpack in production, etc.
  var extractCss = require('extract-text-webpack-plugin');
  styleLoader = {
    test: /\.s?css$/,
    loader: extractCss.extract('style', 'css!sass')
  };
  // and push the extract plugin
  plugins.push(new extractCss(config.common.style));
  // minimize javascript
  plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {}}))
}

var webpackConfig = {
  entry: entries,
  output: {
    path: path.join(__dirname, config.common.static),
    publicPath: publicPath,
    filename: config.common.js
  },
  plugins: plugins,
  module: {
    loaders: [
      styleLoader, {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'client/src'),
        exclude: './node_modules',
        loaders: ['babel-loader']
      },
    ]
  }
};

var compiler = webpack(webpackConfig);

if (config.common.hot) {
  // our hot reload server
  var app = require('express')();

  // this middleware gives memory-fs capabilities to webpack
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  }));

  // this middleware serves hot bundles via EventSource
  app.use(require('webpack-hot-middleware')(compiler));

  // parse the host/port from config
  var host, port, parts;
  parts = config.server.address.split(':');
  host = parts[0];
  port = parseInt(parts[1]) + 1;

  // start up the server
  app.listen(port, host, function(err) {
    if (typeof err !== 'undefined') {
      console.log('HMR server bootstrap err: ' + err);
      return;
    }
  });
} else {
  compiler.watch({}, function(err, stats) {
    console.log(stats.toString({
      colors: true,
    }))
  });
}
