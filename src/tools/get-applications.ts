import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const getApplicationsTool = {
  name: "get_applications",
  description: "See who has applied to a specific gig with their profiles, ratings, and application messages",
  inputSchema: {
    type: "object",
    properties: {
      gig_id: {
        type: "string",
        description: "The gig ID to check applications for"
      }
    },
    required: ["gig_id"]
  }
};

export const executeGetApplications: ToolExecutor = async (params) => {
  const result = await apiClient.getApplications(params.gig_id);

  if (!result.success) {
    return {
      status: "error",
      error: result.error
    };
  }

  const applications = (result.data as any)?.applications || [];

  return {
    status: "success",
    count: applications.length,
    applications: applications.map((app: any) => ({
      application_id: app.id,
      worker: {
        name: app.profiles?.full_name || app.profiles?.username || "Anonymous",
        location: app.profiles?.location,
        rating: app.profiles?.average_rating || 0,
        total_gigs_completed: app.profiles?.total_gigs_completed || 0,
        trust_score: app.profiles?.trust_score || 0,
        verification_tier: app.profiles?.verification_tier || "unverified",
      },
      application: {
        status: app.status,
        message: app.message,
        estimated_completion: app.estimated_completion,
        applied_at: app.applied_at,
      }
    }))
  };
};
