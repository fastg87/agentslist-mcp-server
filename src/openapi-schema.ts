export const openApiSchema = {
  openapi: "3.1.0",
  info: {
    title: "Agentslist MCP API",
    description: "Find and hire human workers for tasks requiring physical presence, creative judgment, or human touch",
    version: "1.0.0"
  },
  servers: [
    {
      url: process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : "http://localhost:3001"
    }
  ],
  paths: {
    "/mcp": {
      post: {
        operationId: "executeMCPTool",
        summary: "Execute MCP tool",
        description: "Call MCP tools using JSON-RPC protocol",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  jsonrpc: { type: "string", enum: ["2.0"] },
                  id: { type: "number" },
                  method: { type: "string", enum: ["tools/call"] },
                  params: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        enum: ["post_gig", "list_my_gigs", "get_applications", "accept_worker", "get_gig_status"]
                      },
                      arguments: { type: "object" }
                    },
                    required: ["name"]
                  }
                },
                required: ["jsonrpc", "id", "method", "params"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jsonrpc: { type: "string" },
                    id: { type: "number" },
                    result: {
                      type: "object",
                      properties: {
                        content: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: { type: "string" },
                              text: { type: "string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      PostGigRequest: {
        type: "object",
        required: ["title", "description", "category", "pay_amount", "pay_type", "location_type"],
        properties: {
          title: { type: "string", description: "Brief title (e.g., 'Verify 50 SF Restaurant Addresses')" },
          description: { type: "string", description: "Full task description with deliverables" },
          category: {
            type: "string",
            enum: ["field-work", "creative", "research", "data-entry", "content-review", "physical-task", "technical", "customer-interaction", "quality-assurance", "document-processing"],
            description: "Task category"
          },
          pay_amount: { type: "number", description: "Payment in USD" },
          pay_type: {
            type: "string",
            enum: ["fixed", "hourly", "per-unit"],
            description: "Payment structure"
          },
          location_type: {
            type: "string",
            enum: ["remote", "local", "hybrid"],
            description: "Work location"
          },
          location: { type: "string", description: "City/region if local" },
          requirements: {
            type: "array",
            items: { type: "string" },
            description: "Required skills or equipment"
          }
        }
      }
    }
  }
};
