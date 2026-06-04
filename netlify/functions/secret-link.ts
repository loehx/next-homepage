import { Handler } from "@netlify/functions";
import secretLinksData from "../../data/content/secretLinks.json";

interface SecretLinkEntry {
    id: string;
    type: string;
    url: string;
    password: string;
}

const secretLinks = secretLinksData as SecretLinkEntry[];

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
};

function findByPassword(password: string): SecretLinkEntry | undefined {
    return secretLinks.find(
        (link) =>
            link.password.toLocaleLowerCase() === password.toLocaleLowerCase(),
    );
}

export const handler: Handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    let password = "";
    try {
        const body = JSON.parse(event.body || "{}");
        password =
            typeof body.password === "string"
                ? body.password
                : event.queryStringParameters?.password || "";
    } catch {
        password = event.queryStringParameters?.password || "";
    }

    if (!password.trim()) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing password" }),
        };
    }

    const match = findByPassword(password.trim());
    if (!match) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: "not found" }),
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            id: match.id,
            type: match.type,
            url: match.url,
        }),
    };
};
