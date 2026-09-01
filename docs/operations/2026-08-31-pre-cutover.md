# DevOps Gold 生产切换前基线与回滚记录

- 记录日期：2026-08-31
- 公共 DNS 采集时间：2026-08-31T11:29:06.815Z
- HTTP/TLS 采集时间：2026-08-31T11:28:06Z
- 适用域名：`devops.gold`
- 状态：仅完成 Cloudflare Pages Preview 验收，尚未执行生产部署、绑定自定义域名或修改生产 DNS

> 本记录不授权生产切换。修改 `devops.gold` DNS、创建生产部署或绑定 Pages 自定义域名之前，仍须取得单独、明确的确认。

## 当前生产基线

### Apex DNS

| 类型 | 当前值 | TTL | 备注 |
| --- | --- | ---: | --- |
| A | `76.76.21.21` | 240 秒 | 当前生产回滚目标 |
| AAAA | 无 | — | 公共查询返回 `ENODATA` |
| CNAME | 无 | — | 公共查询返回 `ENODATA` |

域名服务器：

- `surina.ns.cloudflare.com`
- `thomas.ns.cloudflare.com`

当前 apex HTTP 基线：

- `https://devops.gold/` 返回 HTTP 200；
- `server: Vercel`；
- `x-powered-by: Next.js`；
- `strict-transport-security: max-age=63072000`。

### Apex TLS

- Subject：`CN=devops.gold`
- Issuer：Let's Encrypt `YR1`
- 生效时间：2026-08-22 13:13:58 UTC
- 到期时间：2026-11-20 13:13:57 UTC
- SHA-256 指纹：`37:09:01:AB:DA:EB:8E:A7:EE:AE:29:B3:DD:92:53:7D:C2:52:33:6B:01:FF:56:D9:C9:C2:6F:F7:43:0D:14:96`

### `www.devops.gold`

采集时 `www.devops.gold` 由 Cloudflare 代理地址响应：

- A：`172.67.183.83`、`104.21.18.201`
- AAAA：`2606:4700:3033::ac43:b753`、`2606:4700:3032::6815:12c9`
- TTL：约 239–240 秒

`www.devops.gold` 的目标行为尚未决定。本次生产切换和回滚都不得修改 `www`，除非另行明确批准。

## 已验收的 Cloudflare Pages Preview

- Cloudflare Pages 项目：`devops-gold`
- 项目类型：Direct Upload，当前没有 Git Provider 集成
- 生产分支配置：`main`
- Preview 分支：`feat/devops-gold-launch`
- Preview commit：`fd09aad83b3aa6217ed037c344b031753871c7c9`
- Deployment ID：`5b7a7183-c6a1-40c8-81f3-7cdb996f6300`
- 固定 Preview URL：<https://5b7a7183.devops-gold.pages.dev>
- 分支别名：<https://feat-devops-gold-launch.devops-gold.pages.dev>

当前没有为该 Pages 项目绑定自定义域名，也没有部署 `main` 生产分支。因此 `devops-gold.pages.dev` 尚无生产站点；这属于预期状态。

Preview 验收结果：

- 首页、About、博客列表、支柱文章、RSS、sitemap、Pagefind 和自定义 404 均通过在线检查；
- 两条历史 URL 均返回预期的 301；
- 草稿未进入路由、RSS、sitemap 或搜索索引；
- canonical 与 Open Graph URL 均指向 `https://devops.gold`；
- Giscus 仅加载于真实文章页；
- Playwright 在 1440 px 桌面与 390 px 移动视口完成明暗主题检查，响应均为 200，无横向溢出、页面错误或明显布局/对比度问题。

## 生产切换边界

获得单独明确确认后，生产切换仍需先决定并记录采用哪种发布方式：

1. 为 Cloudflare Pages 连接 Git 集成并由 `main` 发布；或
2. 将已验收构建以 Direct Upload 方式部署为生产版本。

随后才可创建生产部署、将 `devops.gold` 添加为 Pages 自定义域名，并执行切换后冒烟测试。不得在同一操作中顺带修改 `www.devops.gold`。

## 回滚步骤

若切换后出现不可接受的问题：

1. 停止继续发布或修改 DNS，记录失败部署 ID、时间和症状。
2. 在 Cloudflare DNS 中将 apex（`@` / `devops.gold`）恢复为：
   - 类型：`A`
   - 值：`76.76.21.21`
   - TTL：恢复为原有设置；公共观测值为 240 秒
3. 删除或禁用切换时新增且与上述 A 记录冲突的 apex 记录。不要改动 Cloudflare nameserver，也不要改动 `www.devops.gold`。
4. 如 Pages 自定义域名仍会干扰回源，在 Pages 项目中移除 `devops.gold` 自定义域名；保留项目和部署记录用于诊断。
5. 至少等待一个原 TTL，并从公共解析器验证 apex A 已恢复为 `76.76.21.21`。
6. 验证 `https://devops.gold/` 返回 HTTP 200，响应重新显示 Vercel 基线，并检查浏览器与命令行 TLS 连接正常。
7. 若公共 DNS 已恢复但服务仍异常，暂停进一步变更并检查 Vercel 项目状态；不要尝试通过修改 `www` 或 nameserver 规避问题。

回滚成功判据：

- `devops.gold A` 再次解析到 `76.76.21.21`；
- apex HTTPS 返回 200；
- HTTP 响应回到 Vercel；
- `www.devops.gold` 与 nameserver 保持不变。

## 参考快照

本记录依据切换前临时采集文件整理：

- `/tmp/devops-gold-dns-snapshot/2026-08-31-public-dns.json`
- `/tmp/devops-gold-dns-snapshot/2026-08-31-before-cutover.txt`

`/tmp` 文件不是长期存档；本文件是仓库内的持久回滚基线。
