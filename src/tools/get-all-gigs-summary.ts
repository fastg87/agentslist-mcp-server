import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const getAllGigsSummaryTool = {
  name: "get_all_gigs_summary",
  description: "Get overview of all your posted gigs with activity summary",
  inputSchema: {
    type: "object",
    properties: {}
  }
};

export const executeGetAllGigsSummary: ToolExecutor = async () => {
  // Get all gigs
  const gigsResult = await apiClient.listGigs();

  if (!gigsResult.success) {
    return {
      status: "error",
      error: gigsResult.error
    };
  }

  const gigs = (gigsResult.data as any)?.gigs || [];

  // Get applications for each gig
  const gigsWithStats = await Promise.all(
    gigs.map(async (gig: any) => {
      const appsResult = await apiClient.getApplications(gig.id);
      const applications = (appsResult.data as any)?.applications || [];

      return {
        gig_id: gig.id,
        title: gig.title,
        status: gig.status,
        posted_at: gig.created_at,
        applicant_count: applications.length,
        pending_count: applications.filter((a: any) => a.status === "pending").length,
        accepted_count: applications.filter((a: any) => a.status === "accepted").length,
        pay: `${gig.pay_amount} ${gig.pay_type}`,
        location: `${gig.location_type}${gig.location ? ` (${gig.location})` : ""}`,
        url: `https://carlos-chthonian-uncommemoratively.ngrok-free.dev/gigs/${gig.id}`
      };
    })
  );

  // Calculate totals
  const totals = {
    total_gigs: gigs.length,
    open_gigs: gigsWithStats.filter(g => g.status === "open").length,
    filled_gigs: gigsWithStats.filter(g => g.status === "filled").length,
    total_applicants: gigsWithStats.reduce((sum, g) => sum + g.applicant_count, 0),
    pending_review: gigsWithStats.reduce((sum, g) => sum + g.pending_count, 0),
    total_accepted: gigsWithStats.reduce((sum, g) => sum + g.accepted_count, 0),
  };

  // Format display
  const display = `
📊 **Your Gigs Summary**

**Overview:**
• Total gigs posted: ${totals.total_gigs}
• Currently open: ${totals.open_gigs}
• Filled/Closed: ${totals.filled_gigs}
• Total applicants: ${totals.total_applicants}
• Pending review: ${totals.pending_review}
• Workers accepted: ${totals.total_accepted}

${gigsWithStats.length > 0 ? `**Your Gigs:**
${gigsWithStats.map((gig, i) => {
  const statusEmoji = gig.status === "open" ? "🟢" :
                      gig.status === "staffed" ? "🟡" : "🔴";
  return `
${i + 1}. ${statusEmoji} **${gig.title}**
   • ${gig.applicant_count} applicants (${gig.pending_count} pending)
   • ${gig.pay} • ${gig.location}
   • Posted ${new Date(gig.posted_at).toLocaleDateString()}
   • [View](${gig.url})`;
}).join("\n")}` : "You haven't posted any gigs yet."}

💡 Use 'get_gig_dashboard' with a specific gig_id to see detailed applicant info.
`;

  return {
    status: "success",
    totals,
    gigs: gigsWithStats,
    display,
  };
};
