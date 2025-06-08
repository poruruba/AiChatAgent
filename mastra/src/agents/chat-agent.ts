import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { MCPClient } from "@mastra/mcp";

const MCP_SERVER_URL = "http://localhost:30080";

const mcp = new MCPClient({
  servers: {
    GoogleMap: {
      command: "npx",
      args: [
        "-y",
        "mcp-remote",
        MCP_SERVER_URL + "/mcp-googlemap"
      ],
    },
    BraveSearch: {
      command: "npx",
      args: [
        "-y",
        "mcp-remote",
        MCP_SERVER_URL + "/mcp-bravesearch"
      ],
    },
  },
});

export const chatAgent = new Agent({
  name: 'Chat Agent',
  instructions: `自由に会話をします。`,

  model: google('gemini-1.5-pro-latest'),

  tools: await mcp.getTools(),

  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
});
