import { merge } from 'webpack-merge';
import webpack, { Configuration } from 'webpack';
import common from './webpack.common';

export default merge(common, {
  mode: 'development',
  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=5000&reload=true',
    'react-hot-loader/patch',
    './client/index.tsx',
  ],
  devtool: 'eval-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
} as Configuration);
