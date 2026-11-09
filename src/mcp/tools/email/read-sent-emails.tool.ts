import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { EmailService } from '../../../email/email.service.js';
import { McpTool } from '../mcp-tool.interface.js';

@Injectable()
export class ReadSentEmailsTool
    implements McpTool {

    constructor(
        private readonly emailService: EmailService,
    ) {}

    register(
        server: McpServer,
    ): void {

        server.registerTool(
            'read_sent_emails',

            {
                title: 'Read Sent Emails',

                description:
                    'Read recently sent emails',

                inputSchema: {},
            },

            async () => {

                const emails =
                    await this.emailService
                        .getSentEmails();

                return {
                    content: [
                        {
                            type: 'text',

                            text: JSON.stringify(
                                emails,
                                null,
                                2,
                            ),
                        },
                    ],
                };
            },
        );
    }
}