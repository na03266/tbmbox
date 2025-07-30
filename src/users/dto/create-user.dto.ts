import {IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {UserRole} from "../entities/user.entity";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEnum(UserRole)
    role: UserRole = UserRole.USER;

    @IsNotEmpty()
    @IsNumber()
    companyId: number

    @IsOptional()
    @IsNumber()
    workshopId: number

    @IsOptional()
    @IsString()
    icCardNumber: string

    @IsBoolean()
    isActive: boolean = false;
}
