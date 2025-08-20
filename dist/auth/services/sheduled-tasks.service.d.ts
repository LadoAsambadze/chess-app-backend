import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
export declare class ScheduledTasksService {
    private readonly tokenService;
    private readonly configService;
    private readonly logger;
    constructor(tokenService: TokenService, configService: ConfigService);
    handleTokenCleanup(): Promise<void>;
    handleTokenStatsLogging(): Promise<void>;
    manualTokenCleanup(): Promise<{
        success: boolean;
        deletedCount: number;
        error?: string;
    }>;
}
