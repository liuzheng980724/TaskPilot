import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller.js';
import { McpService } from './mcp.service.js';
import { McpAuthGuard } from './guards/mcp-auth.guard.js';

import { EmailModule } from '../email/email.module.js';

import { ServerInfoTool } from './tools/server/server-info.tool.js';

import { ReadEmailsTool } from './tools/email/read-emails.tool.js';
import { GetEmailTool } from './tools/email/get-email.tool.js';
import { SendEmailTool } from './tools/email/send-email.tool.js';
import { SearchEmailsTool } from './tools/email/search-emails.tool.js';
import { ReadSentEmailsTool } from './tools/email/read-sent-emails.tool.js';
import { ReplyEmailTool } from './tools/email/reply-email.tool.js';


@Module({
  imports: [EmailModule],
  controllers: [McpController],
  providers: [
      McpService,
    McpAuthGuard,
    ServerInfoTool,
    ReadEmailsTool,
    GetEmailTool,
    SendEmailTool,
    SearchEmailsTool,
    ReadSentEmailsTool,
    ReplyEmailTool
  ]
})
export class McpModule {}
