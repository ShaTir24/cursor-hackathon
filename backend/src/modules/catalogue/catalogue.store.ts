import { Injectable, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CatalogueItem } from '../profiles/profile.types';

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
      id: uuidv4(),
      slug,
      label,
    }));
    this.interests = INTEREST_SEED.map(([slug, label]) => ({
      id: uuidv4(),
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
