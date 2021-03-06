const webpack = require('webpack');

module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production' ? '/vue-bodypix-test/' : '/',
  configureWebpack: {
    resolve: {
      alias: {
        videojs: 'video.js',
        WaveSurfer: 'wavesurfer.js',
        RecordRTC: 'recordrtc',
      },
    },
    plugins: [new webpack.ProvidePlugin({})],
  },
};
