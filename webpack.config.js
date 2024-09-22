const path = require('path');

module.exports = {
    entry: './public/js/songvisualizer.js', 
    output: {
        filename: 'bundle.js', 
        path: path.resolve(__dirname, 'public/js'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', 
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    mode: 'development' // Use 'production' for production builds
};
