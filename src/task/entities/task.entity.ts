import {
	Column,
	Entity,
	JoinColumn, JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Workshop } from '../../workshop/entities/workshop.entity';
import { Company } from '../../company/entities/company.entity';
import { Exclude } from 'class-transformer';
import { Tool } from '../../tool/entities/tool.entity';

@Entity()
export class Task extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column({
		nullable: true,
		type: 'text',
	})
	description: string;

	@ManyToMany(() => Workshop, (workshop) => workshop.tasks)
	workshops: Workshop[];

	@Column()
	@Exclude()
	companyId: number;

	@ManyToOne(() => Company, (company) => company.tasks)
	@JoinColumn({ name: 'companyId' })
	company: Company;

	@ManyToMany(() => Tool, (tool) => tool.tasks)
	@JoinTable()
	tools: Tool[]

}
