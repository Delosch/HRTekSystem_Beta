import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

// TEMP MOCK (replace with real AI later)
export const action: ActionFunction = async ({ request }) => {
  const { message } = await request.json();

  if (!message) {
    return json({ error: "Message missing" }, { status: 400 });
  }

  // TODO: replace with your friend's chatbot
  return json({
    reply: `AI reply to: "${message}"`,
  });
};
