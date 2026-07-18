import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/jwt-auth.guard';
import { CatalogueStore } from './catalogue.store';

@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueStore) {}

  @Public()
  @Get()
  getCatalogue() {
    return this.catalogue.list();
  }
}
