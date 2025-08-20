import { ApiProperty } from "@nestjs/swagger";

export class GameResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  winnerId: string | null;

  @ApiProperty()
  creatorId: string;

  @ApiProperty({ required: false, nullable: true })
  opponentId: string | null;

  @ApiProperty({ required: false, nullable: true })
  pendingOpponentId: string | null;

  @ApiProperty()
  timeControl: number;

  @ApiProperty()
  fen: string;

  @ApiProperty({ type: [String] })
  moveHistory: any;

  @ApiProperty()
  isPrivate: boolean;
}
