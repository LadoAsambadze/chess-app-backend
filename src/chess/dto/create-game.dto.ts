import { IsString, IsOptional, IsInt, Min, Max } from "class-validator";

export class CreateGameDto {
  @IsString()
  opponentId: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(3600)
  timeControl?: number;
}
