import type { GameStatus, GameResult, PlayerColor } from "@prisma/client";

export class GameResponseDto {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  status: GameStatus;
  result?: GameResult;
  winnerId?: string;
  currentTurn: PlayerColor;
  boardState: string;
  timeControl?: number;
  whiteTimeLeft?: number;
  blackTimeLeft?: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  moves?: MoveResponseDto[];
}

export class MoveResponseDto {
  id: string;
  moveNumber: number;
  from: string;
  to: string;
  piece: string;
  notation: string;
  fen: string;
  timeSpent?: number;
  createdAt: Date;
  playerId: string;
}
