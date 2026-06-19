import { defineConfig } from "@iringo/arguments-builder";

type Arg = {
    key: string;
    type: "string" | "number" | "boolean" | "array";
    boxJsType?: "number" | "boolean" | "text" | "slider" | "textarea" | "radios" | "checkboxes" | "colorpicker" | "selects" | "modalSelects" | undefined;
    name?: string | undefined;
    description?: string | undefined;
    // biome-ignore lint/suspicious/noExplicitAny: Copy from upstream `@iringo/arguments-builder`
    defaultValue?: any;
    options?:
        | {
              key: string;
              label?: string | undefined;
          }[]
        | undefined;
    placeholder?: string | undefined;
    exclude?: ("surge" | "loon" | "boxjs" | "dts")[] | undefined;
};

export const output = {
    surge: {
        path: "./dist/iRingo.WeatherKit.sgmodule",
        transformEgern: {
            enable: true,
            path: "./dist/iRingo.WeatherKit.yaml",
        },
    },
    loon: {
        path: "./dist/iRingo.WeatherKit.plugin",
    },
    customItems: [
        {
            path: "./dist/iRingo.WeatherKit.snippet",
            template: "./template/quantumultx.handlebars",
        },
        {
            path: "./dist/iRingo.WeatherKit.stoverride",
            template: "./template/stash.handlebars",
        },
    ],
    dts: {
        isExported: true,
        path: "./src/types.d.ts",
    },
    boxjsSettings: {
        path: "./template/boxjs.settings.json",
        scope: "@iRingo.WeatherKit.Settings",
    },
};

const weatherReplace: Arg = {
    key: "Weather.Replace",
    name: "[Weather] Replacement Scope",
    defaultValue: "CN",
    type: "string",
    options: [
        { key: "CN", label: "Mainland China" },
        { key: "CN|HK|MO|TW", label: "Mainland China, Hong Kong, Macau, and Taiwan" },
        { key: ".*", label: "All Regions" },
    ],
    description: "Replace weather data only for matching regions.",
};

const weatherProvider: Arg = {
    key: "Weather.Provider",
    name: "[Weather] Data Source",
    defaultValue: "WeatherKit",
    type: "string",
    options: [
        { key: "WeatherKit", label: "WeatherKit (No replacement)" },
        { key: "OpenWeather", label: "OpenWeather" },
        { key: "QWeather", label: "QWeather" },
    ],
    description: "Use the selected provider to replace weather data.",
};

const weatherFallbackProvider: Arg = {
    key: "Weather.Fallback.Provider",
    name: "[Weather] OpenWeather Fallback",
    defaultValue: "WeatherKit",
    type: "string",
    options: [
        { key: "WeatherKit", label: "WeatherKit" },
        { key: "QWeather", label: "QWeather" },
    ],
    description: "Fallback provider used when OpenWeather weather data is unavailable or rate-limited.",
};

export const weather = [weatherReplace, weatherProvider, weatherFallbackProvider];
const weatherFull = [weatherReplace, weatherProvider, weatherFallbackProvider];

const nextHourProvider: Arg = {
    key: "NextHour.Provider",
    name: "[Next-Hour Precipitation Intensity] Data Source",
    defaultValue: "WeatherKit",
    type: "string",
    options: [
        { key: "WeatherKit", label: "WeatherKit (Do not add)" },
        { key: "OpenWeather", label: "OpenWeather" },
        { key: "QWeather", label: "QWeather" },
    ],
    description: "Use the selected provider to replace or fill next-hour precipitation intensity data.",
};

const nextHourFallbackProvider: Arg = {
    key: "NextHour.Fallback.Provider",
    name: "[Next-Hour Precipitation Intensity] OpenWeather Fallback",
    defaultValue: "WeatherKit",
    type: "string",
    options: [
        { key: "WeatherKit", label: "WeatherKit" },
        { key: "QWeather", label: "QWeather" },
    ],
    description: "Fallback provider used when OpenWeather next-hour precipitation data is unavailable or rate-limited.",
};

export const nextHour = [nextHourProvider, nextHourFallbackProvider];
const nextHourFull = [nextHourProvider, nextHourFallbackProvider];

const airQualityReplace: Arg = {
    key: "AirQuality.Replace",
    name: "[Air Quality] Replacement Scope",
    defaultValue: "CN",
    type: "string",
    options: [
        { key: "CN", label: "Mainland China" },
        { key: "CN|HK|MO|TW", label: "Mainland China, Hong Kong, Macau, and Taiwan" },
        { key: ".*", label: "All Regions" },
    ],
    description: "Replace air-quality data only for matching regions.",
};

