# ChatGPT iOS UI Clone

这是一个基于 React 和 TypeScript 构建的 ChatGPT 网页版客户端，旨在 1:1 还原 iOS 16 Pro 上的 ChatGPT 官方应用体验。

![Preview](./preview.png)

## ✨ 功能特性

*   **Pixel-Perfect UI**: 完美复刻 iOS 移动端界面细节，包括毛玻璃效果、触感反馈动画和排版。
*   **分支对话 (Branching)**: 支持像官方网页版一样修改历史消息，并生成新的对话分支，可通过 `< 1/2 >` 按钮在不同分支间切换。
*   **流式响应**: 完整的打字机效果，支持停止生成。
*   **PWA 支持**: 针对移动端优化，支持添加到主屏幕（Add to Home Screen），移除浏览器地址栏，提供原生 App 般的沉浸体验。
*   **智能长文本处理**: 内置滑动窗口上下文管理，支持长对话自动摘要（Auto-Summary），节省 Token 并保持长期记忆。
*   **数据导入/导出**: 支持导出对话为 HTML 格式，或导入之前的对话记录。
*   **自定义配置**: 支持配置 OpenAI API Base URL、Key、模型（如 GPT-4o）、温度系数等。
*   **移动端适配**: 完美适配虚拟键盘弹出（Viewport 自动调整），支持触摸手势。

## 🛠️ 本地开发部署

确保您的电脑已安装 [Node.js](https://nodejs.org/) (推荐 v18+)。

1.  **安装依赖**
    ```bash
    npm install
    ```

2.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    启动后，访问终端显示的地址（如 `http://localhost:5173`）。
    *提示：如果您的手机和电脑在同一 WiFi 下，可以直接访问 `http://<电脑IP>:5173` 在手机上测试。*

3.  **构建生产版本**
    ```bash
    npm run build
    ```
    构建产物位于 `dist` 目录。

---

## 🚀 部署教程

### 方案一：部署到 Vercel (最简单，推荐)

无需服务器，完全免费，自带 HTTPS 域名。

1.  将本项目代码上传到您的 **GitHub** 仓库。
2.  访问 [Vercel.com](https://vercel.com) 并登录。
3.  点击 **"Add New..."** -> **"Project"**。
4.  选择刚刚上传的 GitHub 仓库，点击 **Import**。
5.  在配置页面，Framework Preset 选择 `Vite`（通常会自动识别）。
6.  点击 **Deploy**。
7.  等待约 1 分钟，部署完成后，Vercel 会提供一个访问域名（如 `your-project.vercel.app`）。

### 方案二：VPS + 域名部署 (进阶)

适用于拥有自己服务器（如 AWS, 阿里云, DigitalOcean）和域名的用户。

**前置条件**：
*   一台 Linux 服务器（Ubuntu/CentOS）。
*   已安装 Nginx。
*   一个域名并解析到服务器 IP。

**步骤**：

1.  **在本地构建项目**：
    ```bash
    npm run build
    ```
    这将生成 `dist` 文件夹。

2.  **上传文件**：
    将 `dist` 文件夹内的所有文件上传到服务器的 `/var/www/chatgpt` 目录（需自行创建）。

3.  **配置 Nginx**：
    编辑 Nginx 配置文件（通常在 `/etc/nginx/sites-available/chatgpt`）：

    ```nginx
    server {
        listen 80;
        server_name your-domain.com; # 替换为你的域名

        root /var/www/chatgpt;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

4.  **启用配置并重启 Nginx**：
    ```bash
    ln -s /etc/nginx/sites-available/chatgpt /etc/nginx/sites-enabled/
    nginx -t
    systemctl restart nginx
    ```

5.  **配置 SSL (HTTPS)**：
    使用 Certbot 免费申请证书（iOS PWA 功能强制要求 HTTPS）：
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## 📱 如何在手机上使用

为了获得最佳的“原生 App”体验：

### iOS (iPhone)
1.  打开 **Safari** 浏览器。
2.  访问您的部署域名（如 `https://your-domain.com`）。
3.  点击底部中间的 **分享按钮** (Share Icon)。
4.  向下滑动，选择 **"添加到主屏幕" (Add to Home Screen)**。
5.  点击右上角的 **"添加"**。
6.  现在桌面会出现一个图标，点击它，应用将以全屏模式运行，无浏览器地址栏。

### Android
1.  打开 **Chrome** 浏览器。
2.  访问您的部署域名。
3.  点击右上角的 **三个点** 菜单。
4.  选择 **"添加到主屏幕"** 或 **"安装应用"**。
```