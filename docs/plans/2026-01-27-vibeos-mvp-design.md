# VibeOS MVP Design Document

**Date**: 2026-01-27
**Status**: Design Approved
**Goal**: 验证完整Reconciliation Loop的最小实现原型

---

## 1. Overview

### 1.1 验证目标
验证VibeOS的核心概念：**完整的Reconciliation Loop**（Specifier → Coder → Auditor 三阶段循环）

### 1.2 演示场景
贪吃蛇游戏 - 展示从用户需求到可运行游戏的完整自动化开发流程

### 1.3 技术选型
- **语言**: TypeScript
- **智能体**: 真实LLM调用（Claude/OpenAI API）
- **测试**: Jest (单元测试) + Playwright (E2E测试)
- **运行时**: Node.js

---

## 2. System Architecture

### 2.1 核心模块

```
┌─────────────────────────────────────────────────────────────┐
│                     VibeOS MVP System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │ User Input   │───▶│    Vibe Manifest (CRD)           │  │
│  │ (自然语言)    │    │    - Intent (功能描述)            │  │
│  └──────────────┘    │    - Constraints (技术栈约束)      │  │
│                      │    - Visual Spec (视觉规范)         │  │
│                      │    - Functional Spec (行为规范)     │  │
│                      └────────────┬─────────────────────┘  │
│                                   │                         │
│                                   ▼                         │
│                      ┌──────────────────────────────────┐  │
│                      │   Reconciliation Engine          │  │
│                      │   - Loop Controller              │  │
│                      │   - State Management             │  │
│                      │   - CrashLoopBackOff (max 10)    │  │
│                      └────────────┬─────────────────────┘  │
│                                   │                         │
│              ┌────────────────────┼────────────────────┐   │
│              │                    │                    │   │
│              ▼                    ▼                    ▼   │
│     ┌─────────────┐      ┌─────────────┐     ┌───────────┐ │
│     │  Specifier  │      │   Coder     │     │  Auditor  │ │
│     │   Agent     │─────▶│   Agent     │─────▶│  Agent   │ │
│     │             │      │             │     │           │ │
│     │ TDD-First:  │      │ 生成/修改   │     │ 运行测试   │ │
│     │ 生成测试    │      │ 代码        │     │ 计算Diff  │ │
│     └─────────────┘      └─────────────┘     └───────────┘ │
│              ▲                                       │      │
│              │          Diff > 0?                    │      │
│              └──────────────Yes──────────────────────┘      │
│                             │                               │
│                             No                              │
│                             ▼                               │
│                      ┌─────────────┐                       │
│                      │   Ready     │                       │
│                      │   State     │                       │
│                      └─────────────┘                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Supporting Modules                      │  │
│  │  - Execution Environment (代码沙箱)                   │  │
│  │  - State Store (Git + Memory DB)                     │  │
│  │  - LLM Client (统一AI调用接口)                        │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 模块说明

#### 2.2.1 Vibe Manifest（声明式规范）
用户输入的自然语言需求转化为结构化的JSON规范。

```typescript
interface VibeManifest {
  metadata: {
    name: string;              // 组件名称
    version: string;           // 版本
  };
  spec: {
    intent: string;            // 功能描述（自然语言）
    constraints: {
      framework: string;       // 框架选择
      language: string;        // 编程语言
      testing: string[];       // 测试框架
    };
    visualSpec?: {
      style: string;           // 视觉风格
      elements: string[];      // 必需的UI元素
    };
    functionalSpec: {
      inputs?: string[];       // 输入参数
      states: string[];        // 状态列表
      behaviors: string[];     // 行为描述
    };
  };
  status: {
    phase: 'Pending' | 'Reconciling' | 'Ready' | 'Failed';
    currentLoop: number;
    lastError?: string;
    diff?: number;
  };
}
```

#### 2.2.2 Reconciliation Engine（调和引擎）
主循环控制器，实现以下功能：

```typescript
class ReconciliationEngine {
  // 执行完整的Reconciliation Loop
  async reconcile(manifest: VibeManifest): Promise<ReconciliationResult>;

  // 单次循环迭代
  async executeLoop(manifest: VibeManifest, loopNumber: number): Promise<LoopResult>;

  // 状态转换
  transitionPhase(phase: Phase): void;

