import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {ChecklistLog} from './checklist-log.entity';

@Entity()
export class ChecklistLogChild {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	content: string;

	@Column()
	parentId: number;

	@ManyToOne(() => ChecklistLog)
	@JoinColumn({ name: 'parentId' })
	parent: ChecklistLog;
}
