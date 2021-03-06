import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as webpack from "webpack";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as TerserPlugin from "terser-webpack-plugin";

module.exports = (env, argv) => {
    return {
        entry: __dirname + "/index.ts",
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: "ts-loader",
                    sideEffects: false,
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
        devtool: env.mode === "production" ? "source-map" : "cheap-source-map",
        output: {
            filename: "client.js",
            path: __dirname + "/../../dist",
        },
        optimization: {
            minimize: argv.mode === "production",
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        mangle: {
                            properties: true,
                        },
                        toplevel: true,
                        module: true,
                        rename: true,
                    },
                }),
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                ENV_DEBUG: argv.mode === "development",
                ENV_IS_CLIENT: true,
                ENV_VERSION: JSON.stringify(process.env.npm_package_version),
            }),
            new MiniCssExtractPlugin(),
            new HtmlWebpackPlugin({
                template: __dirname + "/index.ejs",
            }),
        ],
    };
};
