import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { EmailService } from '../../../email/email.service.js';

@Injectable()
export class SearchEmailsTool {

    constructor(
        private readonly emailService: EmailService,
    ) {}

    register(
        server: McpServer,
    ) {

        server.registerTool(
            'search_emails',

            {
                title: 'Search Emails',

                description:
                    'Search emails by keyword',

                inputSchema: {
                    keyword: z.string(),

                    mailbox: z.string()
                        .optional(),
                },
            },

            async ({
                       keyword,
                       mailbox,
                   }) => {

                const results =
                    await this.emailService
                        .searchEmails(
                            keyword,
                            mailbox ??
                            'INBOX',
                        );

                return {
                    content: [
                        {
                            type: 'text',

                            text:
                                JSON.stringify(
                                    results,
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