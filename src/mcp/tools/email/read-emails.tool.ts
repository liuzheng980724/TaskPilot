import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { EmailService } from '../../../email/email.service.js';

@Injectable()
export class ReadEmailsTool {

    constructor(
        private readonly emailService: EmailService,
    ) {}

    register(
        server: McpServer,
    ) {
        server.registerTool(
            'read_emails',
            {
                title: 'Read Emails',
                description: 'Read unread emails',
                inputSchema: {},
            },
            async () => {

                const emails =
                    await this.emailService.getUnreadEmails();

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