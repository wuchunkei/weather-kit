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

const dataSets: Arg[] = [
    {
        key: "DataSets",
        name: "[Data Sets]",
        defaultValue: ["airQuality", "currentWeather", "forecastDaily", "forecastHourly", "forecastNextHour", "locationInfo", "news", "historicalComparisons", "weatherAlerts", "weatherChanges"],
        type: "array",
        description: "Selected data sets will be included in WeatherKit requests.",
        options: [
            { key: "airQuality", label: "Air Quality" },
            { key: "currentWeather", label: "Current Weather" },
            { key: "forecastDaily", label: "Daily Forecast" },
            { key: "forecastHourly", label: "Hourly Forecast" },
            { key: "forecastNextHour", label: "Next-Hour Precipitation Intensity" },
            { key: "locationInfo", label: "Location Info" },
            { key: "news", label: "News" },
            { key: "historicalComparisons", label: "Historical Comparisons" },
            { key: "weatherAlerts", label: "Weather Alerts" },
            { key: "weatherChanges", label: "Weather Changes" },
        ],
    },
];

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

export const weather = [weatherReplace, weatherProvider];
const weatherFull = [weatherReplace, weatherProvider];

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

export const nextHour = [nextHourProvider];
const nextHourFull = [nextHourProvider];

const airQualityCurrentPollutantsProvider: Arg = {
    key: "AirQuality.Current.Pollutants.Provider",
    name: "[Current Pollutants] Data Source",
    defaultValue: "WeatherKit",
    type: "string",
    options: [
        { key: "WeatherKit", label: "WeatherKit (No replacement)" },
        { key: "WAQI", label: "WAQI" },
        { key: "IQAir", label: "IQAir" },
        { key: "QWeather", label: "QWeather" },
    ],
    description: "Use the selected provider to fill pollutant data. IQAir free plans usually return AQI only; pollutant concentrations require a matching API plan.",
};

const airQualityCurrentPollutantsUnitsReplace: Arg = {
    key: "AirQuality.Current.Pollutants.Units.Replace",
    name: "[Current Pollutants - Unit Conversion] Targets",
    defaultValue: [],
    type: "array",
    options: [
        { key: "EPA_NowCast", label: "US AQI (EPA_NowCast)" },
        { key: "EU.EAQI", label: "EU EAQI (EU.EAQI)" },
        { key: "HJ6332012", label: "China AQI (HJ6332012)" },
        { key: "UBA", label: "Germany LQI (UBA)" },
    ],
    description: "Convert pollutant units for comparison with air-quality standards. Unit conversion can introduce decimals, minor precision loss, and omitted decimal parts.",
};

const airQualityCurrentPollutantsUnitsMode: Arg = {
    key: "AirQuality.Current.Pollutants.Units.Mode",
    name: "[Current Pollutants - Unit Conversion] Mode",
    defaultValue: "Scale",
    type: "string",
    options: [
        { key: "Scale", label: "Match the air-quality standard" },
        { key: "ugm3", label: "Convert to ug/m3 unless the standard requires another unit" },
        { key: "EU_ppb", label: "Convert to EU ppb unless the standard requires another unit" },
        { key: "US_ppb", label: "Convert to US ppb unless the standard requires another unit" },
        { key: "Force_ugm3", label: "ug/m3" },
        { key: "Force_EU_ppb", label: "EU ppb" },
        { key: "Force_US_ppb", label: "US ppb" },
    ],
    description: "Target unit conversion mode for pollutants.",
};

const airQualityCurrentIndexReplace: Arg = {
    key: "AirQuality.Current.Index.Replace",
    name: "[Current AQI] Replacement Targets",
    defaultValue: ["HJ6332012"],
    type: "array",
    options: [
        { key: "HJ6332012", label: "China AQI (HJ6332012)" },
        { key: "IE.AQIH", label: "Ireland AQIH (IE.AQIH)" },
        { key: "AT.AQI", label: "Austria AQI (AT.AQI)" },
        { key: "BE.BelAQI", label: "Belgium BelAQI (BE.BelAQI)" },
        { key: "UBA", label: "Germany LQI (UBA)" },
        { key: "FR.ATMO", label: "France IQA (FR.ATMO)" },
        { key: "KR.CAI", label: "Korea CAI (KR.CAI)" },
        { key: "CA.AQHI", label: "Canada AQHI (CA.AQHI)" },
        { key: "CZ.AQI", label: "Czech AQI (CZ.AQI)" },
        { key: "NL.LKI", label: "Netherlands LKI (NL.LKI)" },
        { key: "EPA_NowCast", label: "US AQI (EPA_NowCast)" },
        { key: "ICARS", label: "Mexico ICARS (ICARS)" },
        { key: "EU.EAQI", label: "EU EAQI (EU.EAQI)" },
        { key: "CH.KBI", label: "Switzerland KBI (CH.KBI)" },
        { key: "ES.MITECO", label: "Spain ICA (ES.MITECO)" },
        { key: "SG.NEA", label: "Singapore PSI (SG.NEA)" },
        { key: "NAQI", label: "India NAQI (NAQI)" },
        { key: "DAQI", label: "UK DAQI (DAQI)" },
    ],
    description: "Replace air-quality indexes for the selected standards.",
};

