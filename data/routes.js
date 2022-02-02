const contentful = require("contentful");
const config = require("./config.json");

const client = contentful.createClient({
    accessToken: config.accessToken,
    space: config.space,
    environment: config.environment,
});

module.exports = async function generateRoutes() {
    const routeMap = {};

    const response = await client.getEntries({
        "sys.contentType.sys.id": "page",
    });

    response.items.forEach((item) => {
        const path =
            item.fields.slug[0] === "/"
                ? item.fields.slug
                : "/" + item.fields.slug;

        routeMap[path] = {
            page: "/",
            query: { id: item.sys.id },
        };
    });

    console.log("routeMap", routeMap);

    return routeMap;
};
