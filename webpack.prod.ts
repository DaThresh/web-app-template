import { merge } from 'webpack-merge';
import common from './webpack.common';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

export default merge(common, {
  mode: 'production',
  entry: ['./client/index.tsx'],
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              'imagemin-gifsicle',
              'imagemin-jpegtran',
              'imagemin-optipng',
              'imagemin-svgo',
            ],
          },
        },
        loader: false,
      }),
    ],
  },
});
