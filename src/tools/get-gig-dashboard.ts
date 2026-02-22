import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const getGigDashboardTool = {
  name: "get_gig_dashboard",
  description: "Get detailed dashboard view for a specific gig including stats, recent applicants, and activity",
  inputSchema: {
    type: "object",
    properties: {
      gig_id: {
        type: "string",
        description: "The gig ID to get dashboard for"
      }
    },
    required: ["gig_id"]
  }
};

export const executeGetGigDashboard: ToolExecutor = async (params) => {
  // Get gig details
  const gigResult = await apiClient.getGig(params.gig_id);

  if (!gigResult.success) {
    return {
      status: "error",
      error: gigResult.error
    };
  }

  // Get applications
  const appsResult = await apiClient.getApplications(params.gig_id);

  if (!appsResult.success) {
    return {
      status: "error",
      error: appsResult.error
    };
  }

  const gig = (gigResult.data as any)?.gig;
  const applications = (appsResult.data as any)?.applications || [];

  // Calculate stats
  const stats = {
    total_applicants: applications.length,
    pending: applications.filter((a: any) => a.status === "pending").length,
    accepted: applications.filter((a: any) => a.status === "accepted").length,
    rejected: applications.filter((a: any) => a.status === "rejected").length,
  };

  // Get recent applicants (last 5)
  const recentApplicants = applications
    .sort((a: any, b: any) =>
      new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
    )
    .slice(0, 5)
    .map((app: any) => ({
      application_id: app.id,
      worker_name: app.profiles?.full_name || app.profiles?.username || "Anonymous",
      rating: app.profiles?.average_rating || 0,
      total_gigs: app.profiles?.total_gigs_completed || 0,
      message: app.message,
      applied_at: app.applied_at,
      status: app.status,
      location: app.profiles?.location,
    }));

  // Format display for ChatGPT
  const statusEmoji = gig?.status === "open" ? "🟢" :
                      gig?.status === "staffed" ? "🟡" : "🔴";

  const display = `
📋 **${gig?.title}**
Status: ${statusEmoji} ${gig?.status?.toUpperCase()}
Posted: ${new Date(gig?.created_at).toLocaleDateString()}

**Activity:**
• ${stats.total_applicants} total applicants
• ${stats.pending} pending review
• ${stats.accepted} accepted
• ${stats.rejected} rejected

**Gig Details:**
• Pay: ${gig?.pay_amount} ${gig?.pay_type}
• Location: ${gig?.location_type} ${gig?.location ? `(${gig.location})` : ""}
• Deadline: ${gig?.deadline ? new Date(gig.deadline).toLocaleDateString() : "No deadline"}
• Max applicants: ${gig?.applicant_count || 0}/${gig?.max_applicants || 10}

${recentApplicants.length > 0 ? `**Recent Applicants:**
${recentApplicants.map((app: any, i: number) => `
${i + 1}. **${app.worker_name}** ⭐ ${app.rating.toFixed(1)}/5 (${app.total_gigs} gigs)
   Status: ${app.status}
   ${app.location ? `Location: ${app.location}` : ""}
   Applied: ${new Date(app.applied_at).toLocaleDateString()}
   Message: "${app.message?.substring(0, 100)}${app.message?.length > 100 ? "..." : ""}"`
).join("\n")}` : "No applicants yet."}

[View full details](https://carlos-chthonian-uncommemoratively.ngrok-free.dev/gigs/${gig?.id})
`;

  return {
    status: "success",
    gig_id: gig?.id,
    title: gig?.title,
    gig_status: gig?.status,
    stats,
    recent_applicants: recentApplicants,
    display,
  };
};
