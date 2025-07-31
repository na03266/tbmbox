import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Company} from "../../company/entities/company.entity";
import {Workshop} from "../../workshop/entities/workshop.entity";
import {Exclude} from "class-transformer";

export enum UserRole {
    MASTER = 'master',
    SUPERADMIN = 'superadmin',
    ADMIN = 'admin',
    USER = 'user',
}

@Entity()
export class User {
    @PrimaryColumn()
    phone: string

    @Column()
    name: string

    @Column()
    @Exclude({
        toPlainOnly: true
    })
    password: string

    @Column({default: false})
    isActive: boolean

    @Column({nullable: true})
    icCardNumber: string

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole

    @Column()
    companyId: number

    @ManyToOne(
        () => Company,
        (company) => company.users,
        {
            onDelete: 'SET NULL',
            nullable: true,
        }
    )
    @JoinColumn({name: 'companyId'})
    company: Company


    @Column({nullable: true})
    workshopId: number

    @ManyToOne(
        () => Workshop,
        (workshop) => workshop.users,
        {
            onDelete: 'SET NULL',
            nullable: true,
        }
    )
    @JoinColumn({name: 'workshopId'})
    workshop: Workshop
}
