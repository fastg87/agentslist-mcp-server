// Test script for all Agentslist tools
async function testTools() {
  console.log("🧪 Testing Agentslist MCP Tools\n");

  // Test 1: Post a gig
  console.log("1️⃣ Testing post_gig...");
  const postResponse = await fetch("http://localhost:3001/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "post_gig",
        arguments: {
          title: "Test Gig from MCP",
          description: "This is a test gig posted via MCP server",
          category: "data-entry",
          pay_type: "fixed",
          pay_amount: 50,
          location_type: "remote"
        }
      }
    })
  });
  const postResult = await postResponse.json();
  console.log("Result:", JSON.stringify(postResult, null, 2));

  // Test 2: List gigs
  console.log("\n2️⃣ Testing list_my_gigs...");
  const listResponse = await fetch("http://localhost:3001/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "list_my_gigs",
        arguments: {}
      }
    })
  });
  const listResult = await listResponse.json();
  console.log("Result:", JSON.stringify(listResult, null, 2));

  console.log("\n✅ Tool tests complete!");
}

testTools().catch(console.error);
