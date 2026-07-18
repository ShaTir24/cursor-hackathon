import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ResearchSnippet {
  title: string;
  text: string;
  url?: string;
}

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);

  constructor(private readonly config: ConfigService) {}

  async enrichTopic(topic: string): Promise<ResearchSnippet[]> {
    const enabled = this.config.get('EXA_ENABLED', 'true') !== 'false';
    const apiKey = this.config.get<string>('EXA_API_KEY');
    if (!enabled || !apiKey) {
      this.logger.debug('Exa skipped (disabled or no key)');
      return [];
    }
    try {
      const res = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          query: `${topic} educational explanation for students`,
          numResults: 3,
          contents: { text: { maxCharacters: 400 } },
        }),
      });
      if (!res.ok) {
        this.logger.warn(`Exa ${res.status}`);
        return [];
      }
      const data = (await res.json()) as {
        results?: Array<{ title?: string; text?: string; url?: string }>;
      };
      return (data.results ?? []).map((r) => ({
        title: r.title ?? 'source',
        text: r.text ?? '',
        url: r.url,
      }));
    } catch (err) {
      this.logger.warn(`Exa failed: ${String(err)}`);
      return [];
    }
  }
}
