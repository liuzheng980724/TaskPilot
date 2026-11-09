import {
    All,
    Body,
    Controller,
    Req,
    Res,
    UseGuards
} from '@nestjs/common';

import { McpService } from './mcp.service.js';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import {McpAuthGuard} from "./guards/mcp-auth.guard.js";

@UseGuards(McpAuthGuard)
@Controller('mcp')
export class McpController {

    constructor(
        private readonly mcpService: McpService,
    ) {}

    @All()
    async handle(
        @Req() req: any,
        @Res() res: any,
        @Body() body: any,
    ) {
        const server =
            this.mcpService.createServer();

        const transport =
            new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });

        await server.connect(transport);

        await transport.handleRequest(
            req,
            res,
            body,
        );
    }
}