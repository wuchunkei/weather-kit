import { Console, Lodash as _, Storage, fetch } from "@nsnanocat/util";
import database from "../function/database.mjs";
import setENV from "../function/setENV.mjs";
import * as flatbuffers from "flatbuffers";
import WeatherKit2 from "../class/WeatherKit2.mjs";
import parseWeatherKitURL from "../function/parseWeatherKitURL.mjs";
import OpenWeather from "../class/OpenWeather.mjs";
import QWeather from "../class/QWeather.mjs";
import WAQI from "../class/WAQI.mjs";
import IQAir from "../class/IQAir.mjs";
import Weather from "../class/Weather.mjs";
import AirQuality from "../class/AirQuality.mjs";
import patchFlatBufferRootTableField from "../function/patchFlatBufferRootTableField.mjs";
import HKO from "../class/HKO.mjs";

const ORIGINAL_COUNTRY_HEADER = "X-iRingo-Original-Country";
const ORIGINAL_STOREFRONT_HEADER = "X-iRingo-Original-Store-Front";

function getHeader(headers, name) {
    const lowerName = name.toLowerCase();
    const entry = Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === lowerName);
    return entry?.[1];
}

function setHeader(headers, name, value) {
    const key = Object.keys(headers).find(key => key.toLowerCase() === name.toLowerCase()) ?? name;
    headers[key] = value;
}

function replaceLocaleCountry(url, country) {
    url.pathname = url.pathname.replace(/^(\/api\/v\d+\/weather\/[^/]*?)(?:-[A-Z]{2})?(\/)/i, (match, prefix, suffix) => `${prefix}-${country}${suffix}`);
}

const WEATHER_ROOT_FIELD_IDS = {
    airQuality: 0,
    currentWeather: 1,
    forecastDaily: 2,
    forecastHourly: 3,
    forecastNextHour: 4,
    news: 5,
    weatherAlerts: 6,
    weatherChanges: 7,
    historicalComparisons: 8,
    locationInfo: 9,
};

function encodeDataSetRoot(dataSet, data) {
    const Builder = new flatbuffers.Builder();
    const WeatherData = WeatherKit2.encode(Builder, dataSet, data);
    Builder.finish(WeatherData);
    return Builder.asUint8Array();
}

function patchWeatherRootFields(rawBody, body, dataSets = []) {
    let patchedBody = rawBody;
    dataSets.forEach(dataSet => {
        const fieldId = WEATHER_ROOT_FIELD_IDS[dataSet];
        const data = body?.[dataSet];
        if (fieldId === undefined || !data) return;
        patchedBody = patchFlatBufferRootTableField(patchedBody, fieldId, encodeDataSetRoot(dataSet, data));
    });
    return patchedBody;
}

function asUint8Array(bytes) {
    if (bytes instanceof Uint8Array) return bytes;
    if (bytes instanceof ArrayBuffer) return new Uint8Array(bytes);
    if (ArrayBuffer.isView(bytes)) return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return new Uint8Array();
}

const DIRECT_AQI_PROVIDERS = new Set(["QWeather", "WAQI", "IQAir"]);

function hasAvailableMetadata(airQuality) {
    return !!(airQuality?.metadata && !airQuality.metadata.temporarilyUnavailable);
}

function hasPollutants(airQuality) {
    return Array.isArray(airQuality?.pollutants) && airQuality.pollutants.length > 0;
}

function hasUsableIndex(airQuality) {
    const index = Number(airQuality?.index);
    return hasAvailableMetadata(airQuality) && Number.isFinite(index) && index >= 0;
}

function isDirectAQIProvider(provider) {
    return DIRECT_AQI_PROVIDERS.has(provider);
}

function createProviderEnvironment(parameters, Settings) {
    const providers = {};

    return {
        get openWeather() {
            if (!providers.openWeather) providers.openWeather = new OpenWeather(parameters, Settings?.API?.OpenWeather?.Token, Settings?.API?.OpenWeather?.URL);
            return providers.openWeather;
        },
        get qWeather() {
            if (!providers.qWeather) providers.qWeather = new QWeather(parameters, Settings?.API?.QWeather?.Token, Settings?.API?.QWeather?.Host);
            return providers.qWeather;
        },
        get waqi() {
            if (!providers.waqi) providers.waqi = new WAQI(parameters, Settings?.API?.WAQI?.Token);
            return providers.waqi;
        },
        get iqAir() {
            if (!providers.iqAir) providers.iqAir = new IQAir(parameters, Settings?.API?.IQAir?.Token, Settings?.API?.IQAir?.URL);
            return providers.iqAir;
        },
        country: parameters.country,
    };
}

