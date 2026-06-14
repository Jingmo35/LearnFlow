import type { ResearchResponse } from '../types/research';
import type {
  Difficulty,
  GraphEdge,
  GraphNode,
  KnowledgeCard,
  ProjectLevel,
  Source,
  SourceType,
  TaskMode,
  Workspace
} from './knowledgeModel';

const SOURCE_TYPE_MAP: Record<ResearchResponse['sources'][number]['type'], SourceType> = {
  article: 'Blog',
  repo: 'GitHub',
  video: 'Video',
  docs: 'Doc'
};

const DIFFICULTY_MAP: Record<ResearchResponse['cards'][number]['difficulty'], Difficulty> = {
  入门: '简单',
  进阶: '中等',
  高阶: '困难'
};

const PROJECT_LEVELS: ProjectLevel[] = ['入门', '进阶', '高级'];

export function mapResearchToWorkspace(response: ResearchResponse): Workspace {
  const graphNodes = layoutGraphNodes(response.graph.nodes);
  const nodeIds = new Set(graphNodes.map((node) => node.id));
  const labelToNodeId = buildLabelToNodeIdMap(response.graph.nodes);

  return {
    topic: response.topic,
    sources: response.sources.map(mapSource),
    fusion: {
      consensus: response.brief.keyTakeaways.length
        ? response.brief.keyTakeaways
        : [response.brief.oneLineSummary],
      debates: response.brief.whyLearn ? [response.brief.whyLearn] : [],
      uniqueInsights: [response.brief.nextAction, response.brief.oneLineSummary].filter(Boolean)
    },
    cards: response.cards.map((card) => mapCard(card, nodeIds, labelToNodeId)),
    maturity: {
      mastered: response.cards
        .filter((card) => card.difficulty === '入门')
        .slice(0, 4)
        .map((card) => card.title),
      nextGaps: response.learningPath.slice(0, 4).map((step) => step.title),
      readiness: Math.min(95, 40 + response.cards.length * 8 + response.tasks.length * 3),
      summary: response.brief.oneLineSummary
    },
    projects: mapProjects(response.learningPath),
    graph: {
      layers: [
        { name: '概念层', description: '核心概念与前置知识。' },
        { name: '工具层', description: '框架、协议与实践工具。' },
        { name: '项目层', description: '可验证的学习项目。' }
      ],
      nodes: graphNodes,
      edges: response.graph.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        relation: edge.label,
        weight: 0.75
      }))
    },
    learningPath: response.learningPath.map((step) => ({
      level: step.level,
      title: step.title,
      minutes: Math.max(20, step.estimatedHours * 60),
      difficulty: inferDifficulty(step.level, response.learningPath.length),
      relatedCardIds: findRelatedCardIds(step.title, step.goal, response.cards, labelToNodeId, nodeIds)
    })),
    todayPlan: response.tasks.slice(0, 4).map((task) => ({
      title: task.title,
      minutes: task.estimatedMinutes,
      mode: inferTaskMode(task.description)
    }))
  };
}

function buildLabelToNodeIdMap(nodes: ResearchResponse['graph']['nodes']): Map<string, string> {
  const map = new Map<string, string>();
  for (const node of nodes) {
    map.set(toNodeId(node.label), node.id);
    map.set(node.label.toLowerCase(), node.id);
  }
  return map;
}

function resolveNodeId(
  value: string,
  nodeIds: Set<string>,
  labelToNodeId: Map<string, string>
): string | undefined {
  const id = labelToNodeId.get(toNodeId(value)) ?? labelToNodeId.get(value.toLowerCase());
  return id && nodeIds.has(id) ? id : undefined;
}

function mapSource(source: ResearchResponse['sources'][number]): Source {
  return {
    id: source.id,
    type: SOURCE_TYPE_MAP[source.type] ?? 'Blog',
    title: source.title,
    score: source.qualityScore,
    summary: source.reason || source.title,
    reason: source.reason || `来自 ${source.source}`,
    extracted: [source.source, `${source.readingTime} 分钟阅读`].filter(Boolean)
  };
}

function mapCard(
  card: ResearchResponse['cards'][number],
  nodeIds: Set<string>,
  labelToNodeId: Map<string, string>
): KnowledgeCard {
  const relatedNodeIds = new Set<string>();

  const titleNodeId = resolveNodeId(card.title, nodeIds, labelToNodeId);
  if (titleNodeId) {
    relatedNodeIds.add(titleNodeId);
  }

  for (const tag of card.tags) {
    const id = resolveNodeId(tag, nodeIds, labelToNodeId);
    if (id) {
      relatedNodeIds.add(id);
    }
  }

  for (const concept of card.relatedConcepts) {
    const id = resolveNodeId(concept, nodeIds, labelToNodeId);
    if (id) {
      relatedNodeIds.add(id);
    }
  }

  return {
    id: card.id,
    title: card.title,
    oneLiner: card.summary,
    concepts: card.tags.length ? card.tags : card.relatedConcepts.slice(0, 4),
    useCases: card.bullets.slice(0, 3),
    relatedNodeIds: [...relatedNodeIds],
    sourceIds: card.sourceIds
  };
}

