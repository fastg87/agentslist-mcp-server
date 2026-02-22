import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const withdrawGigTool = {
  name: "withdraw_gig",
  description: "Close/withdraw a gig and stop accepting applications. Use when position is filled or no longer needed.",
  inputSchema: {
    type: "object",
    properties: {
      gig_id: {
        type: "string",
        description: "The gig ID to withdraw"
      },
      reason: {
        type: "string",
        enum: ["filled", "cancelled", "no_longer_needed", "other"],
        description: "Reason for withdrawing"
      },
      notify_applicants: {
        type: "boolean",
        description: "Whether to notify pending applicants (default: true)"
      }
    },
    required: ["gig_id"]
  }
};

export const executeWithdrawGig: ToolExecutor = async (params) => {
  const reason = params.reason || "other";

  // Get gig details
  const gigResult = await apiClient.getGig(params.gig_id);
  if (!gigResult.success) {
    return { status: "error", error: gigResult.error };
  }
  const gig = (gigResult.data as any)?.gig;

  // Count pending applicants
  const appsResult = await apiClient.getApplications(params.gig_id);
  const applications = (appsResult.data as any)?.applications || [];
  const pendingCount = applications.filter((a: any) => a.status === "pending").length;

  // "filled" maps to "staffed" (position taken); everything else maps to "cancelled"
  const newStatus = reason === "filled" ? "staffed" : "cancelled";

  const updateResult = await apiClient.updateGig(params.gig_id, { status: newStatus });
  if (!updateResult.success) {
    return { status: "error", error: updateResult.error };
  }

  const reasonText: Record<string, string> = {
    filled: "Position filled",
    cancelled: "Gig cancelled",
    no_longer_needed: "No longer needed",
    other: "Closed",
  };

  return {
    status: "success",
    gig_id: params.gig_id,
    new_status: newStatus,
    reason: reasonText[reason] || "Closed",
    pending_applicants_notified: params.notify_applicants !== false ? pendingCount : 0,
    message: `✅ Gig withdrawn: "${gig?.title}"

Reason: ${reasonText[reason] || "Closed"}
${pendingCount > 0
  ? `${pendingCount} pending applicant${pendingCount !== 1 ? "s" : ""} will be notified.`
  : "No pending applicants."}

The gig is now closed and will not accept new applications.`
  };
};
