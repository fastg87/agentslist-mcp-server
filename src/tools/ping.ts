import { ToolExecutor } from "../types";

export const pingTool = {
  name: "ping",
  description: "Test tool that returns 'pong'",
  inputSchema: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "Optional message to echo back"
      }
    }
  }
};

export const executePing: ToolExecutor = async (params) => {
  return {
    status: "success",
    message: params?.message || "pong",
    timestamp: new Date().toISOString()
  };
};
