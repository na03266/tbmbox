import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { UserRole } from '../users/entities/user.entity';
import { Tool } from './entities/tool.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../task/entities/task.entity';

@Injectable()
export class ToolService {
	constructor(
		@InjectRepository(Tool)
		private readonly toolRepository: Repository<Tool>,
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
	) {}

	async create(companyId: number, createToolDto: CreateToolDto) {
		const tools = await this.toolRepository.find({
			where: {
				name: createToolDto.name,
				companyId: createToolDto.companyId ?? companyId,
			},
		});
		if (tools.length > 0) {
			throw new NotFoundException('장비 이름이 중복되었습니다.');
		}
		const tool = this.toolRepository.create({
			...createToolDto,
			companyId: createToolDto.companyId ?? companyId,
		});

		return await this.toolRepository.save(tool);
	}

	async findAll(req: any) {
		const qb = this.toolRepository
			.createQueryBuilder('tool')
			.where('tool.deletedAt IS NULL');

		if (req.user.role !== UserRole.MASTER) {
			qb.andWhere('tool.companyId = :id', { id: req.user.companyId });
		}

		return await qb.getMany();
	}

	async findOne(id: number) {
		const tool = await this.toolRepository.findOne({ where: { id } });

		if (!tool) {
			throw new NotFoundException('Tool not found');
		}

		return tool;
	}

	async findByTask(taskId: number, name?: string) {
		// 워크샵 정보와 연관된 작업들 조회
		const task = await this.taskRepository.findOne({
			where: { id: taskId },
			relations: ['tools'],
		});

		if (!task) {
			throw new NotFoundException('task not found');
		}

		const assignedTaskIds = new Set(task.tools.map((tool) => tool.id));

		const qb = this.toolRepository.createQueryBuilder('tool');

		qb.where('tool.deletedAt IS NULL');

		qb.andWhere('tool.companyId = :companyId', {
			companyId: task.companyId,
		});

		if (name) {
			qb.andWhere('tool.name LIKE :name', { name: `%${name}%` });
		}
		const allTasks = await qb.getMany();

		console.log(allTasks);

		return allTasks.map((tool) => ({
			id: tool.id,
			name: tool.name,
			isActivated: assignedTaskIds.has(tool.id),
		}));
	}

	async update(id: number, updateToolDto: UpdateToolDto) {
		const tool = await this.toolRepository.findOne({ where: { id } });

		if (!tool) {
			throw new NotFoundException('Tool not found');
		}

		await this.toolRepository.update(id, updateToolDto);
		return await this.toolRepository.findOne({ where: { id } });
	}

	async remove(id: number) {
		const tool = await this.toolRepository.findOne({ where: { id } });

		if (!tool) {
			throw new NotFoundException('Tool not found');
		}

		await this.toolRepository.softRemove(tool);
		return id;
	}

	async removeMultiple(ids: number[]) {
		const tools = await this.toolRepository.find({
			where: { id: In(ids) },
		});

		if (tools.length === 0) {
			throw new NotFoundException('삭제할 작업이 없습니다.');
		}

		if (tools.length !== ids.length) {
			throw new NotFoundException('일부 작업을 찾을 수 없습니다.');
		}

		await this.toolRepository.softRemove(tools);
		return tools.map((tool) => tool.id); // 실제 삭제된 ID만 리턴
	}
}
