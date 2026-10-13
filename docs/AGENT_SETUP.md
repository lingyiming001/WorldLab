# 平台内 Agent 服务

当前服务端接口已实现，但本站没有 OPENAI_API_KEY。未配置状态返回 configured=false，前端禁用生成；不会以预设内容冒充 AI。公园示例可用于检验编辑与导入流程。

## 安全配置

1. 启用 OpenAI Developers 插件，依 `openai-platform-api-key` skill 经用户批准创建/获取项目密钥。不要把密钥贴在聊天、前端设置或地图文件中。
2. 使用 Sites `update_environment_variables`，设置 `OPENAI_API_KEY`，标记 `is_secret=true`；可选 `OPENAI_MODEL`（默认 gpt-4.1-mini）。不要将值写进源码、hosting.json 或 VITE_ 变量。
3. 重新部署已有版本以应用环境修订。模型必须在该 API 项目可用并支持 Responses structured outputs。
4. 验证真实「生成 → 清单预览 → 应用 → 保存 → 导入」；确认名称符合需求和出生点周围可通行。目前这些真实 AI 检查因缺少密钥尚未进行。

本地开发只在 `.env.local` 设置同名服务端变量；文件已忽略。开发接口仅绑定 loopback，本地身份仅用于预览；生产身份必须来自私有 Sites 调度器注入的 `oai-authenticated-user-id`。

## 接口

- GET `/api/agent/status` → `{configured:boolean}`，不回传密钥。
- POST `/api/agent/generate` → body `{request:string,components:ComponentDefinition[]}`；成功 `{plan:ScenePlan}`。1–6000 字需求，64 KB 请求限制。服务端从目录与规范构造提示词，用严格 JSON Schema 输出并进行语义校验，客户端再次验证。`store:false`，不将已有 GLB、地图资产或学习记录发给模型；发送需求和自定义组件定义。
- 要求同源 Origin 与已登录身份；生成超时 55 秒，输出限制 7000 tokens，拒绝不完整/不合规结果。上游错误正文不回显。配置错误、限额、取消与验证错误有可读提示。

当前限流是 Worker isolate 内的尽力防护：每用户每 5 分钟 6 次，单请求并发。它不是跨 isolate 全局配额；正式多人商业化之前需要集中限流、预算与账单治理。站点保持原有 owner-private 访问范围，不能直接改为公开后沿用此费用控制方案。

服务端定义见 `server/agent.ts`，输出 Schema 见 `src/agent-schema.ts`，Worker 与静态打包见 `scripts/build-worker.mjs`。没有密钥输入 UI 或额外公开 token。

官方接口依据：[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)。
