import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserAccountService } from "../services/user-account.service";
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly userAccountService;
    constructor(configService: ConfigService, userAccountService: UserAccountService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        firstname: string;
        lastname: string;
        role: string;
        isActive: true;
        isVerified: true;
        avatar: string | null | undefined;
    }>;
}
export {};