function findRelatedCardIds(
  stepTitle: string,
  stepGoal: string,
  cards: ResearchResponse['cards'],
  labelToNodeId: Map<string, string>,
  nodeIds: Set<string>
): string[] {
  const stepKeywords = new Set<string>();
  for (const token of `${stepTitle} ${stepGoal}`.split(/[\s\/，,、]+/)) {
    const normalized = token.trim();
    if (normalized.length > 1) {
      stepKeywords.add(normalized);
    }
  }

  const scored = cards
    .map((card) => {
      let score = 0;
      const cardText = `${card.title} ${card.tags.join(' ')} ${card.relatedConcepts.join(' ')} ${card.summary}`;
      for (const keyword of stepKeywords) {
        if (cardText.toLowerCase().includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      return { card, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return scored.map((item) => item.card.id);
}

function mapProjects(learningPath: ResearchResponse['learningPath']) {
  if (learningPath.length === 0) {
    return [];
  }

  const picks = [
    learningPath[0],
    learningPath[Math.floor(learningPath.length / 2)],
    learningPath[learningPath.length - 1]
  ].filter(Boolean);

  return picks.map((step, index) => ({
    level: PROJECT_LEVELS[Math.min(index, PROJECT_LEVELS.length - 1)],
    title: step.title,
    description: step.goal,
    stack: step.resources.slice(0, 4),
    outcome: step.tasks[0] ?? step.goal
  }));
}

function layoutGraphNodes(nodes: ResearchResponse['graph']['nodes']): GraphNode[] {
  const grouped: Record<'concept' | 'tool' | 'project', ResearchResponse['graph']['nodes']> = {
    concept: [],
    tool: [],
    project: []
  };

  for (const node of nodes) {
    grouped[mapNodeLayer(node.type)].push(node);
  }

  return [
    ...placeLayer(grouped.concept, 'concept', 28),
    ...placeLayer(grouped.tool, 'tool', 58),
    ...placeLayer(grouped.project, 'project', 84)
  ];
}

function mapNodeLayer(type: ResearchResponse['graph']['nodes'][number]['type']): 'concept' | 'tool' | 'project' {
  if (type === 'tool') {
    return 'tool';
  }
  if (type === 'practice') {
    return 'project';
  }
  return 'concept';
}

function mapNodeType(type: ResearchResponse['graph']['nodes'][number]['type']): GraphNode['type'] {
  if (type === 'tool') {
    return 'tool';
  }
  if (type === 'practice') {
    return 'project';
  }
  return 'concept';
}

function placeLayer(
  nodes: ResearchResponse['graph']['nodes'],
  layer: GraphNode['layer'],
  y: number
): GraphNode[] {
  if (nodes.length === 0) {
    return [];
  }

  const topicIndex = nodes.findIndex((node) => node.type === 'topic');
  const ordered = topicIndex >= 0 ? [nodes[topicIndex], ...nodes.filter((_, index) => index !== topicIndex)] : nodes;

  return ordered.map((node, index) => {
    const count = ordered.length;
    const x = count === 1 ? 50 : 14 + (index / Math.max(count - 1, 1)) * 72;
    const importance = node.type === 'topic' ? 96 : Math.max(68, 92 - index * 4);

    return {
      id: node.id,
      label: node.label,
      type: mapNodeType(node.type),
      layer,
      x: Number(x.toFixed(2)),
      y: Number((node.type === 'topic' ? y + 8 : y).toFixed(2)),
      importance
    };
  });
}

function inferDifficulty(level: number, total: number): Difficulty {
  const ratio = level / Math.max(total, 1);
  if (ratio <= 0.34) {
    return '简单';
  }
  if (ratio <= 0.67) {
    return '中等';
  }
  return '困难';
}

function inferTaskMode(description: string): TaskMode {
  if (/观看|视频|video/i.test(description)) {
    return '观看';
  }
  if (/阅读|文档|article|docs/i.test(description)) {
    return '阅读';
  }
  return '实践';
}

export function toNodeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 24);
}

function pickDefaultNodeId(cards: KnowledgeCard[], graphNodes: GraphNode[]): string | null {
  const topicNode = graphNodes.find((node) => node.type === 'concept' && node.label === cards[0]?.title);
  if (topicNode) {
    return topicNode.id;
  }

  const card = cards[0];
  if (!card) {
    return graphNodes[0]?.id ?? null;
  }

  return card.relatedNodeIds[0] ?? toNodeId(card.title) ?? graphNodes[0]?.id ?? null;
}

export function pickInitialNodeId(workspace: Workspace): string | null {
  return pickDefaultNodeId(workspace.cards, workspace.graph.nodes);
}
