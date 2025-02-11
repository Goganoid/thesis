import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import * as dotenv from 'dotenv';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

dotenv.config();

const CORS_ORIGINS = process.env.CORS_ORIGINS;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Authentication API with Supabase')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  if (CORS_ORIGINS) {
    const corsOptions: CorsOptions = {
      origin: CORS_ORIGINS.split(','),
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

    app.enableCors(corsOptions);
  }

  await app.listen(process.env.USER_SERVICE_PORT ?? 3000);
}

bootstrap();
