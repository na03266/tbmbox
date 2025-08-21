import { PartialType } from '@nestjs/mapped-types';
import { CreateDashDto } from './create-dash.dto';

export class UpdateDashDto extends PartialType(CreateDashDto) {}
