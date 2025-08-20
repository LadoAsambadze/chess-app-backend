import { Module } from "@nestjs/common";
import { ChessService } from "./chess.service";
import { ChessController } from "./chess.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ChessController],
  providers: [ChessService],
  exports: [ChessService],
})
export class ChessModule {}
