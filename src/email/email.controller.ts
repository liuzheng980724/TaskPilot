import {
    Controller,
    Get,
    Query,
} from '@nestjs/common';

import { EmailService } from './email.service.js';

//Test controller only.
@Controller('email')
export class EmailController {

    constructor(
        private readonly emailService: EmailService,
    ) {}

    @Get('test-connection')
    async testConnection() {

        const result =
            await this.emailService.testConnection();

        return {
            success: true,
            result,
        };
    }

    @Get('unread')
    async unreadEmails() {

        return this.emailService
            .getUnreadEmails();
    }

    @Get('mailboxes')
    async mailboxes() {

        return this.emailService
            .listMailboxes();
    }
}