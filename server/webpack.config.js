/* eslint-disable */
const webpack = require("webpack");

module.exports = {
    entry: __dirname + "/index.ts",
    target: "node",
    externals: ["ws"],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.png$/,
                type: "asset/inline",
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
