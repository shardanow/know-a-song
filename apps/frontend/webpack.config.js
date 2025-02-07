module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                fiber: false,
                // Use the modern Dart Sass API
                // This is just an example, adjust as needed
                includePaths: ['./src/styles'],
              },
            },
          },
        ],
      },
    ],
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // Add your custom middlewares here
      // Example:
      // devServer.app.use((req, res, next) => {
      //   console.log('Custom middleware');
      //   next();
      // });

      return middlewares;
    },
  },
};
