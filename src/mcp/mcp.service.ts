import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { ServerInfoTool } from './tools/server/server-info.tool.js';

import { ReadEmailsTool } from './tools/email/read-emails.tool.js';
import { GetEmailTool } from './tools/email/get-email.tool.js';
import { SendEmailTool } from './tools/email/send-email.tool.js';
import { SearchEmailsTool } from './tools/email/search-emails.tool.js';
import { ReadSentEmailsTool } from './tools/email/read-sent-emails.tool.js';
import { ReplyEmailTool } from './tools/email/reply-email.tool.js';

@Injectable()
export class McpService {

    constructor(
        private readonly serverInfoTool: ServerInfoTool,

        private readonly readEmailsTool: ReadEmailsTool,
        private readonly getEmailTool: GetEmailTool,
        private readonly sendEmailTool: SendEmailTool,
        private readonly searchEmailsTool: SearchEmailsTool,
        private readonly readSentEmailsTool: ReadSentEmailsTool,
        private readonly replyEmailTool: ReplyEmailTool,
    ) {}

    createServer(): McpServer {

        const server = new McpServer({
            name: 'TaskPilot',
            version: '1.0.0',
        });

        this.serverInfoTool.register(server);

        this.readEmailsTool.register(server);
        this.getEmailTool.register(server);
        this.sendEmailTool.register(server);
        this.searchEmailsTool.register(server);
        this.readSentEmailsTool.register(server);
        this.replyEmailTool.register(server);

        return server;
    }
}