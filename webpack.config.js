const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js', // Entry point for your application
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'), // Output directory
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // Ensure this path matches your file location
        }),
    ],
    devServer: {
        static: path.resolve(__dirname, 'dist'), // Serve files from the output directory
        open: true, // Automatically open the browser
        compress: true, // Enable gzip compression
        port: 8080, // Set the development server port
    },
    module: {
        rules: [
            {
                test: /\.css$/i, // Handle CSS files
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|jpeg|svg|gif|ico)$/i, // Handle image and favicon files
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.json'], // Automatically resolve these extensions
    },
};
