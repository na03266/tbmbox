import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import * as Joi from "joi";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from './users/users.module';
import {CompanyModule} from './company/company.module';
import {WorkshopModule} from './workshop/workshop.module';
import {TaskModule} from './task/task.module';
import {AuthModule} from './auth/auth.module';
import {envVariables} from './common/const/env.const';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                ENV: Joi.string().valid('dev', 'prod').required(),
                DB_TYPE: Joi.string().valid('postgres').required(),
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.number().required(),
                DB_USERNAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_DATABASE: Joi.string().required(),
                HASH_ROUNDS: Joi.number().required(),
                ACCESS_TOKEN_SECRET: Joi.string().required(),
                REFRESH_TOKEN_SECRET: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: configService.get<string>(envVariables.dbType) as 'postgres',
                host: configService.get<string>(envVariables.dbHost),
                port: configService.get<number>(envVariables.dbPort),
                username: configService.get<string>(envVariables.dbUsername),
                password: configService.get<string>(envVariables.dbPassword),
                database: configService.get<string>(envVariables.dbDatabase),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        UsersModule,
        CompanyModule,
        WorkshopModule,
        TaskModule,
        AuthModule,
    ],
})
export class AppModule {
}
