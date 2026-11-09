import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export const mcpServer = new McpServer({
    name: 'TaskPilot',
    version: '1.0.0',
});

mcpServer.tool(
    'server_info',
    {
        message: z.string().optional(),
    },
    async () => ({
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    hostname: 'mini-pc',
                    node: process.version,
                }),
            },
        ],
    }),
);