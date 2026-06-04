import { Handler } from "@netlify/functions";

const CACHE_MAX_AGE = 60;

export const handler: Handler = async (event) => {
    // CORS headers
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
        "Content-Type": "application/json",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    // Check if API key is configured
    const apiKey = process.env.CURSOR_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
                ok: false,
                error: "service_unconfigured",
                message: "AI service is not configured",
            }),
        };
    }

    // Optional: Test the API key with a lightweight call
    // This validates the key without spinning up an agent
    try {
        const response = await fetch("https://api.cursor.com/v1/models", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return {
                    statusCode: 503,
                    headers,
                    body: JSON.stringify({
                        ok: false,
                        error: "unauthorized",
                        message: "Invalid API key",
                    }),
                };
            }
            // For other errors, still report as available - the agent creation will handle specifics
            console.warn(`Cursor API health check warning: ${response.status}`);
        }
    } catch (error) {
        console.warn("Cursor API health check failed:", error);
        // Still return available - transient network issues shouldn't disable the UI
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            ok: true,
            message: "AI service is available",
        }),
    };
};
