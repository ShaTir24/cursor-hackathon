import { PipelineService } from './pipeline.service';

describe('PipelineService.buildScenes', () => {
  it('builds five student scenes from topic/interest', () => {
    const svc = Object.create(PipelineService.prototype) as PipelineService;
    const scenes = svc.buildScenes(
      {
        topic: 'photosynthesis',
        interest: 'cricket',
        language: 'en',
        grade: '6',
        userId: 'u1',
        purpose: 'learn',
      },
      [],
    );
    expect(scenes).toHaveLength(5);
    expect(scenes[1].narration).toContain('cricket');
  });

  it('builds five teacher class-demo scenes', () => {
    const svc = Object.create(PipelineService.prototype) as PipelineService;
    const scenes = svc.buildScenes(
      {
        topic: 'Fractions',
        interest: 'classroom',
        language: 'en',
        grade: '11-13',
        userId: 't1',
        purpose: 'teach',
      },
      [],
    );
    expect(scenes[0].narration).toContain('Teachers');
  });
});
