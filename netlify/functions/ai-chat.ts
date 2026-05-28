import { Handler } from "@netlify/functions";
import {
  createAgent,
  createRun,
  pollRunUntilComplete,
  extractJsonFromResult,
  CursorError,
} from "./_cursor";

interface ChatRequest {
  mode: "prewarm" | "ask";
  agentId?: string;
  text?: string;
}

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

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

  // Parse request body
  let body: ChatRequest;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!body.mode) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing mode parameter" }),
    };
  }

  try {
    if (body.mode === "prewarm") {
      // /v1/agents always enqueues an initial run; we use a no-op prompt so
      // the warmup work boots the VM without producing meaningful output.
      const agent = await createAgent("Initialize");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          agentId: agent.agentId,
          status: "ready",
        }),
      };
    }

    if (body.mode === "ask") {
      const { agentId, text } = body;

      if (!text) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Missing text parameter" }),
        };
      }

      let currentAgentId = agentId;
      let runId: string;
      let isNewAgent = false;

      if (!currentAgentId) {
        // First ask: create agent with the user's text as the initial run,
        // saving a round-trip (no separate /runs POST needed).
        const agent = await createAgent(text);
        currentAgentId = agent.agentId;
        runId = agent.runId;
        isNewAgent = true;
      } else {
        const run = await createRun(currentAgentId, text);
        runId = run.runId;
      }

      const result = await pollRunUntilComplete(currentAgentId, runId, {
        maxWaitMs: 25000,
        pollIntervalMs: 1000,
      });

      if (result.status === "ERROR") {
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({
            error: "agent_error",
            message: result.error || "Agent run failed",
            retryable: true,
            agentId: currentAgentId,
          }),
        };
      }

      if (result.status === "CANCELLED" || result.status === "EXPIRED") {
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({
            error: "cancelled",
            message: `Agent run ${result.status.toLowerCase()}`,
            retryable: true,
            agentId: currentAgentId,
          }),
        };
      }

      if (!result.result) {
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({
            error: "empty_response",
            message: "Agent returned empty response",
            retryable: true,
            agentId: currentAgentId,
          }),
        };
      }

      const parsed = extractJsonFromResult(result.result);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          agentId: currentAgentId,
          runId,
          answer: parsed.answer,
          suggestions: parsed.suggestions,
          lang: parsed.lang,
          isNewAgent,
        }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid mode" }),
    };
  } catch (error) {
    console.error("AI chat error:", error);

    if (error instanceof CursorError) {
      const statusCode = error.status >= 500 ? 502 : error.status;
      return {
        statusCode,
        headers,
        body: JSON.stringify({
          error: error.message.includes("Cold start timeout")
            ? "cold_start_timeout"
            : "cursor_api_error",
          message: error.message,
          retryable: error.retryable,
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "internal_error",
        message: "An unexpected error occurred",
        retryable: true,
      }),
    };
  }
};
