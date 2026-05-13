# TikTok KOL Finder 2.0 — 产品需求文档

> 本文档定义 KOL Hunter 2.0 的产品愿景、功能范围、技术架构与迭代计划。

---

## 1. 产品概述

### 1.1 一句话描述
**TikTok KOL Finder** 是一款基于 TikHub API 的 TikTok 达人（KOL）发现与信息采集工具，帮助品牌方、营销团队在 TikTok 生态中精准定位并捕获潜在合作达人资源。

### 1.2 核心价值
- **实时数据抓取** — 整合 TikTok 全球公开数据，无需手动搜索
- **智能筛选引擎** — 多维度精细化筛选，快速定位目标达人
- **数据清洗与补全** — 自动提取邮箱等联系方式，提升建联效率

### 1.3 目标用户
| 用户角色 | 使用场景 |
|----------|----------|
| 品牌方市场部 | 寻找符合粉丝量级的 TikTok 达人进行带货合作 |
| MCN 机构 BD | 按领域快速批量获取达人联系信息 |
| 独立创作者 | 分析竞品账号数据，了解市场定位 |
| 营销策划 | 收集达人基础数据用于提案与报价参考 |

---

## 2. 功能说明

### 2.1 搜索模块

#### 关键词搜索
- **输入方式**：支持多关键词，用逗号分割（如 `AI Tools, Beauty, Fashion`）
- **标签系统**：自动将关键词转为可移除的标签（tag），支持一键清除单条关键词
- **推荐关键词**：预设 6 个快捷按钮（3C、AI Tools、Beauty、Home Decor、Fashion、Outdoor），点击后自动填入搜索框
- **回车触发**：输入框按 Enter 键直接开始搜索

#### 高级筛选（可折叠面板）
| 筛选维度 | 选项 |
|----------|------|
| 粉丝量区间 | `< 1K` · `1K-10K` · `10K-50K` · `50K-100K` · `100K-300K` · `300K-500K` · `500K-1M` · `1M-5M` · `> 5M` |
| 搜集数量 | `10` · `20` · `50` · `100` |
| 排序方式 | `播放量` · `粉丝量` · `最新` · `邮箱优先` |

**说明**：
- 粉丝区间为多选，支持同时勾选多个区间
- 排序默认为播放量降序
- 当筛选结果不足目标数量时，系统会自动放宽条件补足

### 2.2 采集流程（两阶段优化）

```
Phase 1: 搜索采集
  └─ 按关键词循环调用 TikHub Search API
  └─ 单关键词最多翻 4 页（每页 20 条）
  └─ Map 去重，按 unique_id 合并

Phase 2: 筛选与排序
  └─ 按粉丝区间过滤
  └─ 自动放宽机制（结果不足时）
  └─ 按指定维度排序

Phase 3: 补全（仅对最终候选）
  └─ 只对目标数量（如 20 条）的博主补全 Profile
  └─ 提取/更新邮箱信息
  └─ 减少 API 调用次数，提升整体速度
```

### 2.3 数据展示

#### 视图模式
- **网格视图（Grid）**：卡片式展示，3 列自适应
- **列表视图（List）**：紧凑列表，适合批量浏览

#### 统计面板
- 已捕获达人总数
- 有邮箱的达人数 + 占比
- 平均粉丝量
- 总播放量

#### 达人卡片字段
| 字段 | 说明 |
|------|------|
| Username | TikTok 唯一 ID (@后面的部分) |
| Nickname | 达人昵称 |
| Followers | 粉丝数量（格式化显示，如 1.2M） |
| Videos | 视频总数 |
| Best Video Plays | 最高播放量 |
| Email | 从简介中提取的邮箱（可能为空） |
| Bio | 达人简介 |
| Profile URL | TikTok 个人主页链接 |
| Keyword | 触发此次搜索的关键词 |

#### 交互操作
- **复制邮箱**：点击邮箱按钮复制到剪贴板，显示 2 秒提示
- **跳转主页**：点击头像或 Username 打开 TikTok 主页
- **导出 CSV**：一键导出当前结果为 CSV 文件（UTF-8 with BOM）

### 2.4 主题切换
- **浅色模式（Light）** — 白色背景，适合办公环境
- **深色模式（Dark）** — 暗色背景，适合夜间使用
- 切换按钮位于页面右上角（Moon/Sun 图标）

---

## 3. 技术架构

### 3.1 技术栈

| 层级 | 技术选型 |
|------|----------|
| 框架 | Next.js 15 (App Router) |
| UI 库 | React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 3.4 |
| 动画 | motion/react 12 |
| 图标 | lucide-react |
| API 来源 | TikHub API |

### 3.2 目录结构

