# PlaneBlock WebSocket 服务

部署在阿里云轻量服务器，负责对战房间、邀请、好友请求的实时推送。

## 本地运行

```bash
cd ws-server
npm install
WS_SERVER_SECRET=your-secret node src/index.js
```

默认监听 3001 端口。

## 阿里云部署

### 1. 前置准备

- 阿里云轻量服务器（已购买）
- 域名 `ws.teotihuacan.cloud` 解析到服务器公网 IP（A 记录）

### 2. 安装依赖

```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# pm2
sudo npm install -g pm2

# Caddy（自动 HTTPS）
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

### 3. Caddy 配置

创建 `/etc/caddy/Caddyfile`：

```
ws.teotihuacan.cloud {
    reverse_proxy localhost:3001
}
```

重载：`sudo systemctl reload caddy`

### 4. 部署 ws-server

```bash
cd /path/to/PlaneBlock-V0
git pull
cd ws-server
npm install
```

创建 `.env` 或使用环境变量：

```
WS_SERVER_SECRET=与Vercel相同的密钥
PORT=3001
```

使用 pm2 启动：

```bash
WS_SERVER_SECRET=xxx pm2 start src/index.js --name ws
pm2 save
pm2 startup
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `WS_SERVER_SECRET` | 与 Vercel 共享的密钥，用于验证 token 和 webhook |
| `PORT` | 监听端口，默认 3001 |
