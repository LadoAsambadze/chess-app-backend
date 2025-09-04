import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsStrongPassword,
  IsOptional,
  IsUrl,
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SignupDto {
  @ApiProperty({
    example: "Joni",
    description: "User first name",
    type: String,
  })
  @IsString({ message: "First name must be a string" })
  @IsNotEmpty({ message: "First name is required" })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      "First name can only contain letters, spaces, hyphens, and apostrophes",
  })
  @MinLength(2, { message: "First name must be at least 2 characters long" })
  @MaxLength(50, { message: "First name cannot exceed 50 characters" })
  firstname: string;

  @ApiProperty({
    example: "Doe",
    description: "User last name",
    type: String,
  })
  @IsString({ message: "Last name must be a string" })
  @IsNotEmpty({ message: "Last name is required" })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      "Last name can only contain letters, spaces, hyphens, and apostrophes",
  })
  @MinLength(2, { message: "Last name must be at least 2 characters long" })
  @MaxLength(50, { message: "Last name cannot exceed 50 characters" })
  lastname: string;

  @ApiProperty({
    example: "joni_doe",
    description: "Unique username for the user (3–30 chars, lowercase)",
    type: String,
  })
  @IsString({ message: "Username must be a string" })
  @IsNotEmpty({ message: "Username is required" })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @Matches(/^(?![_-])(?!.*[_-]$)[a-z0-9_-]+$/, {
    message:
      "Username can only contain lowercase letters, numbers, underscores, hyphens, and cannot start or end with them",
  })
  @MinLength(3, { message: "Username must be at least 3 characters long" })
  @MaxLength(30, { message: "Username cannot exceed 30 characters" })
  username: string;

  @ApiProperty({
    example: "joni.doe@example.com",
    description: "User email address",
    type: String,
  })
  @IsString({ message: "Email must be a string" })
  @IsNotEmpty({ message: "Email is required" })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: "Please provide a valid email address" })
  @MaxLength(255, { message: "Email cannot exceed 255 characters" })
  email: string;

  @ApiProperty({
    example: "Lado12345!",
    description:
      "User password. Must contain at least 8 characters, including uppercase, lowercase, number, and special character",
    type: String,
  })
  @IsString({ message: "Password must be a string" })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(128, { message: "Password cannot exceed 128 characters" })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Password must contain at least 8 characters with uppercase, lowercase, number, and special character",
    }
  )
  password: string;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.png",
    description: "Optional user avatar URL",
    type: String,
  })
  @IsOptional()
  @IsUrl({}, { message: "Avatar must be a valid URL" })
  avatar?: string;

  @ApiPropertyOptional({
    example: "+995598123456",
    description: "Optional user phone number",
    type: String,
  })
  @IsOptional()
  phone?: string;
}
