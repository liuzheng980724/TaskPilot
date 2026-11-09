import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { McpTool } from '../mcp-tool.interface.js';

@Injectable()
export class ServerInfoTool implements McpTool {

    register(
        server: McpServer,
    ): void {

        server.registerTool(
            'server_info',
            {
                title: 'Server Info',
                description:
                    'Get server information',

                inputSchema: {},
            },

            async () => ({
                content: [
                    {
                        type: 'text',

                        text: JSON.stringify(
                            {
                                hostname:
                                    'mini-pc',

                                node:
                                process.version,

                                platform:
                                process.platform,

                                arch:
                                process.arch,

                                uptime:
                                    process.uptime(),
                            },
                            null,
                            2,
                        ),
                    },
                ],
            }),
        );
    }
}