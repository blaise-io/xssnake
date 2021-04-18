/* eslint-disable */
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// TODO: Copy favicon

module.exports = {
    entry: __dirname + "/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
            },
            {
                test: /\.(png|mp3|ogg|woff)$/,
                type: "asset/inline",
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: [".ts"],
    },
    output: {
        filename: "client.js",
        path: __dirname + "/../../dist",
    },
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
    plugins: [
        new webpack.DefinePlugin({
            ENV_IS_CLIENT: true,
            ENV_VERSION: JSON.stringify(process.env.npm_package_version),
        }),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: __dirname + "/index.ejs",
        }),
    ],
};
