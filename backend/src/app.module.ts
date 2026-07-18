import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogueModule } from './modules/catalogue/catalogue.module';
import { GenerationModule } from './modules/generation/generation.module';
import { ProfilesModule } from './modules/profiles/profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CatalogueModule,
    ProfilesModule,
    GenerationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
