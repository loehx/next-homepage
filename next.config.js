const withPlugins = require("next-compose-plugins");
const withVideos = require("next-videos");
const withImages = require("next-images");

module.exports = withPlugins(
    [
        [withVideos, {}],
        [withImages, {}],
    ],
    {
        images: {
            loader: "akamai",
            path: "",
            disableStaticImages: true,
        },
        exportTrailingSlash: true,
        target: "serverless",
    },
);