function cleanAppleFetchHeaders(headers = {}, country, storefront) {
    const cleanedHeaders = { ...headers };
    Object.keys(cleanedHeaders).forEach(key => {
        switch (key.toLowerCase()) {
            case "host":
            case "content-length":
            case "if-none-match":
            case ORIGINAL_COUNTRY_HEADER.toLowerCase():
            case ORIGINAL_STOREFRONT_HEADER.toLowerCase():
                delete cleanedHeaders[key];
                break;
            default:
                break;
        }
    });
    setHeader(cleanedHeaders, "Accept", "application/vnd.apple.flatbuffer");
    setHeader(cleanedHeaders, "GeoCountryCode", country);
    setHeader(cleanedHeaders, "geocountrycode", country);
    if (storefront) setHeader(cleanedHeaders, "X-Apple-Store-Front", storefront);
    return cleanedHeaders;
}

async function FetchAppleWeatherAlerts($request, url, country, storefront) {
    Console.info("☑️ FetchAppleWeatherAlerts", `country: ${country}`);
    try {
        const alertURL = new URL(url.toString());
        alertURL.searchParams.set("country", country);
        alertURL.searchParams.set("dataSets", "weatherAlerts");
        replaceLocaleCountry(alertURL, country);

        const response = await fetch({
            url: alertURL.toString(),
            headers: cleanAppleFetchHeaders($request.headers, country, storefront),
        });
        if (!response?.ok) throw Error(`status ${response?.status ?? response?.statusCode}`);

        const rawBody = asUint8Array(response.bodyBytes ?? response.body);
        if (!rawBody.byteLength) throw Error("empty body");

        const body = WeatherKit2.decode(new flatbuffers.ByteBuffer(rawBody), "all");
        if (!body?.weatherAlerts?.alerts?.length) return undefined;
        return body.weatherAlerts;
    } catch (error) {
        Console.warn("FetchAppleWeatherAlerts", error);
        return undefined;
    } finally {
        Console.info("✅ FetchAppleWeatherAlerts");
    }
}

async function FillLocalizedWeatherAlerts($request, url, body, parameters, Configs) {
    if (!parameters.dataSets?.includes("weatherAlerts")) return false;
    if (body?.weatherAlerts?.alerts?.length) return false;

    const originalCountry = getHeader($request.headers, ORIGINAL_COUNTRY_HEADER);
    if (!originalCountry || originalCountry === url.searchParams.get("country")) return false;

    const originalStorefront = getHeader($request.headers, ORIGINAL_STOREFRONT_HEADER) ?? Configs?.Storefront?.[originalCountry];
    const appleAlerts = await FetchAppleWeatherAlerts($request, url, originalCountry, originalStorefront);
    if (appleAlerts?.alerts?.length) {
        body.weatherAlerts = appleAlerts;
        return true;
    }

    const hkoAlerts = await new HKO({ ...parameters, country: originalCountry }).WeatherAlerts();
    if (hkoAlerts?.alerts?.length) {
        body.weatherAlerts = hkoAlerts;
        return true;
    }

    return false;
}

function shouldPatchInjectedDataSet(dataSet, Settings, country) {
    switch (dataSet) {
        case "airQuality":
            return (
                Settings?.AirQuality?.Current?.Pollutants?.Provider !== "WeatherKit" ||
                Settings?.AirQuality?.Current?.Index?.Provider !== "WeatherKit" ||
                Settings?.AirQuality?.Comparison?.ReplaceWhenCurrentChange ||
                Settings?.AirQuality?.Comparison?.Yesterday?.PollutantsProvider !== "WeatherKit" ||
                Settings?.AirQuality?.Comparison?.Yesterday?.IndexProvider !== "WeatherKit"
            );
        case "currentWeather":
        case "forecastDaily":
        case "forecastHourly":
            return Settings?.Weather?.Provider !== "WeatherKit" && isWeatherReplaceEnabled(Settings, country);
        case "forecastNextHour":
            return Settings?.NextHour?.Provider !== "WeatherKit";
        default:
            return false;
    }
}

