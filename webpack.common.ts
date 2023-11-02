import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { Configuration } from 'webpack';

export const config: Configuration = {
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './dist/public'),
    publicPath: '/',
  },
  resolve: {
    modules: ['./client', './node_modules'],
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    preferRelative: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        exclude: /node_modules/,
        use: { loader: 'ts-loader' },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader', { loader: 'image-webpack-loader' }],
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ title: 'Production' })],
  stats: 'summary',
};
