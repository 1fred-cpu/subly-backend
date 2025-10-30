import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtHelper } from './jwt.helper';

@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}), // JwtService will be injected by helper
  ],
  providers: [JwtHelper],
  exports: [JwtHelper],
})
export class JwtHelperModule {}