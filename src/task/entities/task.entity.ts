import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {BaseTable} from "../../common/entity/base-table.entity";

@Entity()
export class Task  extends BaseTable{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    title: string;

    @Column()
    description: string;
}