/***************** Processing *****************/
export async function Response($request, $response) {
    // Parse the URL.
    const url = new URL($request.url);
    Console.info(`url: ${url.toJSON()}`);
    // Read path segments.
    const PATHs = url.pathname.split("/").filter(Boolean);
    Console.info(`PATHs: ${PATHs}`);
    // Parse the content type.
    const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
    Console.info(`FORMAT: ${FORMAT}`);
    /**
     * Settings.
     * @type {{Settings: import('../types').Settings}}
     */
    const { Settings, Caches, Configs } = setENV("iRingo", "WeatherKit", database);
    Console.logLevel = Settings.LogLevel;
    // Create an empty response body placeholder.
    let body = {};
    // Route by response format.
    switch (FORMAT) {
        case undefined: // Treat as a response without a body.
            break;
        case "application/x-www-form-urlencoded":
        case "text/plain":
        default:
            break;
        case "application/x-mpegURL":
        case "application/x-mpegurl":
        case "application/vnd.apple.mpegurl":
        case "audio/mpegurl":
            break;
        case "text/xml":
        case "text/html":
        case "text/plist":
        case "application/xml":
        case "application/plist":
        case "application/x-plist":
            break;
        case "text/vtt":
        case "application/vtt":
            break;
        case "text/json":
        case "application/json":
            body = JSON.parse($response.body);
            switch (url.hostname) {
                case "weatherkit.apple.com":
                    // Route by path.
                    if (/^\/api\/v[123]\/availability\//.test(url.pathname)) {
                        const version = url.pathname.match(/^\/api\/(?<version>v[123])\/availability\//)?.groups?.version;
                        body = Configs?.Availability?.[version] ?? Configs?.Availability?.v2;
                    }
                    break;
            }
            $response.body = JSON.stringify(body);
            break;
        case "application/vnd.apple.flatbuffer":
        case "application/protobuf":
        case "application/x-protobuf":
        case "application/vnd.google.protobuf":
        case "application/grpc":
        case "application/grpc+proto":
        case "application/octet-stream": {
            let rawBody = $response.bodyBytes ? new Uint8Array($response.bodyBytes) : ($response.body ?? new Uint8Array());
            switch (FORMAT) {
                case "application/vnd.apple.flatbuffer": {
                    // Decode the FlatBuffer payload.
                    const ByteBuffer = new flatbuffers.ByteBuffer(rawBody);
                    // Route by host.
                    switch (url.hostname) {
                        case "weatherkit.apple.com":
                            // Route by path.
                            if (/^\/api\/v[23]\/weather\//.test(url.pathname)) {
                                body = WeatherKit2.decode(ByteBuffer, "all");
                                const parameters = parseWeatherKitURL(url);
                                parameters.country = getHeader($request.headers, ORIGINAL_COUNTRY_HEADER) ?? parameters.country;
                                const changedDataSets = new Set();
                                const enviroments = createProviderEnvironment(parameters, Settings);

                                await Promise.all(
                                    parameters.dataSets.map(async dataSet => {
                                        switch (dataSet) {
                                            case "airQuality": {
                                                body.airQuality = await InjectAirQuality(body.airQuality, Settings, Caches, enviroments);
                                                if (shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) changedDataSets.add(dataSet);
                                                break;
                                            }
                                            case "currentWeather": {
                                                body.currentWeather = await InjectCurrentWeather(body.currentWeather, Settings, enviroments);
                                                if (shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) changedDataSets.add(dataSet);
                                                break;
                                            }
                                            case "forecastDaily": {
                                                body.forecastDaily = await InjectForecastDaily(body.forecastDaily, Settings, enviroments);
                                                if (shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) changedDataSets.add(dataSet);
                                                break;
                                            }
                                            case "forecastHourly": {
                                                body.forecastHourly = await InjectForecastHourly(body.forecastHourly, Settings, enviroments);
                                                if (shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) changedDataSets.add(dataSet);
                                                break;
                                            }
                                            case "forecastNextHour": {
                                                body.forecastNextHour = await InjectForecastNextHour(body.forecastNextHour, Settings, enviroments);
                                                if (shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) changedDataSets.add(dataSet);
                                                break;
                                            }
                                            default:
                                                break;
                                        }
                                    }),
                                );
                                if (await FillLocalizedWeatherAlerts($request, url, body, parameters, Configs)) changedDataSets.add("weatherAlerts");
                                try {
                                    rawBody = patchWeatherRootFields(rawBody, body, [...changedDataSets]);
                                } catch (error) {
                                    Console.warn("patchWeatherRootFields", error);
                                    const Builder = new flatbuffers.Builder();
                                    const WeatherData = WeatherKit2.encode(Builder, "all", body);
                                    Builder.finish(WeatherData);
                                    rawBody = Builder.asUint8Array();
                                }
                                break;
                            }
                            break;
                    }
                    break;
                }
                case "application/protobuf":
                case "application/x-protobuf":
                case "application/vnd.google.protobuf":
                    break;
                case "application/grpc":
                case "application/grpc+proto":
                    break;
                case "application/octet-stream":
                    break;
            }
            // Write binary data back.
            $response.body = rawBody;
            break;
        }
    }
    return $response;
}

/**
 * Inject current weather data.
 * @param {any} currentWeather - Current weather object.
 * @param {import('../types').Settings} Settings - Settings object.
 * @param {any} enviroments - Provider instances and request context.
 * @returns {Promise<any>} Current weather object after injection.
 */
async function InjectCurrentWeather(currentWeather, Settings, enviroments) {
    Console.info("☑️ InjectCurrentWeather");
    if (!isWeatherReplaceEnabled(Settings, enviroments.country)) {
        Console.warn("InjectCurrentWeather", `Unreplaced country: ${enviroments.country}`);
        Console.info("✅ InjectCurrentWeather");
        return currentWeather;
    }
    let newCurrentWeather;
    switch (Settings?.Weather?.Provider) {
        case "WeatherKit":
        default:
            break;
        case "OpenWeather": {
            newCurrentWeather = await enviroments.openWeather.WeatherNow();
            break;
        }
        case "QWeather": {
            newCurrentWeather = await enviroments.qWeather.WeatherNow();
            break;
        }
    }
    if (newCurrentWeather?.metadata) {
        newCurrentWeather.metadata = { ...currentWeather?.metadata, ...newCurrentWeather.metadata };
        currentWeather = { ...currentWeather, ...newCurrentWeather };
    }
    Console.info("✅ InjectCurrentWeather");
    return currentWeather;
}

/**
 * Inject daily forecast data.
 * @param {any} forecastDaily - Daily forecast object.
 * @param {import('../types').Settings} Settings - Settings object.
 * @param {any} enviroments - Provider instances and request context.
 * @returns {Promise<any>} Daily forecast object after injection.
 */
async function InjectForecastDaily(forecastDaily, Settings, enviroments) {
    Console.info("☑️ InjectForecastDaily");
    if (!isWeatherReplaceEnabled(Settings, enviroments.country)) {
        Console.warn("InjectForecastDaily", `Unreplaced country: ${enviroments.country}`);
        Console.info("✅ InjectForecastDaily");
        return forecastDaily;
    }
    let newForecastDaily;
    switch (Settings?.Weather?.Provider) {
        case "WeatherKit":
        default:
            break;
        case "OpenWeather": {
            newForecastDaily = await enviroments.openWeather.Daily();
            break;
        }
        case "QWeather": {
            newForecastDaily = await enviroments.qWeather.Daily();
            break;
        }
    }
    if (newForecastDaily?.metadata) {
        forecastDaily.metadata = { ...forecastDaily?.metadata, ...newForecastDaily.metadata };
        Weather.mergeForecast(forecastDaily?.days, newForecastDaily?.days);
    }
    Console.info("✅ InjectForecastDaily");
    return forecastDaily;
}

/**
 * Inject hourly forecast data.
 * @param {any} forecastHourly - Hourly forecast object.
 * @param {import('../types').Settings} Settings - Settings object.
 * @param {any} enviroments - Provider instances and request context.
 * @returns {Promise<any>} Hourly forecast object after injection.
 */
async function InjectForecastHourly(forecastHourly, Settings, enviroments) {
    Console.info("☑️ InjectForecastHourly");
    if (!isWeatherReplaceEnabled(Settings, enviroments.country)) {
        Console.warn("InjectForecastHourly", `Unreplaced country: ${enviroments.country}`);
        Console.info("✅ InjectForecastHourly");
        return forecastHourly;
    }
    let newForecastHourly;
    switch (Settings?.Weather?.Provider) {
        case "WeatherKit":
        default:
            break;
        case "OpenWeather": {
            newForecastHourly = await enviroments.openWeather.Hourly();
            break;
        }
        case "QWeather": {
            newForecastHourly = await enviroments.qWeather.Hourly();
            break;
        }
    }
    if (newForecastHourly?.metadata) {
        forecastHourly.metadata = { ...forecastHourly?.metadata, ...newForecastHourly.metadata };
        forecastHourly.hours = Weather.mergeForecast(forecastHourly?.hours, newForecastHourly?.hours);
    }
    Console.info("✅ InjectForecastHourly");
    return forecastHourly;
}

/**
 * Inject next-hour precipitation forecast data.
 * @param {any} forecastNextHour - Next-hour forecast object.
 * @param {import('../types').Settings} Settings - Settings object.
 * @param {any} enviroments - Provider instances and request context.
 * @returns {Promise<any>} Next-hour forecast object after injection.
 */
async function InjectForecastNextHour(forecastNextHour, Settings, enviroments) {
    Console.info("☑️ InjectForecastNextHour");

    if (forecastNextHour && Settings?.NextHour?.Provider === "WeatherKit") {
        Console.info("✅ InjectForecastNextHour");
        return forecastNextHour;
    }

    let newForecastNextHour;
    switch (Settings?.NextHour?.Provider) {
        case "WeatherKit":
            break;
        case "OpenWeather": {
            newForecastNextHour = await enviroments.openWeather.Minutely();
            break;
        }
        case "QWeather": {
            newForecastNextHour = await enviroments.qWeather.Minutely();
            break;
        }
        default: {
            break;
        }
    }
    if (newForecastNextHour?.metadata) {
        newForecastNextHour.metadata = { ...forecastNextHour?.metadata, ...newForecastNextHour.metadata };
        forecastNextHour = { ...forecastNextHour, ...newForecastNextHour };
    }
    Console.info("✅ InjectForecastNextHour");
    return forecastNextHour;
}

/**
 * Inject and merge air-quality data, including pollutants, indexes, and yesterday comparison.
 * @param {any} airQuality - Original WeatherKit air-quality object.
 * @param {import('../types').Settings} Settings - Settings object.
 * @param {any} Caches - Cache object.
 * @param {any} enviroments - Provider instances and request context.
 * @returns {Promise<any>} Merged air-quality object.
 */
async function InjectAirQuality(airQuality, Settings, Caches, enviroments) {
    // Step 1. Normalize pollutant units.
    airQuality = AirQuality.FixPollutantsUnits(airQuality);

    // Step 2. Check whether original pollutants are empty and inject them if needed.
    const isPollutantEmpty = !Array.isArray(airQuality?.pollutants) || airQuality.pollutants.length === 0;
    const pollutantProvider = Settings?.AirQuality?.Current?.Pollutants?.Provider ?? "QWeather";
    const injectedPollutants = isPollutantEmpty ? await InjectPollutants(airQuality, Settings, enviroments) : airQuality;
    const needPollutants = pollutantProvider !== "WeatherKit" && isPollutantEmpty && hasAvailableMetadata(injectedPollutants) && hasPollutants(injectedPollutants);

    // Step 3. Decide whether to inject AQI indexes according to pollutant availability and replacement settings.
    const indexProvider = Settings?.AirQuality?.Current?.Index?.Provider ?? "Calculate";
    const indexSource = injectedPollutants ?? airQuality;
    const isIndexUnavailable = airQuality?.metadata?.temporarilyUnavailable || !Number.isFinite(Number(airQuality?.index)) || Number(airQuality?.index) < 0;
    const replacementTargets = Settings?.AirQuality?.Current?.Index?.Replace ?? [];
    const currentScaleName = airQuality?.scale ? AirQuality.GetNameFromScale(airQuality.scale) : undefined;
    const isReplacementTarget = currentScaleName ? replacementTargets.includes(currentScaleName) : false;
    const needInjectIndex = indexProvider !== "WeatherKit" && (isDirectAQIProvider(indexProvider) || needPollutants || isIndexUnavailable || isReplacementTarget);
    const injectedIndex = needInjectIndex ? await InjectIndex(indexSource, Settings, enviroments) : indexSource;
    const isIndexInjected = needInjectIndex && hasUsableIndex(injectedIndex);

    // Step 4. Decide whether yesterday comparison should be recalculated, and inject it when unknown.
    const weatherKitComparison = airQuality?.previousDayComparison ?? AirQuality.Config.CompareCategoryIndexes.UNKNOWN;
    const previousDayComparison = isIndexInjected && Settings?.AirQuality?.Comparison?.ReplaceWhenCurrentChange ? AirQuality.Config.CompareCategoryIndexes.UNKNOWN : weatherKitComparison;
    const needInjectComparison = previousDayComparison === AirQuality.Config.CompareCategoryIndexes.UNKNOWN;
    const currentIndexProvider = isIndexInjected ? Settings?.AirQuality?.Current?.Index?.Provider : "WeatherKit";
    const injectedComparison = needInjectComparison ? await InjectComparison(isIndexInjected ? injectedIndex : airQuality, currentIndexProvider, Settings, Caches, enviroments) : { ...(isIndexInjected ? injectedIndex : airQuality), previousDayComparison: weatherKitComparison };

    // Step 5. Collect metadata from each stage and build the final providerName display text.
    const weatherKitMetadata = airQuality?.metadata;
    const pollutantMetadata = injectedPollutants?.metadata;
    const indexMetadata = injectedIndex?.metadata;
    const comparisonMetadata = injectedComparison?.metadata;
    const providers = [
        ...(weatherKitMetadata?.providerName && !weatherKitMetadata.temporarilyUnavailable ? [weatherKitMetadata.providerName] : []),
        ...(needPollutants && pollutantMetadata?.providerName && !pollutantMetadata.temporarilyUnavailable ? [`Pollutants: ${pollutantMetadata.providerName}`] : []),
        ...(isIndexInjected && indexMetadata?.providerName && !indexMetadata.temporarilyUnavailable ? [`Index: ${AirQuality.appendScaleToProviderName(injectedIndex, Settings)}`] : []),
        ...(needInjectComparison && comparisonMetadata?.providerName && !comparisonMetadata.temporarilyUnavailable ? [`Yesterday Comparison:\n${comparisonMetadata.providerName}`] : []),
    ];

    // Step 6. Merge metadata and remove providerLogo to prevent Weather from trying to render custom footer icons.
    const { providerLogo, ...metadata } = {
        ...(airQuality?.metadata ?? {}),
        ...(needPollutants && hasAvailableMetadata(injectedPollutants) ? injectedPollutants.metadata : {}),
        ...(isIndexInjected && hasAvailableMetadata(injectedIndex) ? injectedIndex.metadata : {}),
    };

    // Step 7. Merge output, prefer available injected results, and normalize metadata / pollutants / previousDayComparison.
    airQuality = {
        ...airQuality,
        ...(isIndexInjected ? injectedIndex : {}),
        metadata: {
            ...metadata,
            providerName: providers.join("\n") || metadata.providerName,
        },
        pollutants: AirQuality.ConvertPollutants(airQuality, injectedPollutants, isIndexInjected, injectedIndex, Settings) ?? [],
        previousDayComparison: injectedComparison?.previousDayComparison ?? AirQuality.Config.CompareCategoryIndexes.UNKNOWN,
    };
    Console.debug(`airQuality: ${JSON.stringify(airQuality, null, 2)}`);
    return airQuality;
}

async function InjectPollutants(airQuality, Settings, enviroments) {
    Console.info("☑️ InjectPollutants");

    switch (Settings?.AirQuality?.Current?.Pollutants?.Provider) {
        case "WeatherKit": {
            Console.info("✅ InjectPollutants");
            return airQuality;
        }
        case "WAQI": {
            const currentAirQuality = await FetchWAQIAirQuality(Settings, enviroments);
            Console.info("✅ InjectPollutants");
            return currentAirQuality;
        }
        case "IQAir": {
            const currentAirQuality = await enviroments.iqAir.CurrentAirQuality();
            Console.info("✅ InjectPollutants");
            return currentAirQuality;
        }
        case "QWeather": {
            const currentAirQuality = await enviroments.qWeather.CurrentAirQuality();
            Console.info("✅ InjectPollutants");
            return currentAirQuality;
        }
        default: {
            Console.info("✅ InjectPollutants");
            return airQuality;
        }
    }
}

function isWeatherReplaceEnabled(Settings, country) {
    return (Settings?.Weather?.Replace ?? []).some(rule => {
        if (!rule) return false;
        if (rule === country) return true;
        try {
            return new RegExp(rule).test(country);
        } catch {
            return false;
        }
    });
}

async function FetchWAQIAirQuality(Settings, enviroments) {
    if (Settings?.API?.WAQI?.Token) return await enviroments.waqi.AQI2();

    const Nearest = await enviroments.waqi.Nearest();
    const Token = await enviroments.waqi.Token(Nearest?.metadata?.stationId);
    const aqi = await enviroments.waqi.AQI(Nearest?.metadata?.stationId, Token);

    return {
        metadata: { ...Nearest?.metadata, ...aqi?.metadata },
        ...Nearest,
        ...aqi,
    };
}

/**
 * Inject air-quality index data.
 * @param {any} airQuality - Air-quality object.
 * @param {import('../types').Settings} Settings - Settings object.
 * @param {any} enviroments - Provider instances and request context.
 * @returns {Promise<any>} Air-quality object after injection.
 */
async function InjectIndex(airQuality, Settings, enviroments) {
    Console.info("☑️ InjectIndex");

    switch (Settings?.AirQuality?.Current?.Index?.Provider) {
        case "WeatherKit": {
            Console.info("✅ InjectIndex");
            return airQuality;
        }
        case "QWeather": {
            const currentAirQuality = await enviroments.qWeather.CurrentAirQuality(Settings.AirQuality.Current.Index.ForceCNPrimaryPollutants);
            Console.info("✅ InjectIndex");
            return currentAirQuality;
        }
        case "WAQI": {
            const currentAirQuality = await FetchWAQIAirQuality(Settings, enviroments);
            Console.info("✅ InjectIndex");
            return currentAirQuality;
        }
        case "IQAir": {
            const currentAirQuality = await enviroments.iqAir.CurrentAirQuality();
            Console.info("✅ InjectIndex");
            return currentAirQuality;
        }
        case "Calculate": {
            if (!Array.isArray(airQuality?.pollutants) || airQuality.pollutants.length === 0) {
                if (hasUsableIndex(airQuality)) {
                    Console.warn("InjectIndex", "No pollutants available for Calculate, use provider AQI index");
                    Console.info("✅ InjectIndex");
                    return airQuality;
                }
                Console.warn("InjectIndex", "No pollutants available for Calculate, keep current air quality");
                Console.info("✅ InjectIndex");
                return airQuality;
            }
            const currentAirQuality = AirQuality.Pollutants2AQI(airQuality, Settings);
            Console.info("✅ InjectIndex");
            return currentAirQuality;
        }
        default: {
            Console.info("✅ InjectIndex");
            return airQuality;
        }
    }
}

async function InjectComparison(airQuality, currentIndexProvider, Settings, Caches, enviroments) {
    Console.info("☑️ InjectComparison");

    const { UNKNOWN } = AirQuality.Config.CompareCategoryIndexes;
    const unavailableComparison = providerName => {
        Console.info("✅ InjectComparison");
        return { metadata: { providerName, temporarilyUnavailable: true }, previousDayComparison: UNKNOWN };
    };

    /**
     * HJ 633—2012
     * Ambient Air Quality Index (AQI) Technical Regulation (Trial), Ministry of Ecology and Environment of China.
     * @link https://www.mee.gov.cn/ywgz/fgbz/bz/bzwb/jcffbz/201203/t20120302_224166.shtml
     */
    const isHJ6332012 = (currentIndexProvider, currentScale, Settings) => {
        Console.info("☑️ isHJ6332012", `currentIndexProvider: ${currentIndexProvider}`);

        switch (currentIndexProvider) {
            case "Calculate": {
                Console.debug(`Settings?.AirQuality?.Calculate?.Algorithm: ${Settings?.AirQuality?.Calculate?.Algorithm}`);
                const result = Settings?.AirQuality?.Calculate?.Algorithm === "WAQI_InstantCast_CN";
                Console.info("✅ isHJ6332012", result);
                return result;
            }
            case "QWeather": {
                Console.info("✅ isHJ6332012", true);
                return true;
            }
            case "WeatherKit": {
                const result = AirQuality.GetNameFromScale(currentScale) === AirQuality.Config.Scales.HJ6332012.weatherKitScale.name;
                Console.info("✅ isHJ6332012", result);
                return result;
            }
            default: {
                Console.info("✅ isHJ6332012", false);
                return false;
            }
        }
    };
    const qweatherComparison = async (currentCategoryIndex, pollutantsToAirQuality) => {
        Console.info("☑️ qweatherComparison", `currentCategoryIndex: ${currentCategoryIndex}`);
        const setQWeatherCache = qweatherCache => {
            Caches.qweather = qweatherCache;
            Storage.setItem("@iRingo.WeatherKit.Caches", { ...Caches, qweather: qweatherCache });
        };

        const locationsGrid = await QWeather.GetLocationsGrid(Caches?.qweather, setQWeatherCache);
        const { latitude, longitude } = enviroments.qWeather;
        const locationInfo = QWeather.GetLocationInfo(locationsGrid, latitude, longitude);

        const yesterdayQWeather = await enviroments.qWeather.YesterdayAirQuality(locationInfo);

        const getMetadata = (indexProvider, temporarilyUnavailable = false) => ({
            ...yesterdayQWeather.metadata,
            providerName: `Pollutants: QWeather, Index: ${indexProvider}`,
            temporarilyUnavailable,
        });

        if (!yesterdayQWeather.metadata.temporarilyUnavailable) {
            const airQualityFromPollutants = pollutantsToAirQuality(yesterdayQWeather);
            const yesterdayAirQuality = pollutantsToAirQuality
                ? {
                      ...airQualityFromPollutants,
                      metadata: {
                          ...airQualityFromPollutants.metadata,
                          providerName: AirQuality.appendScaleToProviderName(airQualityFromPollutants, Settings),
                      },
                  }
                : {
                      ...yesterdayQWeather,
                      metadata: {
                          ...yesterdayQWeather.metadata,
                          providerName: AirQuality.appendScaleToProviderName(yesterdayQWeather),
                      },
                  };

            if (currentCategoryIndex) {
                const comparisonAirQuality = {
                    ...yesterdayQWeather,
                    metadata: getMetadata(yesterdayAirQuality.metadata.providerName, false),
                    previousDayComparison: AirQuality.CompareCategoryIndexes(currentCategoryIndex, yesterdayAirQuality.categoryIndex),
                };
                Console.info("✅ qweatherComparison");
                return comparisonAirQuality;
            } else {
                const qweatherCurrent = await enviroments.qWeather.CurrentAirQuality(locationInfo);
                if (!qweatherCurrent.metadata.temporarilyUnavailable) {
                    Console.debug(`qweatherCurrent?.index: ${qweatherCurrent?.index}`);

                    const comparisonAirQuality = {
                        ...yesterdayQWeather,
                        metadata: getMetadata(yesterdayAirQuality.metadata.providerName, false),
                        previousDayComparison: AirQuality.CompareCategoryIndexes(qweatherCurrent.categoryIndex, yesterdayAirQuality.categoryIndex),
                    };
                    Console.info("✅ qweatherComparison");
                    return comparisonAirQuality;
                }
            }
        }

        Console.error("qweatherComparison", `Unable to fetch ${yesterdayQWeather.metadata.temporarilyUnavailable ? "yesterday" : "current"} air-quality data from QWeather`);
        return {
            ...yesterdayQWeather,
            metadata: getMetadata(yesterdayQWeather.metadata.providerName, true),
            previousDayComparison: UNKNOWN,
        };
    };

    switch (Settings?.AirQuality?.Comparison?.Yesterday?.IndexProvider) {
        case "Calculate": {
            const algorithm = AirQuality.chooseAlogrithm(airQuality, Settings);
            const PollutantsProvider = Settings?.AirQuality?.Comparison?.Yesterday?.PollutantsProvider;
            Console.debug(`Settings?.AirQuality?.Comparison?.Yesterday?.PollutantsProvider: ${PollutantsProvider}`);

            if (algorithm !== "") {
                switch (PollutantsProvider) {
                    case "QWeather": {
                        const pollutantsToAirQuality = airQuality => AirQuality.Pollutants2AQI(airQuality, Settings, { algorithm });
                        const comparisonAirQuality = await qweatherComparison(airQuality?.categoryIndex, pollutantsToAirQuality);
                        Console.info("✅ InjectComparison");
                        return comparisonAirQuality;
                    }
                    case "WeatherKit":
                    default:
                        return unavailableComparison(PollutantsProvider || "iRingo");
                }
            }

            Console.error("InjectComparison", "Unsupported current air-quality standard");
            return { metadata: { providerName: "iRingo", temporarilyUnavailable: true }, previousDayComparison: UNKNOWN };
        }
        case "QWeather": {
            const comparisonAirQuality = await qweatherComparison(isHJ6332012(currentIndexProvider, airQuality?.scale, Settings) ? airQuality?.categoryIndex : undefined);
            Console.info("✅ InjectComparison");
            return comparisonAirQuality;
        }
        case "WeatherKit":
            return unavailableComparison("WeatherKit");
        default: {
            Console.error("InjectComparison", "Unsupported yesterday AQI data source");
            return unavailableComparison("iRingo");
        }
    }
}
