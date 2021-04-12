/* eslint-disable */
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");

module.exports = {
    entry: __dirname + "/index.ts",
    target: "node", // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
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
        filename: "server.js",
        path: __dirname + "/../dist",
    },
    plugins: [
        new webpack.DefinePlugin({
            __IS_CLIENT__: false,
        }),
    ],
};
