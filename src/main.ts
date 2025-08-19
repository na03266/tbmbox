import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);
	app.enableCors({
		origin: true,
		credentials: true, // 쿠키 쓸 거면 true
		methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
		allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
	});

	await app.listen(3000, '0.0.0.0');
}

bootstrap();
