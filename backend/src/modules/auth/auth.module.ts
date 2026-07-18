import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ProfilesModule } from '../profiles/profiles.module';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';

@Global()
@Module({
  imports: [ProfilesModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [],
})
export class AuthModule {}
