## 3.1.6

### 🛠️ Bug Fixes
  * Rebuilt from 3.1.5 and kept WeatherKit as the default air-quality data source.
  * Added a `WeatherKit (US AQI)` current AQI provider that converts Apple WeatherKit pollutant data to the US EPA AQI scale without calling WAQI, IQAir, QWeather, or OpenWeather.
  * Kept the replacement trigger on China AQI (`HJ6332012`) so China WeatherKit AQI responses are recalculated and emitted as US AQI (`EPA_NowCast`).

## 3.1.5

### 🔄 Other Changes
  * Removed explicit AI-assistant attribution comments from source files.
  * Translated plugin UI fields, generated TypeScript settings documentation, comments, provider display labels, module metadata, and developer-facing log messages to English where practical.
  * Kept compatibility-only Chinese provider and weather-condition matches by converting them to Unicode escape sequences, preserving behavior while keeping source files readable for English-speaking developers.

## 3.1.3

### 🛠️ Bug Fixes
  * Reverted the 3.1.2 forced `US` rewrite for `weather-map2.apple.com` map tile requests to avoid `401` responses for the Air Quality map overlay.
  * Added WeatherKit main request rewriting: when `forecastNextHour` is requested and the `[Next-Hour Precipitation Intensity]` provider is not `WeatherKit`, the request country is temporarily virtualized as `US` to try to trigger the Weather app's next-hour precipitation path.
  * The WeatherKit response injection stage now reads the original country so next-hour country virtualization does not affect weather or air-quality replacement decisions.
  * Extended next-hour `US` virtualization to WeatherKit availability requests, and also rewrites `GeoCountryCode`, locale country, and Apple StoreFront to improve the chance of showing the next-hour module on the Weather app home screen.
  * Fixed availability responses to return the correct data sets by API version: `v1` uses `minuteForecast`, while `v2/v3` use `forecastNextHour`.

## 3.1.2

### 🛠️ Bug Fixes
  * Fixed Weather app Air Quality map handling by adding a local request rewrite for `weather-map2.apple.com` map tile requests and normalizing the map tile region header to `US`, avoiding unavailable Air Quality layers in some regions.
  * Removed `providerLogo` injection from WeatherKit responses to prevent the footer provider area from trying to display custom source icons.
  * Added per-response caching for IQAir current air-quality requests to reduce empty results caused by repeated requests in the same WeatherKit response cycle.

### 🆕 New Features
  * Added a new cloud-function-based `WeatherKit (Rewrite)` module, with rewrite configurations for `Loon`, `Surge`, `Stash`, and `Shadowrocket`.

### 🛠️ Bug Fixes
  * Fixed a null access issue in QWeather `YesterdayAirQuality` when `locationInfo` is empty, preventing failures in special location cases such as Hong Kong and Macau.
  * Fixed the rule interception scope, added `IP-ASN 6185`, and unified `QUIC` rejection expressions to reduce unexpected direct connections.
  * Fixed duplicate weather provider settings logic.

### 🔣 Dependencies
  * Added runtime dependencies: `hono`, `node-fetch`, and `fetch-cookie`.
  * Updated development and base dependencies: `@rspack/cli` and `@rspack/core` to `^1.7.7`, and `@nsnanocat/util` to `^2.2.3`.

### ‼️ Breaking Changes
  * none

### 🔄 Other Changes
  * Added a `Hono`-based cloud-function forwarding entry for the new Rewrite version, with deployment support for `Vercel` and `Cloudflare Workers`.
  * Added a workers build pipeline with `arguments-builder.workers.config.ts` and `build:args:workers` to generate proxy module artifacts for each platform.
  * Unified project structure: moved the `Hono` entry to `src/Hono.js`, split request/response handling into `src/process/Request*.mjs` and `src/process/Response*.mjs`, and normalized module suffixes and naming.
  * Added and unified workers templates and module naming, with the `(Rewrite)` suffix to improve version distinction.
  * Updated `wrangler` observability configuration and added `.idea` to `.gitignore`.
