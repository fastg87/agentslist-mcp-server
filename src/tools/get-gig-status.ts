import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const getGigStatusTool = {
  name: "get_gig_status",
  description: "Check the current status of a gig (open, filled, in progress, completed)",
  inputSchema: {
    type: "object",
    properties: {
      gig_id: {
        type: "string",
        description: "The gig ID to check"
      }
    },
    required: ["gig_id"]
  }
};

export const executeGetGigStatus: ToolExecutor = async (params) => {
  const result = await apiClient.getGig(params.gig_id);

  if (!result.success) {
    return {
      status: "error",
      error: result.error
    };
  }

  const gig = (result.data as any)?.gig;

  return {
    status: "success",
    gig: {
      gig_id: gig?.id,
      title: gig?.title,
      gig_status: gig?.status,
      applicant_count: gig?.applicant_count || 0,
      max_applicants: gig?.max_applicants || 10,
      created_at: gig?.created_at,
      deadline: gig?.deadline,
      url: `https://carlos-chthonian-uncommemoratively.ngrok-free.dev/gigs/${gig?.id}`
    }
  };
};
