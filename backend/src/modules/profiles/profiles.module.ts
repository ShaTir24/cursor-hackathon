import { Module } from '@nestjs/common';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { ProfileStore } from './profile.store';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [CatalogueModule],
  controllers: [ProfilesController],
  providers: [ProfileStore],
  exports: [ProfileStore],
})
export class ProfilesModule {}
