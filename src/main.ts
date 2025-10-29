import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Create the HTTP app
  const app = NestFactory.create(AppModule);

  // // Connect a microservice to the same app
  // (await app).connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.REDIS,
  //   options: {
  //     host: 'localhost',
  //     port: 6379,
  //   },
  // });

  // // Start both HTTP and microservices listeners
  // (await app).startAllMicroservices();
  (await app).listen(process.env.PORT || 3000);
}
bootstrap();
