import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import fastifyCors from '@fastify/cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
  );

  // Enable CORS (adjust origin for production)
  await app.register(fastifyCors as any, {
    origin: ['http://localhost:3000', 'https://yourapp.com'],
    credentials: true,
  });

  // Global Prefix (API routes)
  app.setGlobalPrefix('v1/api');

  // Start Server
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
