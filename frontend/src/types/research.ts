export type ResearchRequest = {
  query: string;
  mode: 'topic' | 'url' | 'rss';
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  timeBudgetHours: number;
};

export type Brief = {
  oneLineSummary: string;
  whyLearn: string;
  keyTakeaways: string[];
  estimatedTime: string;
  nextAction: string;
};

export type ApiSource = {
  id: string;
  title: string;
  source: string;
  url: string;
  type: 'article' | 'repo' | 'video' | 'docs';
  qualityScore: number;
  reason: string;
  readingTime: number;
};

export type ApiKnowledgeCard = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  tags: string[];
  difficulty: '入门' | '进阶' | '高阶';
  relatedConcepts: string[];
  sourceIds: string[];
  favorite?: boolean;
};

export type ApiGraphNode = {
  id: string;
  label: string;
  type: 'topic' | 'concept' | 'tool' | 'practice' | 'prerequisite';
};

export type ApiGraphEdge = {
  source: string;
  target: string;
  label: string;
};

export type ApiLearningStep = {
  level: number;
  title: string;
  goal: string;
  estimatedHours: number;
  resources: string[];
  tasks: string[];
};

export type ApiTaskItem = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  source: string;
  status: 'todo' | 'doing' | 'done';
};

export type ResearchResponse = {
  topic: string;
  brief: Brief;
  sources: ApiSource[];
  cards: ApiKnowledgeCard[];
  graph: {
    nodes: ApiGraphNode[];
    edges: ApiGraphEdge[];
  };
  learningPath: ApiLearningStep[];
  tasks: ApiTaskItem[];
};

export type HealthResponse = {
  ok: boolean;
  service: string;
};