const airQualityCurrentIndexProvider: Arg = {
    key: "AirQuality.Current.Index.Provider",
    name: "[Current AQI] Data Source",
    defaultValue: "WeatherKit_US",
    type: "string",
    options: [
        { key: "WeatherKit", label: "WeatherKit (No replacement)" },
        { key: "WeatherKit_US", label: "WeatherKit (US AQI)" },
        { key: "Calculate", label: "iRingo Built-in Algorithm" },
        { key: "WAQI", label: "WAQI" },
        { key: "IQAir", label: "IQAir (US EPA)" },
        { key: "QWeather", label: "QWeather (China AQI, 2012-02 edition)" },
    ],
    description: "Use the selected provider to fill and replace AQI data. WeatherKit (US AQI) uses Apple WeatherKit pollutants and converts only the AQI scale to EPA/US. Keep China AQI selected in Replacement Targets to convert CN responses.",
};

const airQualityCurrentIndexForceCNPrimaryPollutants: Arg = {
    key: "AirQuality.Current.Index.ForceCNPrimaryPollutants",
    name: "[Current AQI] Force Primary Pollutant",
    defaultValue: true,
    type: "boolean",
    description: "Ignore the HJ 633-2012 AQI > 50 rule and always use the pollutant with the highest IAQI as the primary pollutant.",
};

const airQualityCurrentFull = [airQualityCurrentPollutantsProvider, airQualityCurrentPollutantsUnitsReplace, airQualityCurrentPollutantsUnitsMode, airQualityCurrentIndexReplace, airQualityCurrentIndexProvider, airQualityCurrentIndexForceCNPrimaryPollutants];

const airQualityComparisonReplace: Arg = {
    key: "AirQuality.Comparison.ReplaceWhenCurrentChange",
    name: "[Air Quality - Yesterday Comparison] Replace on Current Change",
    defaultValue: false,
    type: "boolean",
    description: "Replace yesterday comparison data when today's AQI changes, even if comparison data already exists.",
};

const airQualityComparisonYesterdayPollutantsProvider: Arg = {
    key: "AirQuality.Comparison.Yesterday.PollutantsProvider",
    name: "[Yesterday Pollutants] Data Source",
    defaultValue: "WeatherKit",
    type: "string",
    options: [
        { key: "WeatherKit", label: "WeatherKit (No replacement)" },
        { key: "QWeather", label: "QWeather" },
    ],
    description: "Provide pollutant data for the iRingo built-in algorithm to calculate yesterday's AQI.",
};

const airQualityComparisonYesterdayIndexProvider: Arg = {
    key: "AirQuality.Comparison.Yesterday.IndexProvider",
    name: "[Yesterday AQI] Data Source",
    defaultValue: "WeatherKit",
    type: "string",
    options: [
        { key: "WeatherKit", label: "WeatherKit (No replacement)" },
        { key: "Calculate", label: "iRingo Built-in Algorithm" },
        { key: "QWeather", label: "QWeather (China AQI, 2012-02 edition)" },
    ],
    description: "Data source used to compare with today's AQI.",
};

const airQualityComparisonFull = [airQualityComparisonReplace, airQualityComparisonYesterdayPollutantsProvider, airQualityComparisonYesterdayIndexProvider];

const airQualityFull = [...airQualityCurrentFull, ...airQualityComparisonFull];
export const airQuality = [airQualityCurrentPollutantsProvider, airQualityCurrentIndexProvider, airQualityComparisonYesterdayPollutantsProvider, airQualityComparisonYesterdayIndexProvider];

const calculateAlgorithm: Arg = {
    key: "AirQuality.Calculate.Algorithm",
    name: "[iRingo Built-in Algorithm] Algorithm",
    defaultValue: "EU_EAQI",
    type: "string",
    options: [
        { key: "None", label: "No Conversion" },
        { key: "UBA", label: "Germany LQI (FB001846)" },
        { key: "EU_EAQI", label: "EU EAQI (ETC HE Report 2024/17)" },
        { key: "WAQI_InstantCast_US", label: "US InstantCast (EPA-454/B-24-002)" },
        { key: "WAQI_InstantCast_CN", label: "China InstantCast (HJ 633-2012)" },
        { key: "WAQI_InstantCast_CN_25_DRAFT", label: "China InstantCast (HJ 633 2025 Draft)" },
    ],
    description: "Use the built-in algorithm to calculate AQI locally from pollutant data. InstantCast is based on WAQI, and the US version uses WAQI's ozone standard.",
};

const calculateAllowOverRange: Arg = {
    key: "AirQuality.Calculate.AllowOverRange",
    name: "[iRingo Built-in Algorithm] Allow Over-Range Index",
    defaultValue: true,
    type: "boolean",
    description: "Allow US and China AQI indexes to exceed 500. When the value exceeds 500, the small indicator color dot may disappear.",
};

export const calculate = [calculateAlgorithm];
const calculateFull = [calculateAlgorithm, calculateAllowOverRange];

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
        key: "API.WAQI.Token",
        name: "[API] WAQI Token",
        defaultValue: "",
        type: "string",
        placeholder: "123456789123456789abcdefghijklmnopqrstuv",
        description: "WAQI API token. Filling this field automatically enables the WAQI advanced API.",
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
    args: [...dataSets, ...weatherFull, ...nextHourFull, ...airQualityFull, ...calculateFull, ...api, ...storage, ...logLevel],
});
