# 发布到 Chrome 应用商店（Chrome Web Store）

## 准备工作
1. 开发者账户：在 https://chrome.google.com/webstore/devconsole 支付一次性注册费并创建项目
2. 资源要求：
   - 图标：已提供 `assets/icons/icon128.svg`（建议另备 PNG 128x128）
   - 截图：1280x800 或 640x400，2~5 张，展示“提示词/演练场”中文界面
   - 隐私政策：建议使用仓库中的 `docs/privacy.md`（需可公网访问，如 GitHub Pages）
   - 支持链接：README 或 Issues 页面

## 打包扩展
在 PowerShell 执行：
```
pwsh -File store/package.ps1
```
输出包：`dist/langfuse-zh-<version>.zip`

## 手动上传（控制台）
1. 进入开发者控制台创建/选择项目
2. 上传 `dist/langfuse-zh-<version>.zip`
3. 填写商店信息（名称、描述、截图、隐私政策、支持链接等）
4. 提交审核并发布

## 自动上传（GitHub Actions）
1. 在仓库设置 Secrets 添加：
   - `CWS_EXTENSION_ID`：扩展 ID（在开发者控制台查看）
   - `CWS_CLIENT_ID`、`CWS_CLIENT_SECRET`：Google OAuth 客户端凭据
   - `CWS_REFRESH_TOKEN`：刷新令牌（通过 OAuth 授权获取）
2. 推送 tag 或创建 Release，Action 将自动打包并上传

> 获取刷新令牌的参考：使用 `chrome-webstore-upload-cli` 或手动 OAuth 授权流程，确保作用域包含 `https://www.googleapis.com/auth/chromewebstore`。

## 审核注意事项
- 权限最小化：当前仅使用 `storage` 权限，无远程代码执行
- 翻译范围：仅替换非敏感文本节点，不修改用户输入和代码块
- 隐私声明：不收集、不上传页面内容；如启用在线翻译，密钥仅本地存储

## 版本发布建议
- 每次更新版本号（`manifest.json`）并在 Git 打 tag
- 更新 CHANGELOG 与 README 截图，提升审核通过率
