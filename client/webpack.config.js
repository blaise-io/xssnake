const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: __dirname + "/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "client.js",
        path: __dirname + "/../build",
    },
    plugins: [
        new webpack.DefinePlugin({
            __IS_CLIENT__: true,
        }),
        new HtmlWebpackPlugin({
            template: __dirname + "/client.ejs"
        }),
    ],
};
