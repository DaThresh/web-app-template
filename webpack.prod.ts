import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { merge } from 'webpack-merge';
import { config } from './webpack.common';

export default merge(config, {
  mode: 'production',
  entry: ['./client/index.tsx'],
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
});
