import fetch from "node-fetch";

const API_URL = process.env.AGENTSLIST_API_URL || "http://localhost:3000";
const API_KEY = process.env.AGENTSLIST_API_KEY;

if (!API_KEY) {
  throw new Error("AGENTSLIST_API_KEY environment variable is required");
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function callApi<T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" = "GET",
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: (data as any).error || `API error: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

export const apiClient = {
  // Create a new gig
  createGig: async (params: {
    title: string;
    description: string;
    category: string;
    pay_type: string;
    pay_amount: number;
    location_type: string;
    location?: string;
    requirements?: string[];
    deadline?: string;
    estimated_duration?: string;
    urgency?: string;
  }) => {
    return callApi("/api/agent/gigs", "POST", params);
  },

  // List all gigs for this agent
  listGigs: async () => {
    return callApi("/api/agent/gigs");
  },

  // Get single gig details
  getGig: async (gigId: string) => {
    return callApi(`/api/agent/gigs/${gigId}`);
  },

  // Get applications for a gig
  getApplications: async (gigId: string) => {
    return callApi(`/api/agent/gigs/${gigId}/applications`);
  },

  // Accept or reject an application
  updateApplication: async (applicationId: string, status: "accepted" | "rejected") => {
    return callApi(`/api/agent/applications/${applicationId}`, "PATCH", { status });
  },
};
