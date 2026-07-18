import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/jwt-auth.guard';
import { CatalogueService } from './catalogue.service';
import { CatalogueStore } from './catalogue.store';

@Controller('catalogue')
export class CatalogueController {
  constructor(
    private readonly catalogue: CatalogueService,
    private readonly store: CatalogueStore,
  ) {}

  /** EduReels onboarding shape: { topics, interests } with UUID ids */
  @Public()
  @Get()
  list() {
    return this.store.list();
  }

  /** Extended MentorScroll-style catalogue (age themes / priorities) */
  @Public()
  @Get('extended')
  getExtended() {
    return this.catalogue.getCatalogue();
  }

  @Public()
  @Get('age-groups/:ageGroupId/themes')
  getThemes(@Param('ageGroupId') ageGroupId: string) {
    return this.catalogue.getThemesForAgeGroup(ageGroupId);
  }
}
