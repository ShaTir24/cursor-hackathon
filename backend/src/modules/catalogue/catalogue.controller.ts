import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { CatalogueService } from './catalogue.service';

@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueService) {}

  @Public()
  @Get()
  getCatalogue() {
    return this.catalogue.getCatalogue();
  }

  @Public()
  @Get('age-groups/:ageGroupId/themes')
  getThemes(@Param('ageGroupId') ageGroupId: string) {
    return this.catalogue.getThemesForAgeGroup(ageGroupId);
  }
}
