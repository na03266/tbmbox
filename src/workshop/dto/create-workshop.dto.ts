import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWorkshopDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    address: string;

		@IsOptional()
    @IsString()
    addressDetail: string;

    @IsOptional()
    @IsBoolean()
    isCabinet: boolean;

    @IsNotEmpty()
    @IsNumber()
    companyId: number
}
