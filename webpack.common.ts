import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration } from 'webpack';

export default {
  output: {
    filename: 'bundle-[name].js',
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
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
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
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
          },
        ],
      },
      {
        test: /\.txt$/,
        use: 'raw-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './client/index.html'),
    }),
  ],
  stats: 'minimal',
} as Configuration;
