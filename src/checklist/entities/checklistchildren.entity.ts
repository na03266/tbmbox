import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';
import { Checklist } from './checklist.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Exclude } from 'class-transformer';

@Unique(['parentId', 'content'])
@Entity()
export class ChecklistChild extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	content: string;

	@Column()
	@Exclude()
	parentId: number;

	@ManyToOne(() => Checklist, (checklist) => checklist.children)
	@JoinColumn({ name: 'parentId' })
	parent: Checklist;
}
