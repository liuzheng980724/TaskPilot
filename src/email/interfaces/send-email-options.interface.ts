export interface SendEmailOptions {

    to: string[];

    cc?: string[];

    bcc?: string[];

    replyTo?: string;

    subject: string;

    html: string;

    attachments?: {
        filename: string;
        path: string;
    }[];
}