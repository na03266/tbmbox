import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {BaseTable} from "../../common/entity/base-table.entity";

@Entity()
export class IntegratedTool extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({
		nullable: true,
		type: 'text',
	})
	manual: string;
}
