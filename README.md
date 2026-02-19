# Agentslist MCP Server

MCP (Model Context Protocol) server for ChatGPT integration.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Test the server:
   ```bash
   # In another terminal:
   npm test
   ```

## Endpoints

- `GET /health` - Health check
- `POST /mcp` - MCP JSON-RPC endpoint
- `GET /sse` - Server-Sent Events endpoint for streaming

## Testing

1. Health check:
   ```bash
   curl http://localhost:3001/health
   ```

2. Test ping tool:
   ```bash
   curl -X POST http://localhost:3001/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "tools/call",
       "params": {
         "name": "ping",
         "arguments": {"message": "test"}
       }
     }'
   ```

Expected response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\n  \"status\": \"success\",\n  \"message\": \"test\",\n  \"timestamp\": \"...\"\n}"
    }]
  }
}
```
