# WuZiQi - 五子棋人机对战

一个基于 React + TypeScript + Vite 的高清五子棋 Web 应用，支持玩家与 AI 对战。AI 使用启发式评估 + Minimax（Alpha-Beta 剪枝），在保证响应速度的同时具备较强策略性。

## 产品目标

- 提供开箱即用的人机五子棋对战体验。
- 界面风格优雅、动画流畅、棋盘高清显示。
- 支持中等强度以上 AI 决策，而非随机落子。
- 提供完整工程化能力：Lint、单元测试、覆盖率、构建。

## 主要功能

- 15x15 标准棋盘。
- 玩家（黑棋）vs AI（白棋）对战。
- 自动判定胜负与平局。
- 悔棋（默认撤回最近一手或一轮）。
- AI 难度（搜索深度 1~3）调节。
- 最后一步高亮标记。

## 技术栈

- React 19
- TypeScript
- Vite 8
- Vitest + Testing Library
- ESLint

## 系统设计

### 目录结构

```text
src/
  ai/
    evaluate.ts        # 启发式局面评分
    minimax.ts         # Minimax + Alpha-Beta 剪枝
  components/
    GomokuBoard.tsx    # Canvas 棋盘渲染与交互
    GamePanel.tsx      # 信息面板与控制项
  game/
    board.ts           # 棋盘数据与候选点生成
    rules.ts           # 胜负规则判定
    types.ts           # 类型定义
  tests/
    ai.test.ts         # AI 决策测试
    rules.test.ts      # 规则测试
    app.test.tsx       # 组件基础交互测试
  App.tsx              # 游戏流程与回合控制
  main.tsx
```

### 关键流程

1. 玩家点击棋盘落子。
2. 规则引擎校验落子、判定胜负。
3. 若未结束，轮到 AI：运行 Minimax 搜索最优落点。
4. AI 落子后再次判定胜负，更新 UI 状态。

## AI 设计说明

### 1) 候选点裁剪

- 仅在已有棋子周边距离 2 格范围内生成候选点，避免全盘穷举。
- 候选点按距中心点的曼哈顿距离排序，优先考虑局部关键区域。

### 2) 启发式评估

- 统计四个方向连续棋型。
- 依据棋型赋分（示例：活四、冲四、活三等）。
- 总分 = AI 分数 - 玩家分数 * 权重，用于强化防守意识。

### 3) Minimax + Alpha-Beta

- 最大层为 AI，最小层为玩家。
- 每层基于候选点展开并进行 Alpha-Beta 剪枝。
- 深度可调（1~3），在强度与速度间平衡。

## UI/交互设计

- Canvas 渲染棋盘与棋子，支持高 DPI 显示。
- 棋盘木纹渐变、石子阴影与高光增强视觉质感。
- 最后落子标记强化局势感知。
- AI 思考状态文本提示，防止重复点击。

## 质量保障

- 规则测试：覆盖横向/斜向五连核心判定。
- AI 测试：验证“有必胜点时优先取胜”。
- 组件测试：基础渲染与控制项交互。

## 本地运行

> 如系统 PATH 未识别 npm，可通过 node + npm-cli.js 方式执行（本仓库已验证）。

```bash
npm install
npm run dev
```

打开浏览器访问 Vite 输出地址即可游玩。

## 测试与构建

```bash
npm run lint
npm run test
npm run build
```

## 性能优化策略

- 候选点邻域裁剪（减少搜索分支）。
- 候选数上限控制（默认最多 16 个）。
- 通过搜索深度滑条按设备性能调节。

## 后续迭代建议

- 引入置换表（Transposition Table）降低重复计算。
- 增加开局库与更细粒度棋型模式识别。
- 支持先后手切换、禁手规则、对局记录回放。
- 增加音效、胜利动画与主题皮肤系统。

## 开源与仓库

GitHub: <https://github.com/Tomhao10225101490/WuZiQi.git>
