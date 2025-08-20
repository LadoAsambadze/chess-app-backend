import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class MakeMoveDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsOptional()
  @IsString()
  promotion?: string;
}
