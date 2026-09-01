# DevOps Gold 生产切换成功记录

- 记录日期：2026-09-01
- 绑定创建时间：2026-09-01T08:56:30Z（UTC+8 16:56:30）
- 首轮全绿冒烟时间：2026-09-01T09:20:02Z
- 适用域名：`devops.gold`（仅 apex；`www.devops.gold` 全程未改动）
- 状态：切换完成并验收通过，apex 已由 Cloudflare Pages 生产部署提供服务
- 前置基线：<docs/operations/2026-08-31-pre-cutover.md>（含切换前基线与原始回滚记录）

## 执行摘要

在用户单独明确批准的范围内，将 `devops.gold` apex 绑定到 Cloudflare Pages 项目 `devops-gold` 并切换生产 DNS。绑定经 Cloudflare API 完成；因 API 路径不会自动创建 apex DNS 记录，随后手动将 apex A 记录（Vercel `76.76.21.21`）替换为指向 `devops-gold.pages.dev` 的橙云 CNAME。切换后 Pages 自定义域名验证与证书校验通过，公共解析、HTTPS、TLS 证书与新站内容全部符合预期；`www.devops.gold`、`blog.devops.gold` 及 zone 内其余记录经权威比对确认零变化。

## 执行时间线（UTC）

| 时间 | 事件 |
| --- | --- |
| 08:55:51 | 绑定前 zone 权威 DNS 快照（共 19 条记录） |
| 08:56:30 | 通过 API 创建 Pages 自定义域名绑定（仅 `devops.gold`），初始状态 `initializing` |
| 08:58:35 | 状态转为 `pending`；`verification_data` 报错 `CNAME record not set`；复查 Cloudflare 侧 apex 记录未发生任何变化 → 确认 API 绑定路径不会自动创建/替换 apex 记录 |
| 约 09:07 | 执行 apex DNS 切换：删除 A `76.76.21.21`，创建 CNAME → `devops-gold.pages.dev`（proxied） |
| 约 09:09 | Pages domain 状态 `active`（`validation_data` active/http、`verification_data` active） |
| 09:10:26 | 公共侧首轮全绿监控：HTTPS 200（`server: cloudflare`）、新证书已生效、页面标题为新站 |
| 09:15:37 | zone 权威记录复查：绑定前后 diff 与预期切换完全一致 |
| 09:17:13 | 冒烟首轮 22/25；3 项失败为切换后部分请求仍命中缓存的旧 Vercel IP 所致（单项重测全部通过，见下文） |
| 09:20:02 | 冒烟 25/25 全部通过 |
| 09:20:41 | 终态复查：domain `active`、HTTP/TLS/标题正常、`www` 与切换前基线一致 |

## 绑定详情

- 方式：Cloudflare API `POST /accounts/{account_id}/pages/projects/devops-gold/domains`，请求体 `{"name":"devops.gold"}`。
  - 选择 API 的原因：Wrangler 4.127.1 无任何 Pages 自定义域名子命令（`wrangler pages --help` 核实）；Dashboard 需人工操作；从 wrangler OAuth 提取令牌被禁止。
- account ID：`538df1e26f9b6c5b5f2bee5551c1833e`
- Pages 域名对象 ID：`16038dd5-6138-4b35-b149-0fba50167f93`（`created_on 2026-09-01T08:56:30.963355Z`）
- 域对象标注的证书颁发机构：`google`
- 所服务的生产部署：`7204a36a-872a-41e7-8005-223a3881ef52`（`main`@`4d69fad`，Direct Upload）
- 凭据：使用具备 Account→Cloudflare Pages→Edit、Zone→Zone→Read、Zone→DNS→Read/Edit 的临时 API Token（账户自有令牌，经 `GET /accounts/{account_id}/tokens/verify` 验证）；操作完成后本机令牌文件已删除，建议在 Dashboard 一并撤销。

## DNS 变更

绑定前后 zone 权威记录各 19 条，逐条比对 diff：

| 动作 | 记录 | 详情 |
| --- | --- | --- |
| 删除 | `A devops.gold 76.76.21.21` | 原 Vercel 生产回滚目标；灰云（proxied=false）、TTL Auto；原记录 ID `ffc5ec77aa21ff2e7cbbfb550dc22bf8` |
| 新增 | `CNAME devops.gold → devops-gold.pages.dev` | 橙云（proxied=true）、TTL Auto；新记录 ID `d6b8d5eb2fa3f13e7ad89a9d7d42b208` |

其余 18 条记录（`www`、`blog` 及全部子域记录、两条 `google-site-verification` TXT）逐条比对零变化。

经验记录：同一账号内经 Dashboard 添加 Pages 自定义域名时会自动创建 DNS 记录；经 API 绑定则不会，验证会停在 `CNAME record not set`，需手动删除冲突的 apex A 记录并创建指向 `<project>.pages.dev` 的 CNAME（apex 依靠 CNAME flattening，类型切换期间 A 与 CNAME 不能共存，存在短暂窗口）。

## 切换后公共观测

### Apex DNS

- 公共解析 A：`172.67.183.83`、`104.21.18.201`（Cloudflare 边缘地址，与 `www` 同族）
- AAAA：与 `www` 同族（`2606:4700:…`）
- TTL 观测约 240–300 秒

