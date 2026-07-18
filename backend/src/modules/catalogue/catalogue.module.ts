import { Module } from '@nestjs/common';
import { CatalogueController } from './catalogue.controller';
import { CatalogueStore } from './catalogue.store';

@Module({
  controllers: [CatalogueController],
  providers: [CatalogueStore],
  exports: [CatalogueStore],
})
export class CatalogueModule {}
