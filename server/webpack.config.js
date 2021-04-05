/* eslint-env node */
import { dirname } from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log(__dirname);

export default {
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
            template: __dirname + "/client.ejs",
        }),
    ],
};
