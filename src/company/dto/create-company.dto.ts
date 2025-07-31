import {IsNotEmpty, IsString} from "class-validator";

export class CreateCompanyDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    addressDetail: string;
}

