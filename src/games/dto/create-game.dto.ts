import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsBoolean,
  IsString,
} from "class-validator";

export class CreateGameDto {
  @ApiProperty({ example: 5, description: "Time control in minutes" })
  @IsInt()
  @Min(1)
  @Max(20000)
  timeControl: number;

  @ApiProperty({ example: false, description: "Is the game private?" })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiProperty({
    example: "secret123",
    description: "Password for private game",
  })
  @IsOptional()
  @IsString()
  password?: string;
}
