/* eslint-env node */
import { dirname } from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
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
