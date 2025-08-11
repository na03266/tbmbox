import { PartialType } from '@nestjs/mapped-types';
import { CreateIntegratedToolDto } from './create-integrated-tool.dto';

export class UpdateIntegratedToolDto extends PartialType(CreateIntegratedToolDto) {}
