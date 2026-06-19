import { defineConfig } from "@iringo/arguments-builder";
import { airQuality, api, logLevel, nextHour, output, storage, weather } from "./arguments-builder-full.config";

export default defineConfig({
    output: output,
    args: [...weather, ...nextHour, ...airQuality, ...api, ...storage, ...logLevel],
});
