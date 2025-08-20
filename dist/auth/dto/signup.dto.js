"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class SignupDto {
    firstname;
    lastname;
    email;
    password;
    avatar;
    phone;
}
exports.SignupDto = SignupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Joni",
        description: "User first name",
        type: String,
    }),
    (0, class_validator_1.IsString)({ message: "First name must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "First name is required" }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, {
        message: "First name can only contain letters, spaces, hyphens, and apostrophes",
    }),
    (0, class_validator_1.MinLength)(2, { message: "First name must be at least 2 characters long" }),
    (0, class_validator_1.MaxLength)(50, { message: "First name cannot exceed 50 characters" }),
    __metadata("design:type", String)
], SignupDto.prototype, "firstname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Doe",
        description: "User last name",
        type: String,
    }),
    (0, class_validator_1.IsString)({ message: "Last name must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Last name is required" }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, {
        message: "Last name can only contain letters, spaces, hyphens, and apostrophes",
    }),
    (0, class_validator_1.MinLength)(2, { message: "Last name must be at least 2 characters long" }),
    (0, class_validator_1.MaxLength)(50, { message: "Last name cannot exceed 50 characters" }),
    __metadata("design:type", String)
], SignupDto.prototype, "lastname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "joni.doe@example.com",
        description: "User email address",
        type: String,
    }),
    (0, class_validator_1.IsString)({ message: "Email must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Email is required" }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toLowerCase()),
    (0, class_validator_1.IsEmail)({}, { message: "Please provide a valid email address" }),
    (0, class_validator_1.MaxLength)(255, { message: "Email cannot exceed 255 characters" }),
    __metadata("design:type", String)
], SignupDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Lado12345!",
        description: "User password. Must contain at least 8 characters, including uppercase, lowercase, number, and special character",
        type: String,
    }),
    (0, class_validator_1.IsString)({ message: "Password must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Password is required" }),
    (0, class_validator_1.MinLength)(8, { message: "Password must be at least 8 characters long" }),
    (0, class_validator_1.MaxLength)(128, { message: "Password cannot exceed 128 characters" }),
    (0, class_validator_1.IsStrongPassword)({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }, {
        message: "Password must contain at least 8 characters with uppercase, lowercase, number, and special character",
    }),
    __metadata("design:type", String)
], SignupDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "https://example.com/avatar.png",
        description: "Optional user avatar URL",
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: "Avatar must be a valid URL" }),
    __metadata("design:type", String)
], SignupDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "+995598123456",
        description: "Optional user phone number",
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SignupDto.prototype, "phone", void 0);
//# sourceMappingURL=signup.dto.js.map