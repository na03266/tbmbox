import { Injectable } from '@nestjs/common';
import { CreateIntegratedToolDto } from './dto/create-integrated-tool.dto';
import { UpdateIntegratedToolDto } from './dto/update-integrated-tool.dto';
import { Repository } from 'typeorm';
import { IntegratedTool } from './entities/integrated-tool.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from '../common/common.service';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';

@Injectable()
export class IntegratedToolService {
	constructor(
		@InjectRepository(IntegratedTool)
		private readonly integratedToolRepository: Repository<IntegratedTool>,
		private readonly commonService: CommonService,
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

	async findAll(dto: PagePaginationDto) {
		const { searchKey, searchValue } = dto;
		const qb = this.integratedToolRepository
			.createQueryBuilder('tool')
			.where('tool.deletedAt IS NULL');

		if (searchKey && searchValue) {
			qb.andWhere(`${searchKey} LIKE :searchValue`, {
				searchValue: `%${searchValue}%`,
			});
		}
		this.commonService.applyPagePaginationParamToQb(qb, dto);

		qb.orderBy('tool.createdAt', 'DESC');

		const tools = await qb.getMany();
		const total = await qb.getCount();
		return {
			data: tools.map((tool) => ({
				id: tool.id,
				name: tool.name,
				createdAt: tool.createdAt.toLocaleString(),
			})),
			total,
		};
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
