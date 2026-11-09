import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { EmailService }
    from '../../../email/email.service.js';

import { McpTool }
    from '../mcp-tool.interface.js';

@Injectable()
export class SendEmailTool
    implements McpTool {

    constructor(
        private readonly emailService:
        EmailService,
    ) {}

    register(
        server: McpServer,
    ): void {

        server.registerTool(
            'send_email',

            {
                title:
                    'Send Email',

                description:
                    `Send an email with optional CC and BCC recipients.
IMPORTANT:
- Email body MUST be valid HTML.
- Never send plain text emails.
- Always use proper HTML tags such as <p>, <br>, <ul>, <ol>, <li>, <table>, and <a>.
- Business emails should be formatted professionally using HTML.
- Do NOT include signatures, disclaimers, footers, timestamps, reference IDs, or closing blocks.
- TaskPilot automatically appends the email signature and footer.
- If the user provides plain text content, convert it to well-structured HTML before sending.`,


                inputSchema: {

                    to: z.array(
                        z.string().email(),
                    ),

                    cc: z.array(
                        z.string().email(),
                    ).optional(),

                    bcc: z.array(
                        z.string().email(),
                    ).optional(),

                    subject:
                        z.string(),

                    body:
                        z.string(),
                },
            },

            async ({
                       to,
                       cc,
                       bcc,
                       subject,
                       body,
                   }) => {

                await this.emailService.sendEmail({

                    to,

                    cc,

                    bcc,

                    subject,

                    html:
                    body,
                });

                return {
                    content: [
                        {
                            type:
                                'text',

                            text:
                                `Email sent successfully to ${to.join(', ')}`,
                        },
                    ],
                };
            },
        );
    }
}