import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/jwt-auth.guard';
import { CatalogueStore } from './catalogue.store';

@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly store: CatalogueStore) {}

  /** EduReels onboarding shape: { topics, interests } with UUID ids */
  @Public()
  @Get()
  list() {
    return this.store.list();
  }
}
