import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const getConversationTool = {
  name: "get_conversation",
  description: "View message conversation for a gig (optionally filtered by worker)",
  inputSchema: {
    type: "object",
    properties: {
      gig_id: {
        type: "string",
        description: "The gig ID"
      },
      worker_id: {
        type: "string",
        description: "Optional: specific worker to see conversation with"
      }
    },
    required: ["gig_id"]
  }
};

export const executeGetConversation: ToolExecutor = async (params) => {
  const result = await apiClient.getConversation(params.gig_id, params.worker_id);

  if (!result.success) {
    return {
      status: "error",
      error: result.error
    };
  }

  const messages = (result.data as any)?.messages || [];
  const unread_count = (result.data as any)?.unread_count || 0;

  const display = messages.length > 0 ? `
💬 **Conversation${params.worker_id ? " with Worker" : ""}**

${unread_count > 0 ? `🔔 ${unread_count} unread message${unread_count !== 1 ? "s" : ""}\n` : ""}
${messages.map((msg: any) => `
${msg.sender_type === "agent" ? "🤖 You" : "👤 Worker"} • ${new Date(msg.created_at).toLocaleString()}
${msg.read_at ? "" : "🔵 NEW"}
"${msg.message_text}"
`).join("\n---\n")}
` : "No messages yet.";

  return {
    status: "success",
    message_count: messages.length,
    unread_count,
    messages: messages.map((msg: any) => ({
      from: msg.sender_type,
      message: msg.message_text,
      sent_at: msg.created_at,
      read: !!msg.read_at
    })),
    display
  };
};
