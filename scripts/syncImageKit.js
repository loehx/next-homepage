const ImageKit = require("imagekit");
const fs = require("fs");
require("dotenv").config();

var imagekit = new ImageKit({
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
});

imagekit.listFiles({}, function (error, result) {
    if (error) return console.log(error);

    const files = [];
    for (const file of result) {
        const { width, height, url, filePath } = file;
        files.push({
            url: encodeURI(url),
            path: filePath,
            width,
            height,
        });
    }

    fs.writeFileSync("./imagekit.json", JSON.stringify(files, null, 3), {
        encoding: "utf8",
    });
});
