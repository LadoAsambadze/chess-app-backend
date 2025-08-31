import { Module } from "@nestjs/common";
import { ChessService } from "./games.service";
import { ChessController } from "./games.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { GamesGateway } from "./games.gateway";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "24h" }, // optional
    }),
  ],
  controllers: [ChessController],
  providers: [ChessService, GamesGateway],
  exports: [ChessService],
})
export class ChessModule {}
