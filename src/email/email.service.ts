import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { randomUUID } from 'node:crypto';

import { SendEmailOptions } from './interfaces/send-email-options.interface.js';


@Injectable()
export class EmailService {

    private transporter: nodemailer.Transporter;
    private readonly archiveBcc: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.archiveBcc = this.configService.getOrThrow<string>('MAIL_ARCHIVE_BCC',);

        this.transporter =
            nodemailer.createTransport({

                host:
                    this.configService.get<string>(
                        'SMTP_HOST',
                    ),

                port:
                    Number(
                        this.configService.get(
                            'SMTP_PORT',
                        ),
                    ),

                secure: false,

                auth: {
                    user:
                        this.configService.get(
                            'MAIL_USERNAME',
                        ),

                    pass:
                        this.configService.get(
                            'MAIL_PASSWORD',
                        ),
                },
            });
    }

    //Test
    async testConnection() {

        return this.transporter.verify();
    }

    async sendEmail(
        options: SendEmailOptions,
    ) {

        const {
            to,
            cc,
            bcc,
            replyTo,
            subject,
            html,
            attachments,
        } = options;

        const mergedBcc = [
            ...(bcc ?? []),
            this.archiveBcc,
        ];

        console.log({
            timestamp:
                new Date(),

            action:
                'send_email',

            to,
            cc,
            bcc,
            subject,
        });

        return this.transporter.sendMail({

            from: `"${this.configService.get(
                'SMTP_FROM_NAME',
            )}" <${this.configService.get(
                'MAIL_USERNAME',
            )}>`,
            replyTo:
                replyTo ??
                this.configService.get(
                    'MAIL_USERNAME',
                ),
            to,
            cc,
            bcc: mergedBcc,
            subject,
            html:
                this.ensureHtml(html) +
                this.buildFooter(),

            attachments,
        });
    }

    async getUnreadEmails(
        mailbox = 'INBOX',
        limit = 10,
    ) {

        return this.withImap(
            async (client) => {

                const messages = [];

                const unseen =
                    (await client.search({
                        seen: false,
                    })) || [];

                const latest =
                    unseen.slice(-limit);

                for await (
                    const message of client.fetch(
                    latest,
                    {
                        envelope: true,
                    },
                )
                    ) {

                    messages.push({
                        mailbox,

                        uid: message.uid,

                        subject:
                        message.envelope?.subject,

                        from:
                        message.envelope?.from?.[0]
                            ?.address,

                        to:
                        message.envelope?.to?.[0]
                            ?.address,

                        date:
                        message.envelope?.date,
                    });
                }

                return messages;
            },
            mailbox,
        );
    }

    async searchEmails(
        keyword: string,
        mailbox = 'INBOX',
        limit = 50,
    ) {

        return this.withImap(
            async (client) => {

                const messages = [];

                const results =
                    (await client.search({
                        body: keyword,
                    })) || [];

                const latest =
                    results.slice(-limit);

                for await (
                    const message of client.fetch(
                    latest,
                    {
                        envelope: true,
                    },
                )
                    ) {

                    messages.push({
                        mailbox,

                        uid: message.uid,

                        subject:
                        message.envelope?.subject,

                        from:
                        message.envelope?.from?.[0]
                            ?.address,

                        to:
                        message.envelope?.to?.[0]
                            ?.address,

                        date:
                        message.envelope?.date,
                    });
                }

                return messages;
            },

            mailbox,
        );
    }

    async getEmailDetails(
        uid: number,
        mailbox = 'INBOX',
    ) {

        return this.withImap(
            async (client) => {

                let email = null;

                for await (
                    const message of client.fetch(
                    {uid},
                    {
                        envelope: true,
                        source: true,
                    },
                )
                    ) {
                    const parsed =
                        await simpleParser(
                            message.source!,
                        );

                    email = {
                        mailbox,

                        uid: message.uid,

                        messageId:
                            parsed.messageId ?? '',

                        references:
                            parsed.references ?? [],

                        subject:
                            parsed.subject ?? '',

                        from:
                            parsed.from?.text ?? '',

                        to:
                            Array.isArray(parsed.to)
                                ? parsed.to
                                    .map(
                                        item =>
                                            item.text ?? '',
                                    )
                                    .join(', ')
                                : parsed.to?.text ?? '',

                        cc:
                            Array.isArray(parsed.cc)
                                ? parsed.cc
                                    .map(
                                        item =>
                                            item.text ?? '',
                                    )
                                    .join(', ')
                                : parsed.cc?.text ?? '',

                        date:
                        parsed.date,

                        text:
                            parsed.text ?? '',

                        html:
                            typeof parsed.html === 'string'
                                ? parsed.html
                                : '',

                        attachments:
                            parsed.attachments.map(
                                attachment => ({
                                    filename:
                                    attachment.filename,

                                    contentType:
                                    attachment.contentType,

                                    size:
                                    attachment.size,
                                }),
                            ),
                    };
                }

                return email;
            },

            mailbox,
        );
    }

    async getSentEmails(
        limit = 20,
    ) {

        return this.getEmails(
            'INBOX.Sent',
            limit,
        );
    }

    async replyEmail(
        uid: number,
        body: string,
        mailbox = 'INBOX',
        replyAll = false,
    ) {

        const originalEmail =
            await this.getEmailDetails(
                uid,
                mailbox,
            );

        if (!originalEmail) {

            throw new Error(
                'Email not found',
            );
        }

        const subject =
            originalEmail.subject.startsWith(
                'Re:',
            )
                ? originalEmail.subject
                : `Re: ${originalEmail.subject}`;

        const references =
            Array.isArray(
                originalEmail.references,
            )
                ? originalEmail.references
                : [];

        const currentMailbox =
            this.configService.getOrThrow<string>(
                'MAIL_USERNAME',
            ).toLowerCase();

        const cc =
            replyAll && originalEmail.cc
                ? originalEmail.cc
                    .split(',')
                    .map(
                        (recipient: string) =>
                            recipient.trim(),
                    )
                    .filter(Boolean)
                    .filter(
                        recipient =>
                            recipient.toLowerCase() !==
                            currentMailbox,
                    )
                : [];

        console.log({
            timestamp: new Date(),
            action: 'reply_email',
            uid,
            mailbox,
            subject,
            to: originalEmail.from,
            cc,
        });

        await this.markAsRead(
            uid,
            mailbox,
        );

        return this.transporter.sendMail({

            from: `"${this.configService.get(
                'SMTP_FROM_NAME',
            )}" <${this.configService.get(
                'MAIL_USERNAME',
            )}>`,

            replyTo:
                this.configService.get(
                    'MAIL_USERNAME',
                ),

            to:
            originalEmail.from,
            cc,
            bcc: this.archiveBcc,
            subject,

            inReplyTo:
            originalEmail.messageId,

            references:
                originalEmail.messageId
                    ? [
                        ...references,
                        originalEmail.messageId,
                    ]
                    : references,

            html:
                this.ensureHtml(body) +
                this.buildFooter(),
        });
    }

    async markAsRead(
        uid: number,
        mailbox = 'INBOX',
    ) {

        return this.withImap(
            async (client) => {

                await client.messageFlagsAdd(
                    { uid },
                    ['\\Seen'],
                );

                return {
                    success: true,
                    uid,
                    mailbox,
                };
            },

            mailbox,
        );
    }

    async markAsUnread(
        uid: number,
        mailbox = 'INBOX',
    ) {

        return this.withImap(
            async (client) => {

                await client.messageFlagsRemove(
                    { uid },
                    ['\\Seen'],
                );

                return {
                    success: true,
                    uid,
                    mailbox,
                };
            },

            mailbox,
        );
    }

    //test tool
    async listMailboxes() {

        const client =
            this.createImapClient();

        await client.connect();

        try {

            const mailboxes =
                await client.list();

            return mailboxes.map(
                mailbox => ({
                    path: mailbox.path,
                    specialUse:
                    mailbox.specialUse,
                }),
            );

        } finally {

            await client.logout();
        }
    }

    async getEmails(
        mailbox = 'INBOX',
        limit = 20,
    ) {

        return this.withImap(
            async (client) => {

                const messages = [];

                const all =
                    (await client.search({
                        all: true,
                    })) || [];

                const latest =
                    all.slice(-limit);

                for await (
                    const message of client.fetch(
                    latest,
                    {
                        envelope: true,
                    },
                )
                    ) {

                    messages.push({
                        mailbox,

                        uid: message.uid,

                        subject:
                        message.envelope?.subject,

                        from:
                        message.envelope?.from?.[0]
                            ?.address,

                        to:
                        message.envelope?.to?.[0]
                            ?.address,

                        date:
                        message.envelope?.date,
                    });
                }

                return messages;
            },

            mailbox,
        );
    }

    private createImapClient(): ImapFlow {

        return new ImapFlow({
            host: this.configService.getOrThrow<string>(
                'IMAP_HOST',
            ),

            port: 993,

            secure: true,

            auth: {
                user:
                    this.configService.getOrThrow<string>(
                        'MAIL_USERNAME',
                    ),

                pass:
                    this.configService.getOrThrow<string>(
                        'MAIL_PASSWORD',
                    ),
            },
        });
    }

    private async withImap<T>(
        callback: (
            client: ImapFlow,
        ) => Promise<T>,
        mailbox = 'INBOX',
    ): Promise<T> {

        const client =
            this.createImapClient();

        await client.connect();

        try {

            await client.mailboxOpen(
                mailbox,
            );

            return await callback(
                client,
            );

        } finally {

            await client.logout();
        }
    }

    private ensureHtml(
        content: string,
    ): string {

        const isHtml =
            /<(p|div|br|ul|ol|li|table|tr|td|a|h1|h2|h3)[\s>]/i
                .test(content);

        if (isHtml) {
            return content;
        }

        return content
            .split('\n')
            .filter(
                line => line.trim(),
            )
            .map(
                line => `<p>${line}</p>`,
            )
            .join('');
    }

    private buildFooter(): string {
        const referenceId = randomUUID();

        const generatedAt =
            new Date()
                .toISOString()
                .replace(
                    /\.\d{3}Z$/,
                    ' UTC',
                )
                .replace(
                    'T',
                    ' ',
                );

        return `
        <p style="
            margin-top:24px;
            margin-right:0;
            margin-bottom:0;
            margin-left:0;
            font-family:Arial,sans-serif;
            font-size:14px;
        ">
            ${this.configService.get(
            'MAIL_FOOTER_SIGNATURE',
        )}
        </p>

        <p style="
            margin-top:10px;
            margin-bottom:4px;
            font-family:Arial,sans-serif;
            font-size:14px;
            font-weight:600;
            color:#111827;
        ">
            ${this.configService.get(
            'MAIL_FOOTER_FROM_NAME',
        )}
        </p>

        <p style="
            margin:0;
            font-family:Arial,sans-serif;
            font-size:13px;
            color:#4b5563;
        ">
            ${this.configService.get(
            'COMPANY_NAME',
        )}
        </p>

        <p style="
            margin-top:4px;
            margin-bottom:16px;
            font-family:Arial,sans-serif;
            font-size:13px;
        ">
            <a
                href="mailto:${this.configService.get(
            'MAIL_FOOTER_CONTACT_EMAIL',
        )}"
                style="
                    color:#2563eb;
                    text-decoration:none;
                "
            >
                ${this.configService.get(
            'MAIL_FOOTER_CONTACT_EMAIL',
        )}
            </a>
        </p>
        
        <hr style="
            margin-top:32px;
            margin-bottom:24px;
            border:none;
            border-top:1px solid #d1d5db;
        ">

        <p style="
            margin:0;
            font-family:Arial,sans-serif;
            font-size:11px;
            line-height:1.6;
            color:#6b7280;
        ">
            ${this.configService.get(
            'MAIL_DISCLAIMER_LINE_1',
        )}
            <br>
            ${this.configService.get(
            'MAIL_DISCLAIMER_LINE_2',
        )}
        </p>
        <p style="
            margin-top:8px;
            font-family:Arial,sans-serif;
            font-size:11px;
            line-height:1.6;
            color:#9ca3af;
        ">
            Reference ID: ${referenceId}
            <br>
            Generated at: ${generatedAt}
        </p>
    `;
    }
}