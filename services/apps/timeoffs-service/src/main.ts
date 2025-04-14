import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Timeoffs API')
    .setDescription('API for managing timeoffs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const CORS_ORIGINS = configService.get('CORS_ORIGINS');
  if (CORS_ORIGINS) {
    const corsOptions: CorsOptions = {
      origin: CORS_ORIGINS.split(','),
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

    app.enableCors(corsOptions);
  }

  await app.listen(process.env.TIMEOFFS_SERVICE_PORT ?? 3000);
}
bootstrap();
