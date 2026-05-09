# TikTok KOL 采集工具 — 通用版

## 产品定位

帮助运营人员快速找到 TikTok 博主，采集联系方式，导出飞书表格。**全品类通用**。

## 核心功能

### 1. 关键词输入
- 用户自己输入关键词（不限品类）
- 支持多组关键词，逗号分隔
- 示例：`tech review, gadget, smartphone`

### 2. 博主采集
- 按关键词搜索 TikTok 视频，提取作者信息
- 多关键词批量搜索
- 全局去重
- 补全博主 Profile（含邮箱提取）

### 3. 邮箱统计
- 标注每位博主是否有邮箱
- 统计整体有邮箱数量和比例

### 4. 飞书表格导出
- 支持导出到飞书文档

### 5. UI 界面
- 输入关键词
- 展示采集结果
- 可搜索、筛选
- 显示邮箱覆盖率统计

## 技术栈

- **后端**: Node.js + TypeScript
- **爬虫**: TikHub API
- **前端**: Next.js + Tailwind CSS
- **导出**: 飞书开放 API

## 输出字段

```
username, nickname, follower_count, video_count, bio, email, profile_url,
best_video_plays, search_keyword, has_email
```
