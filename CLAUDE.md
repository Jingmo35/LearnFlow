# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

- `PRD-个人知识与效率协作中枢.md` — product requirements and API contract
- `CLAUDE.md` — this file
- `backend/` — FastAPI backend with SQLite persistence, LLM client, and agent-style services
- `frontend/` — React 19 + Vite demo UI that renders static workspace data (not yet wired to the backend API)

## Product overview

Product name: 个人知识与效率协作中枢 (Personal Knowledge & Productivity Collaboration Hub), branded as **LearnFlow AI** in the UI.

A hackathon MVP for an AI-powered learning companion. A user enters a technical topic (for example, "我要学 MCP") and the system returns recommended sources, structured knowledge cards, a concept graph, a staged learning path, and actionable tasks with a daily plan.

Core flow:

```text
输入主题/链接/RSS
  -> 内容发现与抓取
  -> AI 摘要与知识融合
  -> 知识卡片与知识图谱
  -> 学习路径与项目建议
  -> 行动任务与日程计划
```

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite 7 + TypeScript 5.8 |
| UI icons | lucide-react |
| Styling | Custom CSS (`frontend/src/styles.css`), no Tailwind/shadcn currently installed |
| Graph | Custom SVG-based layered graph (`frontend/src/components/KnowledgeGraph.tsx`) |
| Tests | Vitest + jsdom + `@testing-library/react` |
| Backend | Python FastAPI 0.111 + Pydantic 2 + SQLAlchemy 2 (async) + aiosqlite |
| AI | OpenAI-compatible API via `httpx` (defaults to OpenAI if unset; `.env.example` points to StepFun) |
| Storage | SQLite (`backend/hub.db`) |
| API docs | FastAPI Swagger at `/docs` |

## Frontend architecture

The frontend is a single-page demo built around a static `Workspace` model defined in `frontend/src/lib/knowledgeModel.ts`. It is **not yet consuming the backend `/api/research` endpoint**.

Entry flow:

- `frontend/src/main.tsx` mounts `App` in StrictMode.
- `frontend/src/App.tsx` holds top-level state (`topic`, `activeTab`, `selectedCard`, `activeNodeId`, collapse flags) and builds a `Workspace` via `buildDemoWorkspace(topic)`.
- Layout is a three-column workspace: `SourcePanel` (left), `KnowledgeGraph` (center), `InsightPanel` (right). Both side panels can collapse to a rail.
- `KnowledgeGraph` renders nodes as positioned `<button>` elements over an SVG edge layer, with simple animation driven by a `tick` interval and `getAnimatedGraphNodes`.
- `InsightPanel` has five tabs: 融合, 卡片, 路径, 项目, 今日. Selecting a graph node switches to the 卡片 tab and highlights the most relevant card.
- `ParticleField` is a canvas background that is skipped under jsdom.

Demo data:

- The default topic is **AI Agent**.
- `buildDemoWorkspace('')` and `buildDemoWorkspace('AI Agent')` return a complete AI-learning workspace: 8 sources, 8 knowledge cards, a 15-node layered graph, 6 learning-path steps, 3 project tiers, and a 4-item today plan.
- `buildDemoWorkspace('MCP')` returns the original MCP workspace for comparison/backward compatibility.

Key frontend files:

- `frontend/src/lib/knowledgeModel.ts` — `Workspace` type and static demo data builder
- `frontend/src/lib/graphUtils.ts` — graph animation, edge highlighting, and node-to-card resolution
- `frontend/src/components/KnowledgeGraph.tsx` — interactive SVG/HTML layered graph
- `frontend/src/components/InsightPanel.tsx` — tabbed insight panel
- `frontend/src/components/SourcePanel.tsx` — source list panel
- `frontend/src/App.tsx` — state orchestration and layout
- `frontend/src/styles.css` — all styling, responsive breakpoints, dark theme

Note: the `Workspace` type in the frontend is richer than the backend `ResearchResponse` (it adds fusion consensus/debates, maturity scores, projects, today plan, etc.). If you wire the frontend to the backend, you will need to either adapt the UI to the backend schema or extend the backend response.

## Backend architecture

The backend follows a service-oriented orchestrator pattern.

Entry points:

