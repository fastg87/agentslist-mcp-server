import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const listGigsTool = {
  name: "list_my_gigs",
  description: "View all gigs you've posted and their current status (open, filled, in progress, etc.)",
  inputSchema: {
    type: "object",
    properties: {}
  }
};

export const executeListGigs: ToolExecutor = async () => {
  const result = await apiClient.listGigs();

  if (!result.success) {
    return {
      status: "error",
      error: result.error
    };
  }

  const gigs = (result.data as any)?.gigs || [];

  return {
    status: "success",
    count: gigs.length,
    gigs: gigs.map((gig: any) => ({
      gig_id: gig.id,
      title: gig.title,
      status: gig.status,
      applicant_count: gig.applicant_count || 0,
      max_applicants: gig.max_applicants || 10,
      pay: `${gig.pay_amount} ${gig.pay_type}`,
      posted_at: gig.created_at,
      url: `https://carlos-chthonian-uncommemoratively.ngrok-free.dev/gigs/${gig.id}`
    }))
  };
};
