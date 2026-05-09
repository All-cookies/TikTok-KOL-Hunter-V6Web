# TikTok KOL Finder

采集 TikTok 博主联系方式的工具，支持多关键词搜索、粉丝区间筛选、邮箱提取。

## 功能

- **多关键词搜索** — 输入关键词，自动采集相关 TikTok 博主
- **粉丝区间筛选** — 支持多选：1k以下、1K-10K、1万-10万、10万-50万、50万+
- **智能排序** — 按播放量、最新、随机或有邮箱优先排序
- **自动补全邮箱** — 从博主简介中提取邮箱地址
- **邮箱覆盖率统计** — 实时显示采集结果中有邮箱的比例
- **结果灵活可调** — 支持采集 10/20/30/50 条结果

## 技术栈

- **前端**: Next.js + React + Tailwind CSS
- **后端**: Node.js + TypeScript
- **API**: TikHub API

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3010`

## 环境变量

```bash
cp .env.example .env
# 编辑 .env 填入你的 TikHub API Key
```

## 项目结构

```
src/
├── app/
│   ├── api/scrape/route.ts   # 搜索 API
│   ├── page.tsx              # 主页面
│   └── globals.css           # 样式
└── lib/
    └── scraper.ts            # 爬虫核心逻辑
```

## License

MIT