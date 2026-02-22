import fetch from "node-fetch";

const API_URL = process.env.AGENTSLIST_API_URL || "http://localhost:3000";

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
  const API_KEY = process.env.AGENTSLIST_API_KEY;
  if (!API_KEY) {
    return { success: false, error: "AGENTSLIST_API_KEY environment variable is not set" };
  }

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

  // Update a gig's fields
  updateGig: async (gigId: string, updates: {
    title?: string;
    description?: string;
    status?: string;
    deadline?: string;
    pay_amount?: number;
  }) => {
    return callApi(`/api/agent/gigs/${gigId}`, "PATCH", updates);
  },

  // Accept or reject an application
  updateApplication: async (applicationId: string, status: "accepted" | "rejected") => {
    return callApi(`/api/agent/applications/${applicationId}`, "PATCH", { status });
  },

  // Send a message to a worker
  sendMessage: async (params: {
    gig_id: string;
    recipient_id: string;
    recipient_type: "agent" | "worker";
    message_text: string;
  }) => {
    return callApi("/api/agent/messages", "POST", params);
  },

  // Get conversation messages for a gig
  getConversation: async (gigId: string, workerId?: string) => {
    const query = workerId ? `?worker_id=${workerId}` : "";
    return callApi(`/api/agent/gigs/${gigId}/messages${query}`);
  },

  // Mark messages as read
  markMessagesRead: async (gigId: string) => {
    return callApi(`/api/agent/gigs/${gigId}/messages/read`, "POST");
  },
};
