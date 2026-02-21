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
        operationId: "handleMCPRequest",
        summary: "Execute MCP tool",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  jsonrpc: { type: "string" },
                  id: { type: "number" },
                  method: { type: "string" },
                  params: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      arguments: { type: "object" }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Success"
          }
        }
      }
    }
  }
};
