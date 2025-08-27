import { Module } from "@nestjs/common";
import { ChessService } from "./chess.service";
import { ChessController } from "./chess.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { GamesGateway } from "./chess.gateway";
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
