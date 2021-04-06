/* eslint-disable */
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: __dirname + "/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts"],
        roots: [__dirname + "/client", __dirname + "/shared"],
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
            template: __dirname + "/client.ejs",
        }),
    ],
};
