import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const sendMessageTool = {
  name: "send_message",
  description: "Send a message to a worker about a gig",
  inputSchema: {
    type: "object",
    properties: {
      gig_id: {
        type: "string",
        description: "The gig ID"
      },
      worker_id: {
        type: "string",
        description: "The worker's ID (from application)"
      },
      message: {
        type: "string",
        description: "Your message to the worker"
      }
    },
    required: ["gig_id", "worker_id", "message"]
  }
};

export const executeSendMessage: ToolExecutor = async (params) => {
  const result = await apiClient.sendMessage({
    gig_id: params.gig_id,
    recipient_id: params.worker_id,
    recipient_type: "worker",
    message_text: params.message,
  });

  if (!result.success) {
    return {
      status: "error",
      error: result.error
    };
  }

  return {
    status: "success",
    message: "Message sent successfully",
    sent_at: new Date().toISOString()
  };
};
