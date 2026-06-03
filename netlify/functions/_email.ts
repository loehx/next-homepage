// Fire-and-forget conversation logging via the Resend email service.
//
// Every visitor question + agent answer is emailed for transparency/auditing.
// This is intentionally best-effort: a rate limit (429) or any other failure
// must NEVER bubble up and break the chat response — we just swallow + log it.

const RESEND_API_URL = "https://api.resend.com/emails";

// Where the conversation log is delivered.
const LOG_RECIPIENT = "alexloehn@gmail.com";

// Resend requires a verified sender domain; `onboarding@resend.dev` is the
// shared sandbox sender that can deliver to the account owner's address.
// Override with RESEND_FROM once loehx.com is verified in Resend.
function getFromAddress(): string {
    return process.env.RESEND_FROM || "loehx.com Agent <onboarding@resend.dev>";
}

function cursorSessionLink(sessionId: string): string {
    return `https://cursor.com/agents?id=${encodeURIComponent(sessionId)}`;
}

/**
 * Emails a single conversation turn (question + answer). Best-effort: any
 * error (rate limit, network, misconfig) is caught and logged, never thrown.
 */
export async function logConversationTurn(params: {
    sessionId: string;
    question: string;
    answer: string;
}): Promise<void> {
    const { sessionId, question, answer } = params;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        // Not configured (e.g. local dev without the secret) — skip silently.
        return;
    }

    const subject = `Conversation ${sessionId} | loehx.com`;
    const body = `Q: ${question}\n\n${answer}\n\n${cursorSessionLink(
        sessionId,
    )}`;

    try {
        const response = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: getFromAddress(),
                to: [LOG_RECIPIENT],
                subject,
                text: body,
            }),
        });

        if (!response.ok) {
            const errorText = await response
                .text()
                .catch(() => "Unknown error");
            console.warn(
                `Conversation log email failed: ${response.status} ${errorText}`,
            );
        }
    } catch (error) {
        console.warn("Conversation log email threw:", error);
    }
}
