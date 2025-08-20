import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserAccountService } from "../services/user-account.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly userAccountService: UserAccountService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>("JWT_SECRET") || "your-jwt-secret-key",
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.userAccountService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      if (!user.isActive) {
        throw new UnauthorizedException("User account is deactivated");
      }

      if (!user.isVerified) {
        throw new UnauthorizedException("User account is not verified");
      }

      return {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        avatar: user.avatar,
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
