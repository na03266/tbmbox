import {Module} from '@nestjs/common';
import {WorkshopService} from './workshop.service';
import {WorkshopController} from './workshop.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Company} from "../company/entities/company.entity";
import {Workshop} from './entities/workshop.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Workshop,
            Company,
        ]),
    ],
    controllers: [WorkshopController],
    providers: [WorkshopService],
})
export class WorkshopModule {
}
