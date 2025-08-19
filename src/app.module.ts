import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CompanyModule } from './company/company.module';
import { WorkshopModule } from './workshop/workshop.module';
import { TaskModule } from './task/task.module';
import { AuthModule } from './auth/auth.module';
import { envVariables } from './common/const/env.const';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { TbmModule } from './tbm/tbm.module';
import { ChecklistModule } from './checklist/checklist.module';
import { ToolModule } from './tool/tool.module';
import { IntegratedToolModule } from './integrated-tool/integrated-tool.module';
import { TbmLogModule } from './tbm-log/tbm-log.module';
import { ChecklistLogModule } from './checklist-log/checklist-log.module';

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
		TbmModule,
		ChecklistModule,
		ToolModule,
		IntegratedToolModule,
		TbmLogModule,
		ChecklistLogModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(BearerTokenMiddleware)
			.exclude(
				{
					path: '/auth/login',
					method: RequestMethod.POST,
				},
				{
					path: '/auth/admin/register',
					method: RequestMethod.POST,
				},
				{
					path: '/auth/user/register',
					method: RequestMethod.POST,
				},
			)
			.forRoutes('*');
	}
}
