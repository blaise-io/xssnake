import * as webpack from "webpack";

module.exports = (env, argv) => {
    return {
        entry: __dirname + "/index.ts",
        target: "node",
        externals: {
            ws: "commonjs2 ws",
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                    sideEffects: false,
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
        devtool: "source-map",
        output: {
            filename: "server.js",
            path: __dirname + "/../../dist",
        },
        plugins: [
            new webpack.DefinePlugin({
                ENV_IS_CLIENT: true,
                ENV_DEBUG: argv.mode === "production",
                ENV_VERSION: JSON.stringify(process.env.npm_package_version),
            }),
        ],
    };
};
