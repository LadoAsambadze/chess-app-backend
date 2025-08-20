"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = class EmailService {
    config;
    transporter;
    constructor(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.config.get('EMAIL_USER'),
                pass: this.config.get('EMAIL_APP_PASSWORD'),
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }
    async sendVerificationEmail(email, token, firstname) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome ${firstname}!</h2>
                    <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #007bff; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p>If the button doesn't work, you can also click this link:</p>
                    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                    
                    <p><small>This link will expire in 24 hours.</small></p>
                    
                    <hr style="margin: 30px 0;">
                    <p><small>If you didn't create an account, please ignore this email.</small></p>
                </div>
            `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Verification email sent successfully');
        }
        catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    }
    async sendUpdatePasswordEmail(email, token) {
        const updatePasswordUrl = `${process.env.FRONTEND_URL}/update-password?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Password',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                
                <p>We received a request to update your password. Please click the button below to set a new password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${updatePasswordUrl}" 
                       style="background-color: #007bff; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Update Password
                    </a>
                </div>
                
                <p>If the button doesn't work, copy and paste the following link into your browser:</p>
                <p><a href="${updatePasswordUrl}">${updatePasswordUrl}</a></p>
                
                <p><small>This link will expire in 24 hours.</small></p>
                
                <hr style="margin: 30px 0;">
                <p><small>If you did not request a password update, please ignore this email or contact support.</small></p>
            </div>
        `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Password update email sent successfully');
        }
        catch (error) {
            console.error('Error sending password update email:', error);
            throw error;
        }
        return 'success';
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map