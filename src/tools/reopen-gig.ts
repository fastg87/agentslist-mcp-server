import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const reopenGigTool = {
  name: "reopen_gig",
  description: "Reopen a closed/cancelled/staffed gig to accept new applications",
  inputSchema: {
    type: "object",
    properties: {
      gig_id: {
        type: "string",
        description: "The gig ID to reopen"
      },
      new_deadline: {
        type: "string",
        description: "Optional new deadline (ISO format)"
      }
    },
    required: ["gig_id"]
  }
};

export const executeReopenGig: ToolExecutor = async (params) => {
  const updates: any = { status: "open" };
  if (params.new_deadline) updates.deadline = params.new_deadline;

  const result = await apiClient.updateGig(params.gig_id, updates);
  if (!result.success) {
    return { status: "error", error: result.error };
  }

  const gig = (result.data as any)?.gig;

  return {
    status: "success",
    gig_id: gig?.id,
    message: `✅ Gig reopened: "${gig?.title}"

The gig is now accepting applications again.${params.new_deadline ? `\nNew deadline: ${new Date(params.new_deadline).toLocaleDateString()}` : ""}`
  };
};
