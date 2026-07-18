import { NotFoundException } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';

describe('CatalogueService', () => {
  const service = new CatalogueService();

  it('returns age groups spanning 5–45 with shared topics', () => {
    const catalogue = service.getCatalogue();
    expect(catalogue.ageGroups[0].minAge).toBe(5);
    expect(catalogue.ageGroups.at(-1)?.maxAge).toBe(45);
    expect(catalogue.topics.length).toBeGreaterThanOrEqual(8);
    expect(Object.keys(catalogue.themesByAgeGroup)).toHaveLength(
      catalogue.ageGroups.length,
    );
  });

  it('returns themes for a known age group', () => {
    const result = service.getThemesForAgeGroup('ages_5_10');
    expect(result.themes.some((t) => t.id === 'theme_pokemon')).toBe(true);
  });

  it('404s unknown age groups', () => {
    expect(() => service.getThemesForAgeGroup('ages_99')).toThrow(
      NotFoundException,
    );
  });
});