  // CrashLoopBackOff检测
  checkCrashLoop(loopHistory: LoopResult[]): boolean;
}
```

**循环流程**:
1. 解析Manifest，验证规范完整性
2. 调用Specifier Agent生成测试（必须FAIL）
3. 调用Coder Agent生成/修改代码
4. 调用Auditor Agent运行测试并计算Diff
5. 如果Diff > 0且未超过最大循环次数，返回步骤2
6. 否则，标记为Ready或Failed

#### 2.2.3 Agent Swarm（智能体集群）

**Specifier Agent** - TDD先行
```
输入: VibeManifest + 当前代码状态
输出: 测试代码 (Jest测试 + Playwright E2E测试)
验证: 运行测试必须FAIL
```

**Coder Agent** - 代码生成
```
输入: 失败的测试结果 + 当前代码
输出: 修改后的代码
策略: 分析测试失败原因，生成最小化修复
```

**Auditor Agent** - 审计验证
```
输入: 当前代码 + 测试套件
输出: Diff值 (0表示通过，>0表示有差距)
验证逻辑:
  - Logic Diff: 单元测试失败数量
  - Visual Diff: E2E测试失败数量
  - Total Diff = Logic Diff + Visual Diff
```

#### 2.2.4 Execution Environment（执行环境）
沙箱化的代码运行环境：
- 使用临时目录隔离每次迭代
- 支持TypeScript编译和执行
- 自动安装依赖（npm/yarn）
- 运行测试并捕获输出

#### 2.2.5 State Store（状态存储）
- **Git仓库**: 存储代码历史，支持回滚
- **内存数据库**: 存储循环历史、LLM调用记录、决策树

---

## 3. Reconciliation Loop 详细设计

### 3.1 循环状态机

```
                    ┌─────────────┐
                    │   Pending   │
                    └──────┬──────┘
                           │ 开始Reconcile
                           ▼
                    ┌─────────────┐
            ┌──────▶│ Reconciling │◀─────┐
            │       └──────┬──────┘      │
            │              │             │
            │              ▼             │
  Diff > 0  │       ┌─────────────┐     │
  且未超限   │       │   Execute   │     │
            │       │   Loop      │─────┤
            │       └─────────────┘     │
            │              │             │
            │              ▼             │
            │       ┌─────────────┐     │
            │       │ Specifier   │     │
            │       │ (测试)      │     │
            │       └──────┬──────┘     │
            │              │             │
            │              ▼             │
            │       ┌─────────────┐     │
            │       │   Coder     │     │
            │       │ (代码)      │     │
            │       └──────┬──────┘     │
            │              │             │
            │              ▼             │
            │       ┌─────────────┐     │
            │       │  Auditor    │     │
            │       │ (验证)      │     │
            │       └──────┬──────┘     │
            │              │             │
            │              ▼             │
            │       ┌─────────────┐     │
            └───────│   计算Diff  │─────┘
                    └─────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
               Diff = 0      Diff > 0
                    │             │ (且超限)
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │  Ready   │  │  Failed  │
              └──────────┘  └──────────┘
```

### 3.2 循环终止条件

1. **成功**: Diff = 0（所有测试通过）
2. **失败**:
   - 连续5次循环Diff未减少
   - 总循环次数达到10次
   - LLM调用失败超过重试次数

### 3.3 CrashLoopBackOff策略

```typescript
interface CrashLoopConfig {
  maxTotalLoops: number;        // 最大总循环次数: 10
  maxStagnationCount: number;   // 最大停滞次数: 5
  stagnationThreshold: number;  // 停滞判定阈值: Diff减少 < 10%
}

