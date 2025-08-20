import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private config;
    private transporter;
    constructor(config: ConfigService);
    sendVerificationEmail(email: string, token: string, firstname: string): Promise<void>;
    sendUpdatePasswordEmail(email: string, token: string): Promise<string>;
}
