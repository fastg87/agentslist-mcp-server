import { MCPRequest, MCPResponse, MCPTool, ToolExecutor } from "./types";
import { pingTool, executePing } from "./tools/ping";
import { postGigTool, executePostGig } from "./tools/post-gig";
import { listGigsTool, executeListGigs } from "./tools/list-gigs";
import { getApplicationsTool, executeGetApplications } from "./tools/get-applications";
import { acceptWorkerTool, executeAcceptWorker } from "./tools/accept-worker";
import { getGigStatusTool, executeGetGigStatus } from "./tools/get-gig-status";
import { getGigDashboardTool, executeGetGigDashboard } from "./tools/get-gig-dashboard";
import { getAllGigsSummaryTool, executeGetAllGigsSummary } from "./tools/get-all-gigs-summary";
import { sendMessageTool, executeSendMessage } from "./tools/send-message";
import { getConversationTool, executeGetConversation } from "./tools/get-conversation";
import { updateGigTool, executeUpdateGig } from "./tools/update-gig";
import { withdrawGigTool, executeWithdrawGig } from "./tools/withdraw-gig";
import { reopenGigTool, executeReopenGig } from "./tools/reopen-gig";

const tools: MCPTool[] = [
  pingTool,
  postGigTool,
  listGigsTool,
  getApplicationsTool,
  acceptWorkerTool,
  getGigStatusTool,
  getGigDashboardTool,
  getAllGigsSummaryTool,
  sendMessageTool,
  getConversationTool,
  updateGigTool,
  withdrawGigTool,
  reopenGigTool,
];

const toolExecutors: Record<string, ToolExecutor> = {
  ping: executePing,
  post_gig: executePostGig,
  list_my_gigs: executeListGigs,
  get_applications: executeGetApplications,
  accept_worker: executeAcceptWorker,
  get_gig_status: executeGetGigStatus,
  get_gig_dashboard: executeGetGigDashboard,
  get_all_gigs_summary: executeGetAllGigsSummary,
  send_message: executeSendMessage,
  get_conversation: executeGetConversation,
  update_gig: executeUpdateGig,
  withdraw_gig: executeWithdrawGig,
  reopen_gig: executeReopenGig,
};

export async function handleMCPRequest(request: MCPRequest): Promise<MCPResponse> {
  const { id, method, params } = request;

  try {
    switch (method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            serverInfo: {
              name: "agentslist-mcp-server",
              version: "1.0.0"
            },
            capabilities: {
              tools: {}
            }
          }
        };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: tools.map(tool => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema
            }))
          }
        };

      case "tools/call":
        const toolName = params?.name;
        const toolParams = params?.arguments || {};

        if (!toolName || !toolExecutors[toolName]) {
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: `Unknown tool: ${toolName}`
            }
          };
        }

        console.log(`[MCP] Executing tool: ${toolName}`);
        console.log(`[MCP] Params:`, JSON.stringify(toolParams, null, 2));

        const result = await toolExecutors[toolName](toolParams);

        console.log(`[MCP] Result:`, JSON.stringify(result, null, 2));

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        };

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        };
    }
  } catch (error: any) {
    console.error(`[MCP] Error:`, error);
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: error.message || "Internal error"
      }
    };
  }
}
