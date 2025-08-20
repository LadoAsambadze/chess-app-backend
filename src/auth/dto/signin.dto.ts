// dto/signin.dto.ts
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SigninDto {
  @ApiProperty({
    example: "lado1@gmail.com",
    description: "User email address",
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "Lado12345!",
    description: "User password",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
