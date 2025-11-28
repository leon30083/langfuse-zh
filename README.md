# Langfuse 中文翻译扩展

## 功能
- 离线词典翻译（`translations/zh.js` 优先，避免 JSON 转义问题）
- 动态渲染翻译（MutationObserver 增量处理）
- 域名白名单开关、启用/停用翻译
- 词典导入/导出，一键补充未覆盖文案
- 控制台调试日志（词典加载、命中统计、页面采样）

## 安装
- 打开 `chrome://extensions`
- 启用“开发者模式”
- 点击“加载已解压的扩展程序”，选择 `langfuse-zh` 目录

## 使用
- 打开 Langfuse 页面（例如 `http://192.168.101.16:3000/`）
- 扩展默认启用翻译，若未生效：
  - 在扩展“详情”→“扩展选项”勾选“启用翻译”
  - `域名白名单` 留空表示所有域名启用；如需限定请填写 `192.168.101.16:3000`
- 词典管理：在选项页点击“导出词典/导入词典”，快速增补条目
- 控制台采样：在页面控制台执行 `window.langfuseZhDump()` 采集英文片段用于补充词典

## 已覆盖页面要点
- 提示词（Prompts）：导航、引导卡片、按钮与搜索/筛选、表格列与分页
- 演练场（Playground）：模型与连接提示、顶部操作、消息角色与占位、提交区

## 词典文件说明
- 推荐使用 `translations/zh.js`（模块导出），避免 JSON 正则与转义问题
- 如需 JSON 词典，确保所有反斜杠双重转义（`\\b`、`\\s`、`\\.` 等）

## 调试
- 控制台日志示例：
  - `langfuse-zh: dict loaded { exactCount: N, regexCount: M }`
  - `langfuse-zh: translate applied { visited: X, replaced: Y }`
- 页面采样：
  - `window.langfuseZhDump()` 打印采样数组；`copy(window.langfuseZhDump())` 复制到剪贴板

## 常见问题
- 未翻译：将未覆盖英文加入 `translations/zh.js` 的 `exact` 或 `regex`，重新加载扩展并刷新页面
- 无日志：确保页面 URL 匹配 `manifest.json` 的 `matches`，并在扩展页点击“重新加载”
- 资源加载失败：`manifest.json` 的 `web_accessible_resources` 必须包含 `src/i18n.js` 与 `translations/*.js`

## 版本与发布
- 建议每次修改词典或逻辑后：
  - `git commit -m "chore: update dictionary and translations"`
  - `git tag vX.Y.Z`，`git push origin --tags`

## 许可
- MIT（可按需自定义）