- `backend/app/main.py` — creates the FastAPI app, registers CORS, routers, and optionally serves the built frontend from `frontend/dist`. Creates SQLite tables on startup via lifespan.
- `backend/app/config.py` — Pydantic-settings loader reading `backend/.env`. Keys: `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`, `LLM_TIMEOUT`.
- `backend/app/routers/` — `health`, `research`, `cards`, `tasks`.
- `backend/app/schemas/research.py` — Pydantic request/response models.
- `backend/app/models/database.py` — async SQLAlchemy models and DB helpers (`save_research_result`, `get_recent_sessions`, `toggle_card_favorite`, `update_task_status`).
- `backend/app/services/orchestrator.py` — `run_research()` chains discovery → parsing → brief/cards → graph → path → tasks. If `LLM_API_KEY` is empty, it returns a deep-copied mock response with session-scoped IDs.
- `backend/app/services/llm_client.py` — thin OpenAI-compatible JSON-mode client; returns `None` on any failure or missing key.
- `backend/app/services/` — agent-style modules: `content_discovery`, `content_parser`, `knowledge_card`, `knowledge_graph`, `learning_path`, `task_extraction`.
- `backend/app/data/mock_research.py` — keyword-based mock responses for MCP, React, AI Agent, and a generic fallback.

Important backend behaviors:

- Mock fallback is automatic when `LLM_API_KEY` is empty.
- IDs are scoped per session in `orchestrator._scope_ids()` so cross-references stay unique in SQLite.
- `content_discovery` can optionally call Tavily if `TAVILY_API_KEY` is set; otherwise it uses mock sources.
- The backend can serve the built frontend: if `frontend/dist` exists, non-`/api` routes fall back to `frontend/dist/index.html`.

## API contract

The main endpoint is `POST /api/research`.

Request:

```json
{
  "query": "我要学 MCP",
  "mode": "topic",
  "userLevel": "beginner",
  "timeBudgetHours": 6
}
```

Response shape:

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
  "sources": [...],
  "cards": [...],
  "graph": { "nodes": [...], "edges": [...] },
  "learningPath": [...],
  "tasks": [...]
}
```

Other endpoints:

- `GET /api/health` — health check
- `GET /api/research/history` — recent research sessions
- `POST /api/cards/{id}/favorite` — toggle knowledge card favorite
- `PATCH /api/tasks/{id}` — update task status (`todo` / `doing` / `done`)

A full mock response example is in section 18 of the PRD and in `backend/app/data/mock_research.py`.

## Development commands

### Backend

Run from `backend/`:

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env to set LLM_API_KEY; leave blank for mock fallback
uvicorn app.main:app --reload --port 8000
```

Test endpoints:

```bash
curl http://localhost:8000/api/health

curl -X POST http://localhost:8000/api/research \
  -H "Content-Type: application/json" \
  -d '{"query":"我要学 MCP","mode":"topic","userLevel":"beginner","timeBudgetHours":6}'
```

Swagger UI: http://localhost:8000/docs

### Frontend

Run from `frontend/`:

```bash
npm install
npm run dev
```

Dev server: http://127.0.0.1:5173

Build for production:

```bash
npm run build
npm run preview
```

The Vite dev server proxies `/api` to `http://127.0.0.1:8000`, so run the backend first if you want to test the real API.

Run tests:

```bash
npm test                 # run all tests once
npm run test:watch       # watch mode
```

Run a single test file:

```bash
npx vitest run src/lib/graphUtils.test.ts
```

Run a single test by name:

```bash
npx vitest run -t "finds connected nodes for active-node highlighting"
```

Type-check without emitting:

```bash
npx tsc --noEmit
```

## Environment variables

Configure in `backend/.env` (copy from `backend/.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `LLM_API_KEY` | empty | API key; empty triggers mock data |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible endpoint |
| `LLM_MODEL` | `gpt-4o-mini` | Model name |
| `LLM_TIMEOUT` | `15` | Request timeout in seconds |

Optional:

- `TAVILY_API_KEY` — enables real web search in `content_discovery`; otherwise mock sources are used.

## Key implementation constraints

- The frontend is currently a static demo. The search button and topic input update local state but do not call the backend yet.
- LLM calls must have a mock fallback so the demo works without an API key.
- CORS is enabled in `backend/app/main.py` for `localhost:5173`, `127.0.0.1:5173`, `localhost:4173`, `127.0.0.1:4173`, and `localhost:3000`.
- Delete `backend/hub.db` to reset all SQLite data.
