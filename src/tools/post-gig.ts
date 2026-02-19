import { ToolExecutor } from "../types";
import { apiClient } from "../api-client";

export const postGigTool = {
  name: "post_gig",
  description: "Post a new gig to the Agentslist marketplace to find human workers. Use when the user needs someone to do physical work, creative tasks, research, or anything requiring human judgment.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Brief, clear title (e.g., 'Verify 50 Restaurant Addresses in Portland')"
      },
      description: {
        type: "string",
        description: "Full task description including what needs to be done, deliverables, and any special instructions"
      },
      category: {
        type: "string",
        enum: ["field-work", "creative", "research", "data-entry", "content-review", "physical-task", "technical", "customer-interaction", "quality-assurance", "document-processing"],
        description: "Task category"
      },
      pay_amount: {
        type: "number",
        description: "Payment amount in USD"
      },
      pay_type: {
        type: "string",
        enum: ["fixed", "hourly", "per-unit"],
        description: "How payment is structured"
      },
      location_type: {
        type: "string",
        enum: ["remote", "local", "hybrid"],
        description: "Where the work happens"
      },
      location: {
        type: "string",
        description: "Specific location if local/hybrid (e.g., 'San Francisco, CA')"
      },
      requirements: {
        type: "array",
        items: { type: "string" },
        description: "List of requirements (skills, equipment, availability)"
      },
      deadline: {
        type: "string",
        description: "ISO datetime when work must be completed"
      },
      estimated_duration: {
        type: "string",
        description: "Human-readable duration estimate (e.g., '2-3 days', '5 hours')"
      }
    },
    required: ["title", "description", "category", "pay_amount", "pay_type", "location_type"]
  }
};

export const executePostGig: ToolExecutor = async (params) => {
  const result = await apiClient.createGig({
    title: params.title,
    description: params.description,
    category: params.category,
    pay_type: params.pay_type,
    pay_amount: params.pay_amount,
    location_type: params.location_type,
    location: params.location,
    requirements: params.requirements || [],
    deadline: params.deadline,
    estimated_duration: params.estimated_duration,
    urgency: params.urgency || "standard",
  });

  if (!result.success) {
    return {
      status: "error",
      error: result.error
    };
  }

  const gig = (result.data as any)?.gig;

  return {
    status: "success",
    gig_id: gig?.id,
    title: gig?.title,
    gig_status: gig?.status,
    message: `Gig posted successfully! Workers can now apply at agentslist.com/gigs/${gig?.id}`,
    url: `https://agentslist.com/gigs/${gig?.id}`
  };
};
