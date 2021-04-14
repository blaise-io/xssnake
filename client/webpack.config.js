/* eslint-disable */
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: __dirname + "/index.ts",
    optimization: {
        minimize: !!process.env.production,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: {
                        toplevel: true,
                        properties: true,
                    },
                    module: true,
                    rename: true,
                },
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
            },
            {
                test: /\.(png|mp3|ogg)$/,
                type: "asset/inline",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts"],
        roots: [__dirname + "/client", __dirname + "/shared"],
    },
    output: {
        filename: "client.js",
        path: __dirname + "/../dist",
    },
    plugins: [
        new webpack.DefinePlugin({
            __IS_CLIENT__: true,
        }),
        new HtmlWebpackPlugin({
            template: __dirname + "/index.ejs",
        }),
    ],
};
