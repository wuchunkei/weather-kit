## 3.1.3

### 🛠️ Bug Fixes
  * 回退 3.1.2 对 `weather-map2.apple.com` 地图图层请求的 `US` 强制改写，避免 Air Quality map overlay 产生 `401`。
  * 新增 WeatherKit 主请求的 request rewrite：当 `forecastNextHour` 被请求且 `[未来一小时降水强度]` 数据源不是 `WeatherKit` 时，临时将请求地区虚拟为 `US`，尝试触发 Weather App 的 next-hour precipitation 支持路径。
  * WeatherKit 响应注入阶段会读取原始地区，避免 next-hour 的地区虚拟影响天气、空气质量等数据源替换判断。

## 3.1.2

### 🛠️ Bug Fixes
  * 修复 Weather App 空气质量地图：为 `weather-map2.apple.com` 的地图图层请求加入本地 request rewrite，并将地图图层的地区 header 规范为 `US`，避免部分地区 Air Quality 图层不可用。
  * 移除 WeatherKit 响应中的 `providerLogo` 写入，避免底部 provider footer 尝试显示自定义来源图标。
  * 为 IQAir 当前空气质量请求增加单轮缓存，减少同一轮 WeatherKit 响应内重复请求导致的空结果。

### 🆕 New Features
  * 新增基于云函数的 `WeatherKit (Rewrite)` 新模块，面向 `Loon`、`Surge`、`Stash`、`Shadowrocket` 提供新的 Rewrite 版本配置。

### 🛠️ Bug Fixes
  * 修复和风天气 `YesterdayAirQuality` 在 `locationInfo` 为空时的空值访问问题，避免港澳等特殊定位条件下请求失败。
  * 修复规则拦截范围，新增 `IP-ASN 6185` 并统一 `QUIC` 拒绝表达式，减少异常直连。
  * 修复重复天气提供者设置逻辑。

### 🔣 Dependencies
  * 新增运行时依赖：`hono`、`node-fetch`、`fetch-cookie`。
  * 更新开发与基础依赖：`@rspack/cli`、`@rspack/core` 升级至 `^1.7.7`，`@nsnanocat/util` 升级至 `^2.2.3`。

### ‼️ Breaking Changes
  * none

### 🔄 Other Changes
  * 为新的 Rewrite 版本补充基于 `Hono` 的云函数转发入口，并支持通过 `Vercel` 与 `Cloudflare Workers` 部署。
  * 新增 workers 构建链路：增加 `arguments-builder.workers.config.ts` 与 `build:args:workers`，用于生成各平台代理模块产物。
  * 统一工程结构：`Hono` 入口调整为 `src/Hono.js`，请求/响应处理拆分到 `src/process/Request*.mjs` 与 `src/process/Response*.mjs`，并统一模块后缀与命名。
  * 新增并统一 workers 模板与模块命名，配置名称追加 `(Rewrite)` 后缀，提升不同版本的辨识度。
  * 更新 `wrangler` 可观测性配置，并在 `.gitignore` 中补充 `.idea` 忽略规则。