function detectCrashLoop(history: LoopResult[]): boolean {
  if (history.length >= config.maxTotalLoops) return true;

  // 检测停滞：最近N次循环Diff没有显著改善
  const recent = history.slice(-config.maxStagnationCount);
  const hasImprovement = recent.some((result, i) =>
    i > 0 && result.diff < recent[i-1].diff * 0.9
  );

  return !hasImprovement && recent.length >= config.maxStagnationCount;
}
```

---

## 4. 项目结构

```
vibeos-mvp/
├── src/
│   ├── core/
│   │   ├── manifest.ts           # VibeManifest类型定义
│   │   ├── reconciliation.ts     # ReconciliationEngine
│   │   └── state-machine.ts      # 状态机逻辑
│   ├── agents/
│   │   ├── base.ts               # Agent基类
│   │   ├── specifier.ts          # Specifier Agent
│   │   ├── coder.ts              # Coder Agent
│   │   └── auditor.ts            # Auditor Agent
│   ├── execution/
│   │   ├── sandbox.ts            # 沙箱环境
│   │   ├── test-runner.ts        # 测试运行器
│   │   └── compiler.ts           # TypeScript编译
│   ├── storage/
│   │   ├── git-store.ts          # Git状态存储
│   │   └── memory-store.ts       # 内存状态存储
│   ├── llm/
│   │   ├── client.ts             # 统一LLM客户端
│   │   └── prompts.ts            # Prompt模板
│   └── cli/
│       └── index.ts              # CLI入口
├── templates/
│   └── snake-game.md             # 贪吃蛇示例Manifest
├── tests/
│   ├── unit/                     # 单元测试
│   └── integration/              # 集成测试
├── package.json
└── tsconfig.json
```

---

## 5. 示例：贪吃蛇游戏的Reconciliation流程

### 5.1 用户输入（自然语言）
```
创建一个贪吃蛇游戏：
- 使用React + TypeScript
- 画布大小400x400
- 蛇初始长度3
- 方向键控制移动
- 撞墙或撞自己死亡
- 显示分数
```

### 5.2 生成的VibeManifest
```json
{
  "metadata": {
    "name": "snake-game",
    "version": "1.0.0"
  },
  "spec": {
    "intent": "一个经典贪吃蛇游戏，玩家通过方向键控制蛇的移动，吃到食物增加长度和分数，撞墙或撞到自己游戏结束",
    "constraints": {
      "framework": "React",
      "language": "TypeScript",
      "testing": ["Jest", "React Testing Library"]
    },
    "visualSpec": {
      "style": "minimalist",
      "elements": ["canvas", "score-display", "game-over-screen"]
    },
    "functionalSpec": {
      "states": ["playing", "game-over", "paused"],
      "behaviors": [
        "蛇每帧移动一格",
        "吃到食物身体增长",
        "碰撞检测触发游戏结束",
        "分数实时更新"
      ]
    }
  },
  "status": {
    "phase": "Pending",
    "currentLoop": 0
  }
}
```

### 5.3 Reconciliation循环示例

**Loop 1**:
- Specifier: 生成 `SnakeGame.test.tsx`（测试组件存在、props、初始状态）
- 运行测试: ❌ FAIL (组件不存在)
- Coder: 生成基础的 `SnakeGame.tsx` 组件
- Auditor: 运行测试，Diff = 5 (5个测试失败)

**Loop 2**:
- Specifier: 添加游戏逻辑测试（移动、碰撞检测）
- 运行测试: ❌ FAIL (方法不存在)
- Coder: 实现 `moveSnake()`, `checkCollision()` 等方法
- Auditor: 运行测试，Diff = 3

**Loop 3**:
- Specifier: 添加E2E测试（键盘控制、游戏结束）
- 运行测试: ❌ FAIL (事件监听未实现)
- Coder: 添加键盘事件处理
- Auditor: 运行测试，Diff = 1

**Loop 4**:
- 运行测试: ✅ PASS
- Diff = 0
- 状态 → Ready

---

## 6. 实现优先级

### Phase 1: 基础框架 (MVP核心)
- [ ] VibeManifest类型定义
- [ ] ReconciliationEngine基础结构
- [ ] 简单的LLM Client（支持Claude API）
- [ ] 基础的Sandbox环境

### Phase 2: Agent实现
- [ ] Specifier Agent（生成测试）
- [ ] Coder Agent（生成代码）
- [ ] Auditor Agent（运行测试、计算Diff）

### Phase 3: 完整循环
- [ ] 状态机实现
- [ ] CrashLoopBackOff机制
- [ ] 状态持久化（Git + Memory）

### Phase 4: 演示场景
- [ ] 贪吃蛇Manifest模板
- [ ] 端到端演示流程
- [ ] CLI工具

---

## 7. 技术依赖

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/jest": "^29.0.0",
    "@types/react": "^18.0.0",
    "jest": "^29.0.0",
    "playwright": "^1.40.0",
    "tsx": "^4.0.0"
  }
}
```

---

## 8. 风险与限制

### 8.1 已知限制
- LLM输出的不确定性可能导致无限循环
- 代码执行安全性（沙箱隔离）
- Token成本控制

### 8.2 缓解措施
- 严格的CrashLoopBackOff机制
- 使用临时文件系统和进程隔离
- Token使用监控和预算控制

---

## 9. 成功标准

VibeOS MVP被认为成功当：
1. ✅ 能够从自然语言生成VibeManifest
2. ✅ 能够执行完整的Reconciliation Loop
3. ✅ 能够生成可运行的贪吃蛇游戏
4. ✅ 所有自动化测试通过
5. ✅ 循环在合理次数内收敛（≤10次）

---

**下一步**: 准备开始实施？
