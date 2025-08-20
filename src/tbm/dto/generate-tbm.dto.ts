import { CreateTbmDto } from './create-tbm.dto';
import { PartialType } from '@nestjs/mapped-types';

export class GenerateTbmDto extends PartialType(CreateTbmDto) {}
