import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Authentication API with Supabase')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const CORS_ORIGINS = configService.get('CORS_ORIGINS');
  console.log(CORS_ORIGINS);
  if (CORS_ORIGINS) {
    const corsOptions: CorsOptions = {
      origin: CORS_ORIGINS.split(','),
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

    app.enableCors(corsOptions);
  }

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: configService.getOrThrow('USER_SERVICE_GRPC_URL'),
      package: configService.getOrThrow('USER_SERVICE_GRPC_PACKAGE'),
      protoPath: join(__dirname, 'proto/users.proto'),
      loader: {
        defaults: true,
        arrays: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.USER_SERVICE_PORT ?? 3000);
}

bootstrap();
