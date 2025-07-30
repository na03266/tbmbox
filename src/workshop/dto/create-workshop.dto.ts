import {IsBoolean, IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateWorkshopDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsBoolean()
    isCabinet: boolean;

    @IsNotEmpty()
    @IsNumber()
    companyId: number
}
