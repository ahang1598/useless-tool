# 时空碎片彩蛋（Spacetime Shard）

## 概念

呼应网站"时光机"主线：**时空隧道偶尔会漏出碎片**，散落在某个无用工具页面的角落，等用户发现。找到后奖励一个**临时页面特效**（3-5 秒后消失），契合"无用工具"的自嘲气质。

## 当前架构（Phase 1 探索结论）

- 路由（[src/App.jsx](file:///d:/AI/code/word/useless-tool/src/App.jsx)）：`/`、`/time-machine`、`/discipline`、`/swiss-army`、`/mystic`
- 全局包裹层 [src/components/Layout.jsx](file:///d:/AI/code/word/useless-tool/src/components/Layout.jsx)：`main` 内用 `<Outlet/>` 渲染页面，`useLocation` 监听路由切换。**彩蛋容器挂在这里，天然跨页面生效。**
- 视觉系统：深色 `void #0a0a0f` + 三色霓虹 `acid #d4ff3a` / `frost #7afcff` / `plasma #ff2d75`；Framer Motion 做动效；`tailwind.config.js` 已自定义 `animate-spin-slow/spin-rev/pulse-glow/drift` 关键帧，可复用。
- i18n（[src/i18n/index.jsx](file:///d:/AI/code/word/useless-tool/src/i18n/index.jsx)）：Context + 中英字典 + `t(path)` 取值。彩蛋文案需进字典。
- 移动端顶部有固定栏（`pt-[4.5rem]` 留白），PC 端侧栏可折叠。碎片 Y 坐标需避开这些区域。

## 用户已确认的决策

| 决策点 | 选择 |
|---|---|
| 找到彩蛋的奖励 | **解锁临时小特效**（给当前页面加 3-5 秒小彩蛋特效，自动消失） |
| 出现时机 | **停留/滚动后才掉落**（用户进入目标页面停留约 1.5s 或滚动一次后，碎片才悄悄漏出） |

## 核心机制设计

### 1. 投放算法（首页掷骰子）
- 监听 `location.pathname`，当变为 `/` 时，重置 sessionStorage 并重新随机：
  - `target`：从 `['/time-machine','/discipline','/swiss-army','/mystic']` 随机选一
  - `x`：`8%~88%`（避左右边缘）
  - `y`：`18%~78%`（避移动端顶部固定栏 + 底部）
  - `effectId`：从特效池随机选一，作为本次奖励
- 存 `sessionStorage['ut-egg'] = JSON.stringify({ target, x, y, effectId, collected: false })`
- 当 `pathname === target` 且 `!collected` 时，进入"等待掉落"状态

### 2. 掉落触发（停留 / 滚动）
- 进入目标页面后启动两个监听：`setTimeout 1500ms` **或** `window 'scroll'` 一次
- 任一触发 → 移除监听 → `phase` 切到 `'dropped'`
- 碎片用 Framer Motion `spring` 从屏幕外飞入 `(x, y)` 位置

### 3. 碎片视觉（SVG + 动效）
- 一颗菱形晶体 SVG：`acid→frost` 线性渐变填充 + 1.5px 发光描边
- 外圈：2 层呼吸光晕（`animate-pulse-glow` + 不同 blur）+ 1 圈缓慢旋转的虚线轨道（复用时光机旋转环美学）
- 主体：上下漂浮 `±6px / 3s` + 极慢自转
- hover：`scale 1.2` + 光晕增强 + 描边变亮
- 极淡的"↓ 发现我"脉冲提示（首次掉落 2s 后淡出）

### 4. 点击奖励 = 临时特效
点击瞬间：
- 粒子爆裂：8 个小碎片 SVG 向四周散开（`AnimatePresence` + 随机角度/距离）
- 屏幕短暂闪光（白色覆盖层 `opacity 0→0.3→0`，200ms）
- 顶部 toast：`✦ 时空碎片已回收 · 奖励：{特效名}（持续 4 秒）`
- sessionStorage 标记 `collected: true`，本 session 不再出现
- 随即激活 `activeEffect`，4 秒后自动清除

**临时特效池（5 个，纯 CSS，轻量）**：

| id | 中文名 | 英文名 | 实现 |
|---|---|---|---|
| `rainbow-trail` | 彩虹拖尾 | Rainbow Trail | mousemove 生成 6 色小圆点，0.8s 淡出 |
| `screen-shake` | 时空余震 | Spacetime Quake | 给 `main` 加 `animate-shake` 3s |
| `color-noise` | 色彩噪点 | Chroma Static | 全屏覆盖层 opacity 随机抖动 4s |
| `tilt-world` | 世界倾斜 | Tilted Reality | 给 `main` 内文字加 `rotate ±3°` 随机 class 4s |
| `bubble-pop` | 边缘气泡 | Edge Bubbles | 屏幕底边冒 12 个彩色泡泡上升 |

> 所有特效都用 Tailwind + 内联 keyframes 实现，不引入新依赖；`screen-shake`/`tilt-world` 需在 `tailwind.config.js` 补两个 keyframe。

## 文件改动清单

### 新建
- **`src/components/EasterEgg/Shard.jsx`** — 碎片本体：SVG 晶体 + 光晕 + 漂浮/旋转/hover 动效；props: `onCollect`
- **`src/components/EasterEgg/Burst.jsx`** — 点击瞬间的粒子爆裂（8 碎片散开）+ 屏幕闪光
- **`src/components/EasterEgg/ActiveEffect.jsx`** — 全屏临时特效渲染层，按 `effectId` switch 渲染对应特效；4s 后 `onDone`
- **`src/components/EasterEgg/toast.jsx`** — 顶部 toast 组件（framer-motion 滑入/淡出）
- **`src/components/EasterEgg/index.jsx`** — 容器（核心编排）：读 sessionStorage、监听 `useLocation`、掷骰子、停留/滚动监听、phase 状态机、收集后挂 `ActiveEffect`
- **`src/components/EasterEgg/effects.js`** — 特效池元数据 `{ id, zh, en, duration }` 常量

### 修改
- **[src/components/Layout.jsx](file:///d:/AI/code/word/useless-tool/src/components/Layout.jsx)** — 在 `<main>` 内 `<Outlet/>` 同级挂 `<EasterEgg/>`；并把 `main` 的 ref 暴露出去（供 shake/tilt 特效操作），或改用 CSS class 切换
- **[src/i18n/index.jsx](file:///d:/AI/code/word/useless-tool/src/i18n/index.jsx)** — 中英字典各加 `egg` 节点：`toastTitle`、`toastBody`、`hint`、`effects.{5项name}`、`found`
- **[tailwind.config.js](file:///d:/AI/code/word/useless-tool/tailwind.config.js)** — 补 `animate-shake` 和 `animate-tilt` 两个 keyframe（供 screen-shake / tilt-world 特效用）

## 状态机（容器内）

```
phase: 'idle'（未到目标页/已收集）
  └─ 进入 targetPath 且 !collected
       → phase: 'arming'（启动停留/滚动监听）
            └─ 停留1.5s 或 滚动一次
                 → phase: 'dropped'（碎片飞入）
                      └─ 点击 onCollect
                           → phase: 'bursting'（爆裂0.3s）
                                → phase: 'effect'（挂 ActiveEffect 4s）
                                     → phase: 'idle'
```

sessionStorage `collected` 防止本 session 重复；回首页重新掷骰子并复位 `collected`。

## 假设与边界

- 彩蛋**不出现在首页**（用户明确要求）。`/` 仅作为"掷骰子锚点"。
- 碎片位置用百分比，PC/手机/iPad 自适应；移动端 Y 下限 18% 避开顶部固定栏。
- 特效作用域为 `main` 内容区，不污染侧栏，避免误触导航。
- 不引入新依赖，全部用现有 Framer Motion + Tailwind + 内联 keyframes。
- 不做跨 session 持久化（用户未选图鉴系统），sessionStorage 足够。
- 移动端 `scroll` 监听用 `touchmove` 兜底，确保 iOS Safari 触发。

## 验证步骤

1. 访问 `/` → 进 4 个子页之一（多试几次命中 target）→ **停留 1.5s 或滚动** → 碎片应弹性飞入
2. 点碎片 → 粒子爆裂 + 闪光 + toast → 对应临时特效激活 → 4s 后自动消失
3. 同 session 再次进入该 target 页 → 不再出现（collected=true）
4. 回 `/` → 再进子页 → 应重新掷骰子（新 target/位置/特效）
5. PC（侧栏展开/收起）、手机、iPad 三端：碎片位置不溢出、可点中、toast 不挡操作
6. 中英文切换：toast / hint 文案正确切换
7. 特效不污染侧栏，ESC/路由切换能立即终止特效
8. `npm run build` 通过，无报错

## 实施顺序建议

1. 补 tailwind keyframes + i18n 文案（地基）
2. 写 `effects.js` 元数据 + `Shard.jsx` + `Burst.jsx`（纯视觉组件）
3. 写 `ActiveEffect.jsx` + `toast.jsx`（奖励层）
4. 写 `index.jsx` 容器（状态机编排，最复杂）
5. 挂到 `Layout.jsx`
6. 本地 `npm run dev` 跑通全流程
7. build + 推 GitHub
