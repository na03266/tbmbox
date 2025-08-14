import { CreateTbmSnapshotDto } from './dto/create-tbm-snapshot.dto';
import { UpdateTbmSnapshotDto } from './dto/update-tbm-snapshot.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbmSnapshot } from './entities/tbm-snapshot.entity';

@Injectable()
export class TbmSnapshotService {
	constructor(
		@InjectRepository(TbmSnapshot)
		private readonly snapshotRepository: Repository<TbmSnapshot>,
	) {}

	async create(createTbmSnapshotDto: CreateTbmSnapshotDto) {
		const snapshot = this.snapshotRepository.create(createTbmSnapshotDto);
		return this.snapshotRepository.save(snapshot);
	}

	async findAll(): Promise<TbmSnapshot[]> {
		return this.snapshotRepository
			.createQueryBuilder('snapshot')
			.orderBy('snapshot.id', 'DESC')
			.getMany();
	}

	async findOne(id: number) {
		return await this.snapshotRepository
			.createQueryBuilder('snapshot')
			.where('snapshot.id = :id', { id })
			.getOne();
	}

	async update(id: number, updateTbmSnapshotDto: UpdateTbmSnapshotDto) {
		await this.snapshotRepository
			.createQueryBuilder()
			.update(TbmSnapshot)
			.set(updateTbmSnapshotDto)
			.where('id = :id', { id })
			.execute();

		return this.findOne(id);
	}

	async remove(id: number) {
		const snapshot = await this.findOne(id);
		await this.snapshotRepository
			.createQueryBuilder()
			.delete()
			.from(TbmSnapshot)
			.where('id = :id', { id })
			.execute();
		return snapshot;
	}
}
