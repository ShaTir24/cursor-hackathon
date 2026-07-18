export type CatalogueItem = { id: string; slug: string; label: string };

export type Profile = {
  userId: string;
  role: "student" | "teacher" | null;
  displayName: string | null;
  ageGroup: string | null;
  onboardingComplete: boolean;
  topics: CatalogueItem[];
  interests: CatalogueItem[];
  subjects: CatalogueItem[];
  gradeBands: string[];
};

export type VideoStatus = {
  id: string;
  status: string;
  title?: string;
  hlsUrl: string;
  playlistType?: string;
  scenesReady: number;
  scenesTotal: number | null;
  lessonPackId: string | null;
  error?: string | null;
};

export type LessonPack = {
  id: string;
  videoId: string;
  payload: {
    objectives: string[];
    talkingPoints: string[];
    quiz: { q: string; choices: string[]; answerIndex: number }[];
  };
};