const airQualityProvider: Arg = {
    key: "AirQuality.Provider",
    name: "[Air Quality] Data Source",
    defaultValue: "WeatherKit",
    type: "string",
    options: [
        { key: "WeatherKit", label: "WeatherKit (No replacement)" },
        { key: "IQAir", label: "IQAir" },
        { key: "QWeather", label: "QWeather" },
        { key: "WAQI", label: "WAQI" },
    ],
    description: "Use the selected provider to replace AQI. IQAir results can be supplemented by the configured fallback providers when pollutant details are missing.",
};

const airQualityFallbackProvider: Arg = {
    key: "AirQuality.Fallback.Provider",
    name: "[Air Quality] Fallback Sources",
    defaultValue: ["QWeather", "WAQI"],
    type: "array",
    options: [
        { key: "QWeather", label: "QWeather" },
        { key: "WAQI", label: "WAQI" },
    ],
    description: "Fallback order used when the primary AQI provider is unavailable or lacks pollutant concentration details.",
};

export const airQuality = [airQualityReplace, airQualityProvider, airQualityFallbackProvider];
const airQualityFull = [airQualityReplace, airQualityProvider, airQualityFallbackProvider];

export const api: Arg[] = [
    {
        key: "API.OpenWeather.URL",
        name: "[API] OpenWeather Request URL",
        defaultValue: "https://api.openweathermap.org/data/4.0/onecall",
        type: "string",
        placeholder: "https://api.openweathermap.org/data/4.0/onecall",
        description: "OpenWeather One Call API 4.0 request URL",
    },
    {
        key: "API.OpenWeather.Token",
        name: "[API] OpenWeather Token",
        defaultValue: "",
        type: "string",
        placeholder: "123456789123456789abcdefghijklmnopqrstuv",
        description: "OpenWeather API token",
    },
    {
        key: "API.QWeather.Host",
        name: "[API] QWeather Host",
        defaultValue: "devapi.qweather.com",
        type: "string",
        placeholder: "devapi.qweather.com",
        description: "Hostname used by the QWeather API",
    },
    {
        key: "API.QWeather.Token",
        name: "[API] QWeather Token",
        defaultValue: "",
        type: "string",
        placeholder: "123456789123456789abcdefghijklmnopqrstuv",
        description: "QWeather API token",
    },
    {
        key: "API.IQAir.URL",
        name: "[API] IQAir Request URL",
        defaultValue: "https://api.airvisual.com/v2/nearest_city",
        type: "string",
        placeholder: "https://api.airvisual.com/v2/nearest_city",
        description: "IQAir AirVisual API request URL",
    },
    {
        key: "API.IQAir.Token",
        name: "[API] IQAir Token",
        defaultValue: "",
        type: "string",
        placeholder: "123456789123456789abcdefghijklmnopqrstuv",
        description: "IQAir AirVisual API token",
    },
    {
        key: "API.WAQI.Token",
        name: "[API] WAQI Token",
        defaultValue: "",
        type: "string",
        placeholder: "123456789123456789abcdefghijklmnopqrstuv",
        description: "WAQI API token. Leave empty to let the script try the public nearest-station flow.",
    },
];

export const storage: Arg[] = [
    {
        key: "Storage",
        name: "[Storage] Configuration Type",
        defaultValue: "Argument",
        type: "string",
        options: [
            { key: "Argument", label: "Prefer configuration passed by $argument, such as plugin options and module arguments. Missing $argument values are provided by PersistentStore (BoxJs)." },
            { key: "PersistentStore", label: "Only use configuration from $persistentStore, such as BoxJs." },
            { key: "database", label: "Only use defaults from the author's database.mjs file. Other custom configuration will no longer take effect." },
        ],
        description: "Choose the configuration source. For legacy setups without this option, the order remains $persistentStore (BoxJs) > $argument > database.",
    },
];

export const logLevel: Arg[] = [
    {
        key: "LogLevel",
        name: "[Debug] Log Level",
        type: "string",
        defaultValue: "WARN",
        description: "Choose the script log level. Logs below the selected level will be suppressed.",
        options: [
            { key: "OFF", label: "Off" },
            { key: "ERROR", label: "Error" },
            { key: "WARN", label: "Warning" },
            { key: "INFO", label: "Info" },
            { key: "DEBUG", label: "Debug" },
            { key: "ALL", label: "All" },
        ],
    },
];

export default defineConfig({
    output,
    args: [...weatherFull, ...nextHourFull, ...airQualityFull, ...api, ...storage, ...logLevel],
});
