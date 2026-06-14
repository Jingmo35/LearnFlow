export type SourceType = 'Doc' | 'GitHub' | 'Blog' | 'Video' | 'Podcast' | 'Paper';

export type Source = {
  id: string;
  type: SourceType;
  title: string;
  score: number;
  summary: string;
  reason: string;
  extracted: string[];
};

export type KnowledgeCard = {
  id: string;
  title: string;
  oneLiner: string;
  concepts: string[];
  useCases: string[];
  relatedNodeIds: string[];
  sourceIds: string[];
};

export type ProjectLevel = '入门' | '进阶' | '高级';
export type Difficulty = '简单' | '中等' | '困难';
export type TaskMode = '阅读' | '观看' | '实践';

export type GraphNode = {
  id: string;
  label: string;
  type: 'concept' | 'tool' | 'source' | 'project';
  layer: 'concept' | 'tool' | 'project';
  x: number;
  y: number;
  importance: number;
};

export type GraphEdge = {
  source: string;
  target: string;
  relation: string;
  weight: number;
};

export type Workspace = {
  topic: string;
  sources: Source[];
  fusion: {
    consensus: string[];
    debates: string[];
    uniqueInsights: string[];
  };
  cards: KnowledgeCard[];
  maturity: {
    mastered: string[];
    nextGaps: string[];
    readiness: number;
    summary: string;
  };
  projects: Array<{
    level: ProjectLevel;
    title: string;
    description: string;
    stack: string[];
    outcome: string;
  }>;
  graph: {
    layers: Array<{ name: string; description: string }>;
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  learningPath: Array<{
    level: number;
    title: string;
    minutes: number;
    difficulty: Difficulty;
    relatedCardIds: string[];
  }>;
  todayPlan: Array<{
    title: string;
    minutes: number;
    mode: TaskMode;
  }>;
};

export function buildDemoWorkspace(topic: string): Workspace {
  const normalizedTopic = topic.trim() || 'AI Agent';

  if (normalizedTopic.toLowerCase().includes('mcp')) {
    return buildMcpWorkspace();
  }

  return buildAiWorkspace(normalizedTopic);
}

export function getWorkflowSteps(): Array<{ label: string }> {
  return [
    { label: '发现多源内容' },
    { label: '筛选高价值信号' },
    { label: '融合知识观点' },
    { label: '生成动态星图' },
    { label: '规划成长路径' },
    { label: '拆解今日行动' }
  ];
}

function buildAiWorkspace(topic: string): Workspace {
  const sources = buildAiSources();
  const cards = buildAiCards();
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  return {
    topic,
    sources,
    fusion: {
      consensus: [
        '现代 AI Agent 的核心共识是：大模型负责推理与决策，外部工具负责行动，两者通过结构化的 Function Calling / Tool Calling 协议连接。',
        'Agent 的有效运行依赖于清晰的任务边界：每次调用工具时，模型必须明确知道工具的输入 schema、返回值含义以及失败时的回退策略。',
        '从简单单 Agent 到复杂多 Agent 系统，最关键的提升来自记忆（Memory）和规划（Planning）机制，而非单纯扩大模型规模。'
      ],
      debates: [
        '一派认为 Agent 应该尽量“端到端”让模型自主规划；另一派主张用明确的状态机 / 工作流约束，以保证可控性和可观测性。',
        'ReAct 等“思考-行动”循环适合探索性任务，但对确定性流程效率较低；是否应优先使用 Plan-and-Execute 仍存在争议。',
        '多 Agent 协作能完成更复杂任务，但 Agent 之间的通信协议、角色划分和冲突解决机制尚未形成统一最佳实践。'
      ],
      uniqueInsights: [
        '学习 Agent 不应只关注框架（LangChain / CrewAI），而应先从“一个能调用工具的 Python 循环”开始，建立最小可运行心智模型。',
        '真正让 Agent 可用的不是提示词技巧，而是可观测性：每一步 Thought、Action、Observation 都需要被记录、回放和评估。',
        'Agent 的瓶颈通常在工具质量：一个文档清晰、返回值稳定的工具，比十段复杂的 prompt 更能提升成功率。'
      ]
    },
    cards,
    maturity: {
      mastered: ['Python 基础', 'HTTP API 调用', '大模型基础概念', 'Prompt 基础'],
      nextGaps: [
        'Function Calling / Tool Schema 设计',
        'ReAct 循环实现',
        'Agent 记忆与上下文管理',
        '多 Agent 协作与评估'
      ],
      readiness: 58,
      summary:
        '你已具备构建 AI Agent 的编程基础，接下来需要把“调用模型”升级为“让模型可靠地调用工具并持续迭代”。'
    },
    projects: [
      {
        level: '入门',
        title: '天气查询 Agent',
        description: '实现一个能根据用户问题调用天气 API 并回答的简单 Agent。',
        stack: ['Python', 'OpenAI API', 'Requests'],
        outcome: '得到一个能完成“查询-调用-总结”闭环的最小 Agent。'
      },
      {
        level: '进阶',
        title: '研究助手 Agent',
        description: '让 Agent 能搜索网络、读取网页、总结要点，并输出结构化研究报告。',
        stack: ['Python', 'Tavily API', 'LangChain', 'Markdown'],
        outcome: '能自动完成一次主题调研并生成可读的 Markdown 报告。'
      },
      {
        level: '高级',
        title: '多 Agent 编程小队',
        description: '用多个 Agent 分别负责需求分析、代码实现、测试和评审，协作完成一个小功能。',
        stack: ['Python', 'CrewAI / AutoGen', 'Git', 'OpenAI API'],
        outcome: '形成一个可演示的多 Agent 协作闭环原型。'
      }
    ],
    graph: buildAiGraph(),
    learningPath: [
      {
        level: 1,
        title: '掌握 Function Calling / Tool Calling',
        minutes: 45,
        difficulty: '简单',
        relatedCardIds: ['card-tool-calling']
      },
      {
        level: 2,
        title: '理解 ReAct 思考-行动循环',
        minutes: 60,
        difficulty: '中等',
        relatedCardIds: ['card-react']
      },
      {
        level: 3,
        title: '为 Agent 添加记忆能力',
        minutes: 55,
        difficulty: '中等',
        relatedCardIds: ['card-memory']
      },
      {
        level: 4,
        title: '任务规划与分解',
        minutes: 70,
        difficulty: '中等',
        relatedCardIds: ['card-planning']
      },
      {
        level: 5,
        title: 'RAG 与外部知识集成',
        minutes: 80,
        difficulty: '困难',
        relatedCardIds: ['card-rag']
      },
      {
        level: 6,
        title: '多 Agent 协作与评估',
        minutes: 90,
        difficulty: '困难',
        relatedCardIds: ['card-multi-agent', 'card-evaluation']
      }
    ],
    todayPlan: [
      { title: '阅读 Function Calling 官方文档', minutes: 15, mode: '阅读' },
      { title: '观看 ReAct 原理解析视频', minutes: 25, mode: '观看' },
      { title: '实现一个最小 ReAct 循环', minutes: 50, mode: '实践' },
      { title: '为 Agent 添加短期记忆', minutes: 30, mode: '实践' }
    ]
  };
}

function buildAiSources(): Source[] {
  return [
    {
      id: 'react-paper',
      type: 'Paper',
      title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
      score: 96,
      summary: '提出 Thought、Action、Observation 交替进行的 ReAct 范式，是 Agent 推理的经典基础。',
      reason: '理解 Agent 如何“边想边做”的首选论文，概念清晰且引用广泛。',
      extracted: ['Reasoning', 'Acting', 'Observation', 'Loop']
    },
    {
      id: 'openai-function-calling',
      type: 'Doc',
      title: 'OpenAI Function Calling 官方指南',
      score: 94,
      summary: '定义了如何让大模型输出结构化工具调用参数，是 Tool Calling 的事实标准。',
      reason: '所有主流模型都跟进的接口形式，实现 Agent 的必读文档。',
      extracted: ['tool definition', 'JSON Schema', 'function_call']
    },
    {
      id: 'anthropic-effective-agents',
      type: 'Blog',
      title: 'Anthropic: Building Effective Agents',
      score: 93,
      summary: '从工程化角度总结何时用工作流、何时用 Agent，以及常见反模式。',
      reason: '帮助避免“为了 Agent 而 Agent”，建立可落地的设计判断。',
      extracted: ['workflow vs agent', 'orchestration', 'best practices']
    },
    {
      id: 'langchain-agents',
      type: 'Doc',
      title: 'LangChain Agents 文档',
      score: 88,
      summary: '提供了现成 Agent 类型（React、Plan-and-Execute、Self-Ask 等）和工具集成方式。',
      reason: '适合快速验证想法，也能看到工业界常用的抽象分层。',
      extracted: ['AgentExecutor', 'toolkit', 'agent types']
    },
    {
      id: 'autogpt-repo',
      type: 'GitHub',
      title: 'Significant-Gravitas/AutoGPT',
      score: 84,
      summary: '早期开源自主 Agent 项目，展示了目标分解、记忆、工具调用的完整链路。',
      reason: '通过真实代码理解 Agent 系统的模块划分和持久化设计。',
      extracted: ['autonomous agent', 'memory', 'planner']
    },
    {
      id: 'crewai-docs',
      type: 'Doc',
      title: 'CrewAI 多 Agent 协作框架文档',
      score: 86,
      summary: '以角色（Role）、任务（Task）、团队（Crew）为核心抽象的多 Agent 框架。',
      reason: '学习多 Agent 协作时最直接的框架，文档示例丰富。',
      extracted: ['role', 'task', 'crew', 'delegation']
    },
    {
      id: 'agent-video-tutorial',
      type: 'Video',
      title: '从零实现一个 AI Agent',
      score: 82,
      summary: '用 Python 手写 ReAct 循环并接入搜索工具，适合建立第一手感性认识。',
      reason: '视频形式能降低入门门槛，看完即可动手复现。',
      extracted: ['hands-on', 'Python loop', 'search tool']
    },
    {
      id: 'vector-memory-blog',
      type: 'Blog',
      title: 'Agent 记忆设计：短期记忆与长期向量记忆',
      score: 80,
      summary: '介绍 Agent 如何利用向量数据库存储和检索跨会话的长期记忆。',
      reason: '补充记忆机制的理论与实现，让 Agent 从“单次对话”升级为“持续学习”。',
      extracted: ['short-term memory', 'vector store', 'retrieval']
    }
  ];
}

function buildAiCards(): KnowledgeCard[] {
  return [
    {
      id: 'card-agent',
      title: 'AI Agent 是什么',
      oneLiner: 'Agent 是能感知环境、自主决策并调用工具完成目标的系统。',
      concepts: ['感知', '决策', '行动', '目标'],
      useCases: ['个人助理', '研究助手', '自动化运维'],
      relatedNodeIds: ['ai-agent', 'llm', 'tool-calling'],
      sourceIds: ['anthropic-effective-agents', 'agent-video-tutorial']
    },
    {
      id: 'card-tool-calling',
      title: 'Function / Tool Calling',
      oneLiner: '让模型输出结构化函数调用，把自然语言转化为可执行动作。',
      concepts: ['JSON Schema', 'tool definition', 'arguments'],
      useCases: ['API 调用', '数据库查询', '文件操作'],
      relatedNodeIds: ['tool-calling', 'openai-api', 'ai-agent'],
      sourceIds: ['openai-function-calling', 'langchain-agents']
    },
    {
      id: 'card-react',
      title: 'ReAct 循环',
      oneLiner: '交替进行 Thought（思考）、Action（行动）、Observation（观察）的推理范式。',
      concepts: ['Thought', 'Action', 'Observation', 'Loop'],
      useCases: ['多步问答', '工具链调用', '探索性任务'],
      relatedNodeIds: ['react', 'ai-agent', 'tool-calling'],
      sourceIds: ['react-paper', 'agent-video-tutorial']
    },
    {
      id: 'card-memory',
      title: 'Agent 记忆',
      oneLiner: '让 Agent 跨轮次保留上下文、学习偏好，避免“金鱼记忆”。',
      concepts: ['短期记忆', '长期记忆', '向量检索'],
      useCases: ['对话续接', '用户偏好', '知识沉淀'],
      relatedNodeIds: ['memory', 'vector-db', 'ai-agent'],
      sourceIds: ['vector-memory-blog', 'autogpt-repo']
    },
    {
      id: 'card-planning',
      title: '规划与反思',
      oneLiner: '把复杂目标拆成可执行步骤，并根据反馈动态调整计划。',
      concepts: ['Plan', 'Execute', 'Reflect', 'Decompose'],
      useCases: ['项目规划', '代码生成', '研究报告'],
      relatedNodeIds: ['planning', 'react', 'ai-agent'],
      sourceIds: ['anthropic-effective-agents', 'langchain-agents']
    },
    {
      id: 'card-rag',
      title: 'RAG + Agent',
      oneLiner: '把检索增强生成作为工具接入 Agent，让 Agent 基于私有知识作答。',
      concepts: ['Retrieval', 'Embedding', 'Knowledge Base'],
      useCases: ['企业客服', '个人知识库', '文档问答'],
      relatedNodeIds: ['rag', 'vector-db', 'tool-calling', 'ai-agent'],
      sourceIds: ['vector-memory-blog', 'langchain-agents']
    },
    {
      id: 'card-multi-agent',
      title: '多 Agent 协作',
      oneLiner: '多个角色化的 Agent 分工协作，共同完成单 Agent 难以处理的复杂任务。',
      concepts: ['Role', 'Delegation', 'Communication'],
      useCases: ['代码评审', '内容创作', '复杂调研'],
      relatedNodeIds: ['multi-agent', 'crewai', 'ai-agent'],
      sourceIds: ['crewai-docs', 'autogpt-repo']
    },
    {
      id: 'card-evaluation',
      title: 'Agent 评估',
      oneLiner: '用任务成功率、步骤效率、成本等指标衡量 Agent 是否真正可用。',
      concepts: ['Success Rate', 'Latency', 'Cost', 'Observability'],
      useCases: ['A/B 测试', '迭代优化', '生产监控'],
      relatedNodeIds: ['evaluation', 'observability', 'ai-agent'],
      sourceIds: ['anthropic-effective-agents', 'langchain-agents']
    }
  ];
}

function buildAiGraph(): Workspace['graph'] {
  return {
    layers: [
      { name: '概念层', description: '先理解 Agent、LLM、Tool Calling、ReAct 等核心概念。' },
      { name: '工具层', description: '再掌握 Function Calling、向量库、LangChain、CrewAI 等工具与框架。' },
      { name: '项目层', description: '最后通过单 Agent、RAG Agent、多 Agent 项目验证实践能力。' }
    ],
    nodes: [
      // concept layer
      { id: 'ai-agent', label: 'AI Agent', type: 'concept', layer: 'concept', x: 50, y: 30, importance: 96 },
      { id: 'llm', label: 'LLM', type: 'concept', layer: 'concept', x: 26, y: 20, importance: 90 },
      { id: 'tool-calling', label: 'Tool Calling', type: 'concept', layer: 'concept', x: 74, y: 20, importance: 92 },
      { id: 'react', label: 'ReAct', type: 'concept', layer: 'concept', x: 34, y: 38, importance: 88 },
      { id: 'planning', label: 'Planning', type: 'concept', layer: 'concept', x: 66, y: 38, importance: 86 },
      { id: 'memory', label: 'Memory', type: 'concept', layer: 'concept', x: 18, y: 32, importance: 84 },
      { id: 'rag', label: 'RAG', type: 'concept', layer: 'concept', x: 82, y: 32, importance: 85 },
      { id: 'multi-agent', label: 'Multi-Agent', type: 'concept', layer: 'concept', x: 50, y: 12, importance: 87 },
      { id: 'evaluation', label: 'Evaluation', type: 'concept', layer: 'concept', x: 86, y: 16, importance: 80 },

      // tool layer
      { id: 'openai-api', label: 'OpenAI API', type: 'tool', layer: 'tool', x: 72, y: 55, importance: 78 },
      { id: 'langchain', label: 'LangChain', type: 'tool', layer: 'tool', x: 34, y: 58, importance: 76 },
      { id: 'crewai', label: 'CrewAI', type: 'tool', layer: 'tool', x: 62, y: 64, importance: 74 },
      { id: 'vector-db', label: 'Vector DB', type: 'tool', layer: 'tool', x: 20, y: 54, importance: 72 },
      { id: 'observability', label: 'Observability', type: 'tool', layer: 'tool', x: 86, y: 56, importance: 70 },

      // project layer
      { id: 'weather-agent', label: '天气 Agent', type: 'project', layer: 'project', x: 34, y: 84, importance: 82 },
      { id: 'research-agent', label: '研究助手', type: 'project', layer: 'project', x: 54, y: 88, importance: 84 },
      { id: 'coding-crew', label: '编程小队', type: 'project', layer: 'project', x: 74, y: 82, importance: 86 }
    ],
    edges: [
      { source: 'llm', target: 'ai-agent', relation: 'powers', weight: 0.92 },
      { source: 'tool-calling', target: 'ai-agent', relation: 'enables', weight: 0.9 },
      { source: 'ai-agent', target: 'react', relation: 'uses', weight: 0.88 },
      { source: 'ai-agent', target: 'planning', relation: 'uses', weight: 0.86 },
      { source: 'ai-agent', target: 'memory', relation: 'needs', weight: 0.84 },
      { source: 'ai-agent', target: 'rag', relation: 'integrates', weight: 0.82 },
      { source: 'ai-agent', target: 'multi-agent', relation: 'scales_to', weight: 0.8 },
      { source: 'ai-agent', target: 'evaluation', relation: 'measured_by', weight: 0.78 },

      { source: 'tool-calling', target: 'openai-api', relation: 'standardized_by', weight: 0.85 },
      { source: 'react', target: 'langchain', relation: 'implemented_in', weight: 0.8 },
      { source: 'planning', target: 'langchain', relation: 'implemented_in', weight: 0.78 },
      { source: 'multi-agent', target: 'crewai', relation: 'implemented_in', weight: 0.82 },
      { source: 'memory', target: 'vector-db', relation: 'stored_in', weight: 0.86 },
      { source: 'rag', target: 'vector-db', relation: 'stored_in', weight: 0.88 },
      { source: 'evaluation', target: 'observability', relation: 'depends_on', weight: 0.8 },

      { source: 'react', target: 'weather-agent', relation: 'enables', weight: 0.9 },
      { source: 'tool-calling', target: 'weather-agent', relation: 'enables', weight: 0.88 },
      { source: 'rag', target: 'research-agent', relation: 'enables', weight: 0.9 },
      { source: 'planning', target: 'research-agent', relation: 'enables', weight: 0.86 },
      { source: 'multi-agent', target: 'coding-crew', relation: 'enables', weight: 0.92 },
      { source: 'crewai', target: 'coding-crew', relation: 'enables', weight: 0.88 },
      { source: 'evaluation', target: 'coding-crew', relation: 'validates', weight: 0.8 }
    ]
  };
}

function buildMcpWorkspace(): Workspace {
  return {
    topic: 'MCP',
    sources: buildMcpSources(),
    fusion: {
      consensus: [
        'MCP 的核心共识是：它不是单个工具，而是 AI 应用连接外部能力的标准化协议层。',
        '多来源内容都强调 Host、Client、Server、Tool 的职责拆分，这能降低 AI 应用和工具实现之间的耦合。',
        'MCP 的价值不只在协议本身，而在接入 IDE、知识库、API、企业系统后的真实工作流。'
      ],
      debates: [
        '一部分资料把 MCP 看作轻量集成标准，另一部分资料认为它会演化成 Agent 基础设施。',
        '社区示例偏向本地快速 Demo，但生产环境还需要权限控制、可观测性、审计和安全边界。'
      ],
      uniqueInsights: [
        '学习 MCP 不应该只背协议概念，更应该把它放进 Context Engineering 和工具边界设计里理解。',
        '最短的能力验证路径不是读完所有文档，而是先做一个天气查询或笔记检索 MCP Server。',
        '项目层是知识真正沉淀的位置，因为用户必须亲自调通 Host、Client、Server 的交互链路。'
      ]
    },
    cards: buildMcpCards(),
    maturity: {
      mastered: ['AI Agent 基础概念', 'Tool Calling 心智模型', 'HTTP API 基础'],
      nextGaps: ['MCP Server 实现', 'Host 配置与调试', 'Tool Schema 测试'],
      readiness: 68,
      summary: '你已经具备理解 MCP 的基础，但还需要完成一个可运行的 Server 项目，才能进入多 Agent 工作流。'
    },
    projects: [
      {
        level: '入门',
        title: '天气查询 MCP Server',
        description: '暴露一个天气查询 Tool，并在本地 Host 中完成一次真实调用。',
        stack: ['TypeScript', 'MCP SDK', 'OpenWeather API'],
        outcome: '得到一个能返回结构化天气数据的最小可用 MCP 工具。'
      },
      {
        level: '进阶',
        title: '个人知识库 MCP Server',
        description: '连接 Markdown 笔记或项目文档，暴露搜索和读取两个工具。',
        stack: ['Python', 'FastAPI', 'SQLite', 'Embeddings'],
        outcome: '让 AI 助手基于个人资料给出可追溯回答。'
      },
      {
        level: '高级',
        title: '多工具 Agent 工作台',
        description: '把搜索、记忆、任务三个工具组合成一个小型 Agent 工作流。',
        stack: ['React', 'FastAPI', 'MCP', 'PostgreSQL'],
        outcome: '形成一个能展示 Agent 执行闭环的项目级原型。'
      }
    ],
    graph: {
      layers: [
        { name: '概念层', description: '先理解 MCP、Agent、Tool Calling 的基本关系。' },
        { name: '工具层', description: '再掌握 Server、Client、Host、框架和调试工具。' },
        { name: '项目层', description: '最后通过项目验证是否真的具备实践能力。' }
      ],
      nodes: [
        { id: 'mcp', label: 'MCP', type: 'concept', layer: 'concept', x: 50, y: 46, importance: 96 },
        { id: 'agent', label: 'AI Agent', type: 'concept', layer: 'concept', x: 29, y: 25, importance: 90 },
        { id: 'tool-calling', label: 'Tool Calling', type: 'concept', layer: 'concept', x: 72, y: 25, importance: 92 },
        { id: 'mcp-server', label: 'MCP Server', type: 'tool', layer: 'tool', x: 29, y: 63, importance: 88 },
        { id: 'mcp-client', label: 'MCP Client', type: 'tool', layer: 'tool', x: 51, y: 72, importance: 78 },
        { id: 'fastapi', label: 'FastAPI', type: 'tool', layer: 'tool', x: 74, y: 63, importance: 70 },
        { id: 'cursor', label: 'Cursor', type: 'tool', layer: 'tool', x: 18, y: 44, importance: 72 },
        { id: 'claude', label: 'Claude', type: 'tool', layer: 'tool', x: 82, y: 44, importance: 72 },
        { id: 'demo-project', label: '天气工具 Demo', type: 'project', layer: 'project', x: 43, y: 88, importance: 82 },
        { id: 'knowledge-project', label: '知识库 Server', type: 'project', layer: 'project', x: 66, y: 88, importance: 84 }
      ],
      edges: [
        { source: 'agent', target: 'mcp', relation: 'uses', weight: 0.88 },
        { source: 'tool-calling', target: 'mcp', relation: 'explains', weight: 0.9 },
        { source: 'mcp', target: 'mcp-server', relation: 'is_part_of', weight: 0.92 },
        { source: 'mcp', target: 'mcp-client', relation: 'is_part_of', weight: 0.82 },
        { source: 'mcp-server', target: 'fastapi', relation: 'implemented_with', weight: 0.74 },
        { source: 'cursor', target: 'mcp-client', relation: 'hosts', weight: 0.7 },
        { source: 'claude', target: 'mcp-client', relation: 'hosts', weight: 0.72 },
        { source: 'mcp-server', target: 'demo-project', relation: 'enables', weight: 0.9 },
        { source: 'fastapi', target: 'knowledge-project', relation: 'enables', weight: 0.82 }
      ]
    },
    learningPath: [
      {
        level: 1,
        title: '复习 AI Agent 与 Tool Calling 基础',
        minutes: 35,
        difficulty: '简单',
        relatedCardIds: ['card-tool']
      },
      {
        level: 2,
        title: '理解 MCP Host、Client、Server 的职责',
        minutes: 45,
        difficulty: '中等',
        relatedCardIds: ['card-mcp']
      },
      {
        level: 3,
        title: '搭建一个最小 MCP Server',
        minutes: 70,
        difficulty: '中等',
        relatedCardIds: ['card-server']
      },
      {
        level: 4,
        title: '接入 Cursor 或 Claude 进行联调',
        minutes: 50,
        difficulty: '中等',
        relatedCardIds: ['card-cursor']
      },
      {
        level: 5,
        title: '把 Demo 升级成个人知识助手',
        minutes: 120,
        difficulty: '困难',
        relatedCardIds: ['card-server', 'card-tool']
      }
    ],
    todayPlan: [
      { title: '阅读 MCP 官方架构章节', minutes: 15, mode: '阅读' },
      { title: '观看 Tool Calling 心智模型讲解', minutes: 20, mode: '观看' },
      { title: '实现天气查询 Tool Schema', minutes: 40, mode: '实践' }
    ]
  };
}

function buildMcpSources(): Source[] {
  return [
    {
      id: 'mcp-spec',
      type: 'Doc',
      title: 'Model Context Protocol 官方规范',
      score: 96,
      summary: '定义 Host、Client、Server、Tool、Resource 等核心协议概念。',
      reason: '最权威的协议词汇和边界说明，适合作为学习起点。',
      extracted: ['Host / Client / Server 拆分', 'Tool 声明', '传输模型']
    },
    {
      id: 'mcp-github',
      type: 'GitHub',
      title: 'modelcontextprotocol/servers',
      score: 92,
      summary: '包含参考 Server 和社区示例，展示 MCP 如何连接外部系统。',
      reason: '能看到真实 Server 形态，比只读规范更容易理解工程落地。',
      extracted: ['Server 模板', 'Tool Schema', '文件系统与 API 示例']
    },
    {
      id: 'mcp-blog',
      type: 'Blog',
      title: '从零构建第一个 MCP Server',
      score: 89,
      summary: '用实战步骤讲解 MCP Server 的实现、启动和调试流程。',
      reason: '把抽象协议转成可执行步骤，适合比赛 Demo 展示。',
      extracted: ['本地开发流程', 'Tool 实现', '调试方法']
    },
    {
      id: 'tool-video',
      type: 'Video',
      title: 'Tool Calling 与 Agent 上下文讲解',
      score: 84,
      summary: '解释模型为什么需要结构化工具，以及 MCP 如何承接工具边界。',
      reason: '帮助用户把 LLM 基础和 MCP 架构连接起来。',
      extracted: ['Tool Calling 心智模型', '上下文限制', 'Agent 工作流']
    },
    {
      id: 'agent-podcast',
      type: 'Podcast',
      title: 'AI Agent 如何连接软件工具',
      score: 78,
      summary: '讨论 Agent 生态、互操作性，以及工具市场可能的演化方向。',
      reason: '补充产品和生态视角，让项目不只是技术 Demo。',
      extracted: ['Agent 互操作', '工具市场', '生态锁定']
    },
    {
      id: 'rag-paper',
      type: 'Paper',
      title: 'LLM 应用中的 Context Engineering 模式',
      score: 81,
      summary: '把 MCP 放进检索、记忆、工具调用等上下文工程体系中理解。',
      reason: '能解释 MCP 和 RAG、Memory、外部工具之间的关系。',
      extracted: ['上下文工程', '检索边界', '外部记忆']
    }
  ];
}

function buildMcpCards(): KnowledgeCard[] {
  return [
    {
      id: 'card-mcp',
      title: 'MCP 协议',
      oneLiner: 'MCP 标准化了 AI 应用连接工具、数据和外部系统的方式。',
      concepts: ['Host', 'Client', 'Server', 'Tool', 'Resource'],
      useCases: ['Agent 工具调用', 'IDE 助手', '知识检索'],
      relatedNodeIds: ['mcp', 'tool-calling', 'mcp-server', 'mcp-client'],
      sourceIds: ['mcp-spec', 'mcp-github']
    },
    {
      id: 'card-server',
      title: 'MCP Server',
      oneLiner: 'MCP Server 负责向 AI 应用暴露可调用的工具和资源。',
      concepts: ['Tool Schema', '请求处理', '能力边界'],
      useCases: ['天气查询', '数据库查询', '文件系统访问'],
      relatedNodeIds: ['mcp-server', 'fastapi', 'demo-project'],
      sourceIds: ['mcp-spec', 'mcp-github', 'mcp-blog']
    },
    {
      id: 'card-tool',
      title: 'Tool Calling',
      oneLiner: 'Tool Calling 让模型发起结构化动作，而不是凭空猜答案。',
      concepts: ['JSON Schema', '参数', '执行结果'],
      useCases: ['API 调用', '搜索流程', '代码助手'],
      relatedNodeIds: ['tool-calling', 'agent', 'mcp-server'],
      sourceIds: ['tool-video', 'rag-paper']
    },
    {
      id: 'card-cursor',
      title: 'Cursor / Claude 集成',
      oneLiner: '当 Host 应用能发现并调用本地 Server 时，MCP 才真正进入工作流。',
      concepts: ['Host 配置', 'Client Session', '本地 Server'],
      useCases: ['IDE 自动化', '个人知识工具', '开发者工作流'],
      relatedNodeIds: ['cursor', 'claude', 'demo-project'],
      sourceIds: ['mcp-spec', 'agent-podcast']
    }
  ];
}
