import { Module } from "@nestjs/common";

import { GamesController } from "./games.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { GamesGateway } from "./games.gateway";
import { JwtModule } from "@nestjs/jwt";
import { GamesService } from "./games.service";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "24h" },
    }),
  ],
  controllers: [GamesController],
  providers: [GamesService, GamesGateway],
  exports: [GamesService],
})
export class ChessModule {}
