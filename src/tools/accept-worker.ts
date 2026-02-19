import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const acceptWorkerTool = {
  name: "accept_worker",
  description: "Accept a worker's application for your gig",
  inputSchema: {
    type: "object",
    properties: {
      application_id: {
        type: "string",
        description: "The application ID to accept"
      }
    },
    required: ["application_id"]
  }
};

export const executeAcceptWorker: ToolExecutor = async (params) => {
  const result = await apiClient.updateApplication(params.application_id, "accepted");

  if (!result.success) {
    return {
      status: "error",
      error: result.error
    };
  }

  return {
    status: "success",
    message: "Worker accepted! They will be notified and can start work.",
    application: (result.data as any)?.application
  };
};
