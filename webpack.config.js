const path = require('path');
const tsImportPluginFactory = require('ts-import-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackBar = require('webpackbar');
const webpack = require('webpack');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const smp = new SpeedMeasurePlugin();
const chalk = require('chalk');
const isDev = process.env.NODE_ENV === 'development';
module.exports = smp.wrap({
  mode: isDev ? 'development' : 'production',
  entry: {
    content_script: path.resolve(__dirname, './src/content_script.ts'),
    background: path.resolve(__dirname, './src/background.ts'),
    sidepanel: path.resolve(__dirname, './src/sidepanel.ts')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: './'
  },
  devServer: {
    compress: true,
    port: 9000
  },
  devtool: 'inline-source-map',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['...', '.ts', '.tsx', '.js', 'less', 'vue']
  },
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          // appendTsSuffixTo: [/.vue$/],
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [
              tsImportPluginFactory([
                {
                  style: false,
                  libraryName: 'lodash',
                  libraryDirectory: null,
                  camel2DashComponentName: false
                },
                { style: true }
              ])
            ]
          }),
          compilerOptions: {
            module: 'esnext'
          }
        },
        exclude: /node_modules/
      },
      {
        test: /.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          {
            loader: 'style-loader' // creates style nodes from JS strings
          },
          {
            loader: 'css-loader' // translates CSS into CommonJS
          },
          {
            loader: 'less-loader', // compiles Less to CSS
            options: {
              lessOptions: {
                modifyVars: {
                  '@body-background': '#f5f5f5'
                },
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './manifest.json' },
        // { from: './src/styles/', to: path.resolve(__dirname, './dist/styles') },
        { from: './resource/', to: path.resolve(__dirname, './dist/resource') }
      ]
    }),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      minify: false,
      chunks: ['sidepanel']
    }),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    }),
    // 热更新替换
    new webpack.HotModuleReplacementPlugin(),
    new WebpackBar({
      color: '#0049b0', // 默认green，进度条颜色支持HEX
      basic: true, // 默认true，启用一个简单的日志报告器
      profile: false, // 默认false，启用探查器。
      reporter: {
        change() {
          console.log(chalk.blue.bold('文件修改，重新编译'));
        },
        afterAllDone() {
          console.log(
            chalk.bgWhiteBright.green('编译完成，请在浏览器扩展页面加载 dist 目录进行调试')
          );
        }
      }
    }),
    new CleanWebpackPlugin({
      dry: true
    }),
    new BundleAnalyzerPlugin()
  ],
  watchOptions: {
    // 设置不监听的⽂件或⽂件夹，默认为空
    ignored: /node_modules/,
    // ⽂件改变不会⽴即执⾏，⽽是会等待300ms之后再去执⾏
    aggregateTimeout: 300,
    // 原理是轮询系统⽂件有⽆变化再去更新的，默认1秒钟轮询1000次
    poll: 1000
  }
});
