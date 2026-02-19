import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleMCPRequest } from "./mcp-handler";
import { MCPRequest } from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    server: "agentslist-mcp-server",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// MCP endpoint (POST for JSON-RPC)
app.post("/mcp", async (req, res) => {
  try {
    const request: MCPRequest = req.body;
    const response = await handleMCPRequest(request);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32603,
        message: error.message || "Internal server error"
      }
    });
  }
});

// SSE endpoint for streaming (ChatGPT uses this)
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: "connection", status: "connected" })}\n\n`);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`: keepalive\n\n`);
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 MCP: http://localhost:${PORT}/mcp`);
  console.log(`📍 SSE: http://localhost:${PORT}/sse`);
});
