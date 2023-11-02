import webpack, { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import common from './webpack.common';

export default merge(common, {
  mode: 'development',
  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=5000&reload=true',
    './client/index.tsx',
  ],
  devtool: 'eval-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
} as Configuration);