### Apex HTTP

- `https://devops.gold/` 返回 HTTP 200
- `server: cloudflare`，响应中不再出现 `x-vercel-*` 头
- 页面标题：`DevOps Gold | DevOps Gold`（新站）

### Apex TLS

- Subject：`CN=devops.gold`
- Issuer：Google Trust Services `WE1`
- 生效时间：2026-09-01 08:04:07 UTC
- 到期时间：2026-11-30 09:03:58 UTC
- SHA-256 指纹：`83:9F:CD:89:99:C7:5C:58:B8:89:2A:E7:40:FD:5E:BE:D3:A0:07:24:CB:BB:09:96:73:DF:C5:45:F3:F3:FA:58`
- 对比切换前：Let's Encrypt `YR1`，指纹 `37:09:01:AB:DA:EB:8E:A7:EE:AE:29:B3:DD:92:53:7D:C2:52:33:6B:01:FF:56:D9:C9:C2:6F:F7:43:0D:14:96`，到期 2026-11-20

## 冒烟验收

切换后冒烟 25/25 全部通过（2026-09-01T09:20:02Z，基线 `https://devops.gold`）：

- 7 条路由返回 200：`/`、`/about/`、`/blog/`、`/blog/ai-to-organizational-capability/`、`/blog/rss.xml`、`/sitemap-index.xml`、`/pagefind/pagefind.js`；
- 不存在的路由返回 404，页面品牌化且不含草稿提示；
- 草稿文章 `platform-engineering-vs-devops` 不出现在路由、博客列表、RSS 与 sitemap；
- 两条历史 URL 按预期 301（`/blog/hello-platform-engineering/` → 新文章、旧 hash 路径 → `/`）；
- canonical 与 og:url 指向 `https://devops.gold`；
- 首页标题含品牌名；
- Giscus 仅加载于真实文章页。

首轮（09:17:13Z）3 项失败的说明：`/about/` 与不存在路由返回 308、`/blog/rss.xml` 连接失败。原因判断为切换后部分请求仍解析到缓存的旧 apex A（`76.76.21.21`，Vercel）：308 为 Vercel 尾斜杠规范化行为，连接失败与本网络直连 Vercel 全球边缘的不稳定一致；三项在解析稳定后重测全部通过。同一冒烟脚本此前对 `https://devops-gold.pages.dev` 预检为 25/25，脚本本身无误。

## `www` 与其他子域未受影响

- `www.devops.gold`：A `104.21.18.201`、`172.67.183.83` 与切换前一致；HTTP 200（`server: cloudflare` + `x-vercel-*`，标题 `NotionNext BLOG`）；TLS Google Trust Services `WE1`，指纹 `65:B8:75:E4:A1:8D:3B:37:92:CF:6A:C8:BB:CA:91:98:34:58:A5:0E:5E:B8:06:F2:7E:BE:38:EE:DD:CC:6B:3E`，到期 2026-11-30 —— 与 2026-08-31 基线一致。
- `blog.devops.gold`：HTTP 200，`x-vercel-*` 头与 NotionNext 标题正常 —— 未受影响。
- zone 权威 diff 仅含上表 apex 一删一增。

## 回滚步骤（当前有效）

若切换后出现不可接受的问题：

1. 停止继续变更，记录时间与症状。
2. 删除 apex CNAME（`devops.gold` → `devops-gold.pages.dev`，橙云；当前记录 ID `d6b8d5eb2fa3f13e7ad89a9d7d42b208`）。
3. 重建 apex A 记录：
   - 类型：`A`
   - 名称：`devops.gold`
   - 内容：`76.76.21.21`
   - TTL：Auto（公共观测 240–300 秒）
   - 代理状态：灰云（proxied=false）
4. 如需彻底解除绑定，经 API `DELETE /accounts/{account_id}/pages/projects/devops-gold/domains/devops.gold` 移除自定义域名；保留项目与部署记录用于诊断。
5. 至少等待一个原 TTL（≥300 秒），并从公共解析器验证 apex A 已恢复为 `76.76.21.21`。
6. 验证 `https://devops.gold/` 返回 HTTP 200、响应回到 Vercel 基线（`server: Vercel`、`x-powered-by: Next.js`），并检查 TLS 连接正常。
7. 全程不得改动 `www.devops.gold` 与 Cloudflare nameserver。

回滚成功判据：

- `devops.gold A` 再次解析到 `76.76.21.21`；
- apex HTTPS 返回 200 且回到 Vercel；
- `www.devops.gold` 与 nameserver 保持不变。

## 参考快照

本记录依据 Gate 2 执行期间的临时采集文件整理：

- `/tmp/gate2-prebind-dns.json`（绑定前 zone 权威 19 条记录）
- `/tmp/gate2-bind-response.json`（API 绑定响应）
- `/tmp/gate2-postbind-zone.json`（切换后 zone 权威 19 条记录）
- `/tmp/gate2-www-baseline.txt`（`www` 绑定前基线）
- `/tmp/gate2-smoke.sh`、`/tmp/gate2-monitor.sh`（冒烟与监控脚本）

`/tmp` 文件不是长期存档；本文件与 2026-08-31 基线文档是仓库内的持久记录。
