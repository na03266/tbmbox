import {IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString} from "class-validator";
import {UserRole} from "../entities/user.entity";

export class CreateUserDto {
    @IsString()
    phone: string;

    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsNotEmpty()
    @IsNumber()
    companyId: number

    @IsNumber()
    workshopId: number

    @IsString()
    icCardNumber: string

    @IsBoolean()
    isActive: boolean
}
