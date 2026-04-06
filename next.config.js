const withPlugins = require("next-compose-plugins");
const withVideos = require("next-videos");
const withImages = require("next-images");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withPlugins(
    [
        [withVideos, {}],
        [withImages, {}],
        [withBundleAnalyzer, {}],
    ],
    {
        images: {
            unoptimized: true,
            disableStaticImages: true,
        },
        exportTrailingSlash: true,
        compress: true,
    },
);
