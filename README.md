# LearnFlow

**个人知识与效率协作中枢** — 面向开发者与技术学习者的 AI 知识行动平台。

输入一个学习主题（例如「我要学 MCP」），系统自动聚合资料、提炼知识卡片、生成知识图谱、规划学习路径，并将可执行事项转化为待办计划。

```text
输入主题 / 链接 / RSS
  → 内容发现与抓取
  → AI 摘要与知识融合
  → 知识卡片与知识图谱
  → 学习路径与项目建议
  → 行动任务与日程计划
```

## 功能特性

| 模块 | 说明 |
| --- | --- |
| 主题研究 | 输入技术主题，一键生成结构化学习报告 |
| 内容发现 | 推荐高质量资料来源（文档、教程、开源项目等） |
| 知识卡片 | 摘要、要点、标签、难度、阅读时长 |
| 知识图谱 | 概念节点与关联关系可视化 |
| 学习路径 | 分阶段学习路线与资源推荐 |
| 行动任务 | 从知识中提取可执行待办与今日计划 |
| 历史记录 | 保存最近研究会话，支持回顾 |

> **MVP 说明**：后端 API 已完整实现；前端当前为可演示 UI（静态数据），后续将对接 `/api/research` 等接口。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 19 + Vite 6 |
| 后端 | Python FastAPI |
| 数据库 | SQLite（`backend/hub.db`） |
| AI | OpenAI 兼容 API（StepFun / 智谱 / 通义 / DeepSeek 等） |
| 图标 | Phosphor Icons |

## 项目结构

```text
LearnFlow/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── main.py        # 应用入口、CORS
│   │   ├── routers/       # API 路由
│   │   ├── services/      # 业务逻辑与 LLM 编排
│   │   ├── models/        # SQLite 数据模型
│   │   ├── schemas/       # Pydantic 请求/响应模型
│   │   └── data/          # Mock 兜底数据
│   ├── requirements.txt
│   └── .env.example
├── frontend/              # React 前端
│   ├── src/
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
├── PRD-个人知识与效率协作中枢.md
└── CLAUDE.md              # 开发说明（AI 协作用）
```

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+

### 1. 启动后端

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # Windows: copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

启动后访问 Swagger 文档：http://localhost:8000/docs

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在：http://127.0.0.1:5173

### 3. 验证后端

```bash
curl http://localhost:8000/api/health

curl -X POST http://localhost:8000/api/research \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"我要学 MCP\",\"mode\":\"topic\",\"userLevel\":\"beginner\",\"timeBudgetHours\":6}"
```

## 环境变量

在 `backend/.env` 中配置（参考 `.env.example`）：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `LLM_API_KEY` | 大模型 API 密钥 | 空（使用 mock 数据） |
| `LLM_BASE_URL` | API 地址 | `https://api.stepfun.com/v1` |
| `LLM_MODEL` | 模型名称 | `step-1-8k` |
| `LLM_TIMEOUT` | 请求超时（秒） | `30` |

**未配置 `LLM_API_KEY` 时**，系统自动返回基于关键词的 mock 数据，保证演示可用。

## API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查 |
| `POST` | `/api/research` | 主题研究（核心接口） |
| `GET` | `/api/research/history` | 最近研究记录 |
| `POST` | `/api/cards/{id}/favorite` | 收藏知识卡片 |
| `PATCH` | `/api/tasks/{id}` | 更新任务状态（`todo` / `doing` / `done`） |

### 研究请求示例

```json
{
  "query": "我要学 MCP",
  "mode": "topic",
  "userLevel": "beginner",
  "timeBudgetHours": 6
}
```

### 研究响应结构

```json
{
  "topic": "MCP",
  "brief": {
    "oneLineSummary": "...",
    "whyLearn": "...",
    "keyTakeaways": ["..."],
    "estimatedTime": "6 小时",
    "nextAction": "..."
  },
  "sources": [],
  "cards": [],
  "graph": { "nodes": [], "edges": [] },
  "learningPath": [],
  "tasks": []
}
```

## 开发说明

- 前后端通过 CORS 联调，后端已允许 `http://localhost:5173` 与 `http://localhost:3000`
- 删除 `backend/hub.db` 可重置 SQLite 数据库
- 详细产品需求见 [`PRD-个人知识与效率协作中枢.md`](./PRD-个人知识与效率协作中枢.md)
- 接口契约与模块说明见 [`CLAUDE.md`](./CLAUDE.md)

## License

MIT
