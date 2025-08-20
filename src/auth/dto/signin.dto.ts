// dto/signin.dto.ts
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SigninDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "password123",
    description: "User password",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
