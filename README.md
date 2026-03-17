# Snake Demo

一个纯静态前端的贪吃蛇小游戏，适合先本地试玩，再直接部署到公网。

## 本地运行

项目没有构建步骤，也不依赖 Node。

```powershell
cd "D:\codex\game test"
python -m http.server 8123
```

打开 <http://127.0.0.1:8123>

如果想让同一局域网下的手机访问：

```powershell
cd "D:\codex\game test"
python -m http.server 8123 --bind 0.0.0.0
```

再用 `ipconfig` 查看电脑局域网 IP，在手机浏览器打开 `http://你的电脑IP:8123`

## 操作方式

- 电脑：方向键 / `WASD`
- 暂停：空格或页面按钮
- 手机：点击方向按钮，或在画布上滑动

## 项目结构

- `index.html`：页面结构和元信息
- `styles.css`：界面样式
- `script.js`：游戏逻辑
- `site.webmanifest`：移动端安装信息
- `favicon.svg`：站点图标
- `vercel.json`：Vercel 静态部署配置
- `netlify.toml`：Netlify 静态部署配置

## 部署

### GitHub Pages

1. 新建一个 GitHub 仓库并上传这些文件。
2. 进入仓库 `Settings` -> `Pages`。
3. 在 `Build and deployment` 里选择 `Deploy from a branch`。
4. 选择你的分支，例如 `main`，目录选 `/ (root)`。
5. 保存后等待发布完成。

适合这种纯静态项目，不需要额外构建命令。

### Vercel

1. 把项目推到 GitHub。
2. 在 Vercel 中导入该仓库。
3. Framework Preset 选择 `Other` 或保持自动识别。
4. 不需要填写 Build Command。
5. Output Directory 保持默认即可。

仓库里已经带了 `vercel.json`，直接按静态站点部署就行。

### Netlify

1. 把项目推到 GitHub。
2. 在 Netlify 中选择 `Add new site` -> `Import an existing project`。
3. 选择仓库后，Build Command 留空。
4. Publish directory 填 `.`。

仓库里已经带了 `netlify.toml`。

## 后续可继续加的内容

- 首页动效和开始菜单
- 排行榜或分享成绩图
- 音效与震动反馈
- PWA 离线缓存
- 多种地图和难度模式