```
tk-kol-finder2/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页（状态管理、UI 布局）
│   │   ├── layout.tsx            # 根布局
│   │   └── api/
│   │       └── scrape/
│   │           └── route.ts      # 搜索 API 端点
│   ├── components/
│   │   ├── SearchBar.tsx         # 搜索栏 + 筛选面板
│   │   ├── HeroBanner.tsx        # Hero 区域
│   │   ├── CreatorCard.tsx       # 达人卡片
│   │   ├── StatsGrid.tsx         # 统计面板
│   │   └── Sidebar.tsx           # 侧边栏
│   ├── lib/
│   │   └── scraper.ts            # 核心爬虫逻辑
│   ├── types.ts                  # TypeScript 类型定义
│   └── constants.ts              # 常量配置（粉丝区间等）
├── package.json
├── tsconfig.json
└── .env.local                   # TikHub API Key（不上传 GitHub）
```

### 3.3 API 设计

**端点**：`POST /api/scrape`

**请求体**：
```json
{
  "keywords": "AI Tools, Beauty",
  "followerRanges": ["100k-300k", "300k-500k"],
  "sortBy": "views",
  "limit": 20
}
```

**响应体**：
```json
{
  "creators": [
    {
      "unique_id": "creator123",
      "nickname": "Creator Name",
      "follower_count": 250000,
      "video_count": 156,
      "bio": "Beauty tips...",
      "email": "contact@example.com",
      "profile_url": "https://www.tiktok.com/@creator123",
      "best_video_plays": 1500000,
      "best_video_likes": 85000,
      "search_keyword": "Beauty"
    }
  ],
  "total": 20
}
```

### 3.4 TikHub API 端点

| 用途 | 端点 |
|------|------|
| 搜索达人 | `/api/v1/tiktok/app/v3/fetch_general_search_result` |
| 补全 Profile | `/api/v1/tiktok/web/fetch_user_profile` |

---

## 4. 邮箱覆盖率说明

TikTok 平台特性决定了**邮箱并非标配字段**，大多数用户不会在简介中公开邮箱。

| 达人类型 | 留邮箱概率 |
|----------|------------|
| 头部 KOL（>100万） | 较高，通常有商务合作邮箱 |
| 腰部 KOL（10万-100万） | 中等，部分有商务邮箱 |
| 尾部 KOL（<10万） | 较低，纯创作者通常不留邮箱 |

**建议**：使用 `商务合作`、`Collab`、`Partnership` 等关键词组合搜索，可提升邮箱获取率。

---

## 5. 已上线版本差异

| 版本 | 主要变化 |
|------|----------|
| KOL-Finder-UI3.0（Vite+React） | 旧版 UI，使用旧版 TikHub API 端点 |
| **KOL-hunter2.0（Next.js）** | 新架构，优化筛选逻辑，补全阶段优化（只补全最终候选） |

---

## 6. 迭代计划

### 6.1 短期（v2.1）
- [ ] 搜索历史记录（最近 5 条）
- [ ] 多语言支持（中文/英文界面切换）
- [ ] 搜索结果本地缓存

### 6.2 中期（v2.2）
- [ ] 批量建联邮件发送集成
- [ ] 达人数据分析图表（粉丝趋势、爆款视频分析）
- [ ] 关键词管理（收藏、组合）

### 6.3 长期（v3.0）
- [ ] 多平台支持（Instagram、YouTube、TikTok 三平台数据汇总）
- [ ] AI 智能推荐（基于投放预算自动推荐达人组合）
- [ ] 达人合作管理（跟进状态、报价记录）

---

## 7. GitHub 仓库

**仓库地址**：https://github.com/All-cookies/KOL-hunter2.0.git

**分支策略**：
- `main` — 稳定版本
- 其他功能分支按需创建

**敏感信息**：
- `.env.local` 中的 `TIKHUB_API_KEY` 不上传 GitHub
- `.gitignore` 已配置排除规则

---

## 8. 附录

### 粉丝区间对照表

| value | 显示标签 | 完整标签 | 范围 |
|-------|----------|----------|------|
| `under1k` | < 1K | 素人 | < 1,000 |
| `1k-10k` | 1K - 10K | 尾部KOL | 1K - 10K |
| `10k-50k` | 10K - 50K | 腰部KOL | 10K - 50K |
| `50k-100k` | 50K - 100K | 中腰部 | 50K - 100K |
| `100k-300k` | 100K - 300K | 中部KOL | 100K - 300K |
| `300k-500k` | 300K - 500K | 中头部 | 300K - 500K |
| `500k-1m` | 500K - 1M | 头部KOL | 500K - 1M |
| `1m-5m` | 1M - 5M | 顶级KOL | 1M - 5M |
| `over5m` | > 5M | 超级头部 | > 5M |
