import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { config } from './webpack.common';

export default merge(config, {
  mode: 'development',
  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=5000&reload=true',
    './client/index.tsx',
  ],
  devtool: 'eval-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
