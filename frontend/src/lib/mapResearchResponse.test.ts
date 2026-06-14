import { describe, expect, it } from 'vitest';
import { mapResearchToWorkspace } from './mapResearchResponse';
import type { ResearchResponse } from '../types/research';

const sampleResponse: ResearchResponse = {
  topic: 'MCP',
  brief: {
    oneLineSummary: 'MCP 是 AI 应用连接外部工具的标准协议。',
    whyLearn: '它能降低 Agent 与工具之间的集成成本。',
    keyTakeaways: ['理解 Host/Client/Server', '实现一个 MCP Server'],
    estimatedTime: '6 小时',
    nextAction: '先搭建最小 Server Demo'
  },
  sources: [
    {
      id: 'source_001',
      title: 'MCP 官方规范',
      source: 'modelcontextprotocol.io',
      url: 'https://example.com',
      type: 'docs',
      qualityScore: 95,
      reason: '最权威的协议说明',
      readingTime: 20
    }
  ],
  cards: [
    {
      id: 'card_001',
      title: 'MCP 协议',
      summary: '标准化 AI 应用与外部系统的连接方式。',
      bullets: ['Host', 'Client', 'Server'],
      tags: ['MCP', 'Tool Calling'],
      difficulty: '入门',
      relatedConcepts: ['Agent', 'Tool Schema'],
      sourceIds: ['source_001']
    }
  ],
  graph: {
    nodes: [
      { id: 'mcp', label: 'MCP', type: 'topic' },
      { id: 'agent', label: 'Agent', type: 'concept' },
      { id: 'server', label: 'MCP Server', type: 'tool' }
    ],
    edges: [{ source: 'mcp', target: 'agent', label: '包含' }]
  },
  learningPath: [
    {
      level: 1,
      title: '理解 MCP 架构',
      goal: '掌握 Host/Client/Server 职责',
      estimatedHours: 2,
      resources: ['官方文档'],
      tasks: ['阅读架构章节']
    }
  ],
  tasks: [
    {
      id: 'task_001',
      title: '实现天气查询 Tool',
      description: '编写一个最小 MCP Server 并本地联调',
      estimatedMinutes: 40,
      priority: 'high',
      source: 'card_001',
      status: 'todo'
    }
  ]
};

describe('mapResearchToWorkspace', () => {
  it('maps backend research response into the UI workspace shape', () => {
    const workspace = mapResearchToWorkspace(sampleResponse);

    expect(workspace.topic).toBe('MCP');
    expect(workspace.sources[0].type).toBe('Doc');
    expect(workspace.cards[0].oneLiner).toContain('标准化');
    expect(workspace.graph.nodes.length).toBeGreaterThan(0);
    expect(workspace.todayPlan[0].title).toContain('天气查询');
    expect(workspace.fusion.consensus).toContain('理解 Host/Client/Server');
  });
});
