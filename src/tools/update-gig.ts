import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const updateGigTool = {
  name: "update_gig",
  description: "Update a posted gig's details (title, description, deadline, pay, or status)",
  inputSchema: {
    type: "object",
    properties: {
      gig_id: {
        type: "string",
        description: "The gig ID to update"
      },
      title: {
        type: "string",
        description: "New title (optional)"
      },
      description: {
        type: "string",
        description: "New description (optional)"
      },
      deadline: {
        type: "string",
        description: "New deadline in ISO format (optional)"
      },
      pay_amount: {
        type: "number",
        description: "New pay amount (optional)"
      },
      status: {
        type: "string",
        enum: ["open", "staffed", "cancelled"],
        description: "New status (optional)"
      }
    },
    required: ["gig_id"]
  }
};

export const executeUpdateGig: ToolExecutor = async (params) => {
  const { gig_id } = params;

  const updateData: any = {};
  if (params.title !== undefined) updateData.title = params.title;
  if (params.description !== undefined) updateData.description = params.description;
  if (params.deadline !== undefined) updateData.deadline = params.deadline;
  if (params.pay_amount !== undefined) updateData.pay_amount = params.pay_amount;
  if (params.status !== undefined) updateData.status = params.status;

  if (Object.keys(updateData).length === 0) {
    return {
      status: "error",
      error: "No updates provided. Specify at least one field to update."
    };
  }

  const result = await apiClient.updateGig(gig_id, updateData);

  if (!result.success) {
    return {
      status: "error",
      error: result.error
    };
  }

  const gig = (result.data as any)?.gig;

  const changes = Object.keys(updateData).map(key => {
    if (key === "deadline") return `Deadline → ${new Date(updateData[key]).toLocaleDateString()}`;
    if (key === "pay_amount") return `Pay → ${updateData[key]}`;
    if (key === "status") return `Status → ${updateData[key].toUpperCase()}`;
    return `${key} updated`;
  });

  return {
    status: "success",
    gig_id: gig?.id,
    changes_made: changes,
    message: `✅ Gig updated successfully!\n\n${changes.join("\n")}`,
    updated_gig: {
      title: gig?.title,
      status: gig?.status,
      pay: `${gig?.pay_amount} ${gig?.pay_type}`,
      deadline: gig?.deadline ? new Date(gig.deadline).toLocaleDateString() : "None"
    }
  };
};
