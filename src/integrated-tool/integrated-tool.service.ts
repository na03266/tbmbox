import { Injectable } from '@nestjs/common';
import { CreateIntegratedToolDto } from './dto/create-integrated-tool.dto';
import { UpdateIntegratedToolDto } from './dto/update-integrated-tool.dto';
import { Like, Repository } from 'typeorm';
import { IntegratedTool } from './entities/integrated-tool.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IntegratedToolService {
	constructor(
		@InjectRepository(IntegratedTool)
		private readonly integratedToolRepository: Repository<IntegratedTool>,
	) {}

	async create(createIntegratedToolDto: CreateIntegratedToolDto) {
		const toolExists = await this.integratedToolRepository.findOne({
			where: { name: createIntegratedToolDto.name },
		});
		if (toolExists) {
			throw new Error(
				`Tool with name ${createIntegratedToolDto.name} already exists`,
			);
		}

		const tool = this.integratedToolRepository.create(createIntegratedToolDto);

		await this.integratedToolRepository.save(tool);

		return await this.integratedToolRepository.findOne({
			where: { id: tool.id },
		});
	}

	async findAll() {
		return await this.integratedToolRepository.find({
			select:{
				id: true,
				name: true,
			},
		});
	}

	async findOne(id: number) {
		const tool = await this.integratedToolRepository.findOne({ where: { id } });

		if (!tool) {
			throw new Error(`Tool with id ${id} not found`);
		}

		return tool;
	}

	async update(id: number, updateIntegratedToolDto: UpdateIntegratedToolDto) {
		const tool = await this.integratedToolRepository.findOne({ where: { id } });
		if (!tool) {
			throw new Error(`Tool with id ${id} not found`);
		}

		await this.integratedToolRepository.update(id, updateIntegratedToolDto);

		return await this.integratedToolRepository.findOne({ where: { id } });
	}

	async remove(id: number) {
		const tool = await this.integratedToolRepository.findOne({ where: { id } });

		if (!tool) {
			throw new Error(`Tool with id ${id} not found`);
		}

		await this.integratedToolRepository.softRemove(tool);
		return id;
	}
}
