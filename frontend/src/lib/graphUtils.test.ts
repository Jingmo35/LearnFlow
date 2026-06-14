import { describe, expect, it } from 'vitest';
import { buildDemoWorkspace } from './knowledgeModel';
import { findCardForNode, getAnimatedGraphNodes, getConnectedNodeIds } from './graphUtils';

describe('graphUtils', () => {
  it('returns bounded dynamic node positions over time', () => {
    const workspace = buildDemoWorkspace('AI Agent');
    const firstFrame = getAnimatedGraphNodes(workspace.graph.nodes, 0);
    const nextFrame = getAnimatedGraphNodes(workspace.graph.nodes, 12);

    expect(nextFrame.every((node) => node.x >= 5 && node.x <= 95 && node.y >= 5 && node.y <= 95)).toBe(true);
    expect(nextFrame.some((node, index) => node.x !== firstFrame[index].x || node.y !== firstFrame[index].y)).toBe(true);
  });

  it('finds connected nodes for active-node highlighting', () => {
    const workspace = buildDemoWorkspace('AI Agent');

    expect(getConnectedNodeIds(workspace.graph.edges, 'ai-agent')).toEqual(
      expect.arrayContaining(['react', 'planning', 'memory', 'rag', 'multi-agent', 'evaluation'])
    );
  });

  it('resolves a clicked graph node to the most relevant knowledge card', () => {
    const workspace = buildDemoWorkspace('AI Agent');

    expect(findCardForNode(workspace.cards, 'ai-agent')?.id).toBe('card-agent');
    expect(findCardForNode(workspace.cards, 'react')?.id).toBe('card-react');
    expect(findCardForNode(workspace.cards, 'tool-calling')?.id).toBe('card-tool-calling');
  });

  it('still works for the legacy MCP workspace', () => {
    const workspace = buildDemoWorkspace('MCP');

    expect(getConnectedNodeIds(workspace.graph.edges, 'mcp')).toEqual(
      expect.arrayContaining(['agent', 'tool-calling', 'mcp-server', 'mcp-client'])
    );
    expect(findCardForNode(workspace.cards, 'mcp-server')?.id).toBe('card-server');
  });
});
