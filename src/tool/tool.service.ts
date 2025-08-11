import { Injectable } from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { UserRole } from '../users/entities/user.entity';
import { Tool } from './entities/tool.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ToolService {
	constructor(
		@InjectRepository(Tool)
		private readonly toolRepository: Repository<Tool>,
	) {}

	create(createToolDto: CreateToolDto) {
		return 'This action adds a new tool';
	}

	async findAll(req) {
		const qb = this.toolRepository
			.createQueryBuilder('tool')
			.where('tool.deletedAt IS NULL');
		if (req.user.role !== UserRole.MASTER) {
			qb.andWhere('tool.companyId = :id', { id: req.user.companyId });
		}
		await qb.getMany();

		return await qb.getMany();
	}

	findOne(id: number) {
		return `This action returns a #${id} tool`;
	}

	update(id: number, updateToolDto: UpdateToolDto) {
		return `This action updates a #${id} tool`;
	}

	remove(id: number) {
		return `This action removes a #${id} tool`;
	}
}
