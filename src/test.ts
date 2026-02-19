// Quick test script
async function testMCP() {
  const testRequest = {
    jsonrpc: "2.0" as const,
    id: 1,
    method: "tools/call",
    params: {
      name: "ping",
      arguments: {
        message: "Hello from test!"
      }
    }
  };

  console.log("Testing MCP server...");
  console.log("Request:", JSON.stringify(testRequest, null, 2));

  try {
    const response = await fetch("http://localhost:3001/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testRequest)
    });

    const result = await response.json();
    console.log("\nResponse:", JSON.stringify(result, null, 2));
    console.log("\n✅ Test passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

testMCP();
