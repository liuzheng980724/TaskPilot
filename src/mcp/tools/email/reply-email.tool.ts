import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { EmailService } from '../../../email/email.service.js';
import { McpTool } from '../mcp-tool.interface.js';

@Injectable()
export class ReplyEmailTool
    implements McpTool {

    constructor(
        private readonly emailService:
        EmailService,
    ) {}

    register(
        server: McpServer,
    ): void {

        server.registerTool(
            'reply_email',

            {
                title: 'Reply Email',

                description:
                    `Reply to an existing email.

IMPORTANT:
- Email body MUST be valid HTML.
- Never send plain text replies.
- Always use proper HTML tags such as <p>, <br>, <ul>, <ol>, <li>, <table>, and <a>.
- Business replies should be formatted professionally using HTML.
- Do NOT include signatures, disclaimers, footers, timestamps, reference IDs, or closing blocks.
- TaskPilot automatically appends the email signature, disclaimer, reference ID and UTC timestamp.
- If the user provides plain text content, convert it into well-structured HTML before sending.
- Set replyAll=true only when the user explicitly requests Reply All or clearly indicates that all recipients should receive the reply.`,

                inputSchema: {

                    uid:
                        z.number(),

                    mailbox:
                        z.string()
                            .optional(),

                    body:
                        z.string(),

                    replyAll:
                        z.boolean()
                            .optional(),
                },
            },

            async ({
                       uid,
                       mailbox,
                       body,
                       replyAll,
                   }) => {

                await this.emailService
                    .replyEmail(
                        uid,
                        body,
                        mailbox ??
                        'INBOX',
                        replyAll ??
                        false,
                    );

                return {
                    content: [
                        {
                            type: 'text',

                            text:
                                replyAll
                                    ? `Reply-all sent successfully for email UID ${uid}`
                                    : `Reply sent successfully for email UID ${uid}`,
                        },
                    ],
                };
            },
        );
    }
}