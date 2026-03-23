# PageMe — AI Personal Website Builder

> Just talk. AI distills your experience into a beautiful personal website.

## 本地运行

```bash
npm install
npm start
```

浏览器打开 http://localhost:3000

## 部署到 Vercel

### 方式一：GitHub + Vercel 自动部署（推荐）

1. 把这个文件夹推送到 GitHub 仓库
2. 登录 vercel.com，点 "Add New Project"
3. 选择你的 GitHub 仓库，Vercel 自动识别配置
4. 点 Deploy，等待 1-2 分钟
5. 绑定你的自定义域名

### 方式二：Vercel CLI 一键部署

```bash
npm install -g vercel
vercel
```

按提示操作，3步上线。

## 项目结构

```
pageme/
├── public/
│   └── index.html
├── src/
│   ├── index.js      # 入口
│   └── App.jsx       # 主应用（全部逻辑在这里）
├── package.json
├── vercel.json
└── .gitignore
```

## 注意事项

- AI 对话调用的是 Anthropic API，已内置在 Claude.ai 环境中
- 独立部署时需要在 Vercel 环境变量中配置 `REACT_APP_ANTHROPIC_KEY`
- 参考 `src/App.jsx` 中的 `callClaude` 函数，添加 API Key 头部

## License

MIT
