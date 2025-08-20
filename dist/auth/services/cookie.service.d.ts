import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
export declare class CookieService {
    private config;
    constructor(config: ConfigService);
    setRefreshTokenCookie(response: Response, refreshToken: string): void;
    clearAuthCookies(response: Response): void;
}
