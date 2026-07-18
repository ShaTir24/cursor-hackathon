import { Injectable, NotFoundException } from '@nestjs/common';
import catalogueData from './data/age-themes.json';
import {
  AgeGroup,
  CataloguePayload,
  Theme,
  Topic,
} from './catalogue.types';

@Injectable()
export class CatalogueService {
  private readonly data = catalogueData as CataloguePayload;

  getCatalogue(): CataloguePayload {
    return this.data;
  }

  getThemesForAgeGroup(ageGroupId: string): {
    ageGroupId: string;
    themes: Theme[];
  } {
    const themes = this.data.themesByAgeGroup[ageGroupId];
    if (!themes) {
      throw new NotFoundException(`Unknown age group: ${ageGroupId}`);
    }
    return { ageGroupId, themes };
  }

  getAgeGroupIds(): Set<string> {
    return new Set(this.data.ageGroups.map((g: AgeGroup) => g.id));
  }

  getTopicIds(): Set<string> {
    return new Set(this.data.topics.map((t: Topic) => t.id));
  }

  getThemeIdsForAgeGroups(ageGroupIds: string[]): Set<string> {
    const ids = new Set<string>();
    for (const ageGroupId of ageGroupIds) {
      const themes = this.data.themesByAgeGroup[ageGroupId] ?? [];
      for (const theme of themes) ids.add(theme.id);
    }
    return ids;
  }

  resolveThemeAgeGroups(themeIds: string[]): string[] {
    const matched = new Set<string>();
    for (const [ageGroupId, themes] of Object.entries(
      this.data.themesByAgeGroup,
    )) {
      if (themes.some((t) => themeIds.includes(t.id))) {
        matched.add(ageGroupId);
      }
    }
    return [...matched];
  }
}
