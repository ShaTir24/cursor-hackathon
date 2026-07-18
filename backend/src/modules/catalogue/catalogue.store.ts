import { Injectable, OnModuleInit } from '@nestjs/common';
import { v5 as uuidv5 } from 'uuid';
import { CatalogueItem } from '../profiles/profile.types';

// Fixed namespace so a slug always maps to the same UUID across restarts.
// This keeps stored profile topicIds/interestIds valid after a reboot.
const CATALOGUE_NAMESPACE = '3b1e4c1a-9c2a-4a5e-8f0e-7d6c5b4a3f21';
const stableId = (slug: string): string => uuidv5(slug, CATALOGUE_NAMESPACE);

const TOPIC_SEED: Array<[string, string]> = [
  ['photosynthesis', 'Photosynthesis'],
  ['fractions', 'Fractions'],
  ['gravity', 'Gravity'],
  ['water-cycle', 'Water Cycle'],
  ['democracy', 'Democracy'],
];

const INTEREST_SEED: Array<[string, string]> = [
  ['cricket', 'Cricket'],
  ['gaming', 'Gaming'],
  ['cooking', 'Cooking'],
  ['space', 'Space'],
  ['music', 'Music'],
];

@Injectable()
export class CatalogueStore implements OnModuleInit {
  private topics: CatalogueItem[] = [];
  private interests: CatalogueItem[] = [];

  onModuleInit(): void {
    this.topics = TOPIC_SEED.map(([slug, label]) => ({
      id: stableId(slug),
      slug,
      label,
    }));
    this.interests = INTEREST_SEED.map(([slug, label]) => ({
      id: stableId(slug),
      slug,
      label,
    }));
  }

  list() {
    return { topics: [...this.topics], interests: [...this.interests] };
  }

  getTopic(id: string) {
    return this.topics.find((t) => t.id === id);
  }

  getInterest(id: string) {
    return this.interests.find((i) => i.id === id);
  }

  topicBySlug(slug: string) {
    return this.topics.find((t) => t.slug === slug);
  }

  interestBySlug(slug: string) {
    return this.interests.find((i) => i.slug === slug);
  }
}
