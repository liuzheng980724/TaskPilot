import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { EmailService } from '../../../email/email.service.js';
import { McpTool } from '../mcp-tool.interface.js';

@Injectable()
export class GetEmailTool
    implements McpTool {

    constructor(
        private readonly emailService:
        EmailService,
    ) {}

    register(
        server: McpServer,
    ): void {

        server.registerTool(
            'get_email',

            {
                title: 'Get Email',

                description:
                    'Read email content by uid',

                inputSchema: {
                    uid: z.number(),

                    mailbox:
                        z.string()
                            .optional(),
                },
            },

            async ({
                       uid,
                       mailbox,
                   }) => {

                const email =
                    await this.emailService
                        .getEmailDetails(
                            uid,
                            mailbox ??
                            'INBOX',
                        );

                return {
                    content: [
                        {
                            type: 'text',

                            text:
                                JSON.stringify(
                                    email,
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