import { Console, fetch, Storage } from "@nsnanocat/util";
import * as flatbuffers from "flatbuffers";
import AirQuality from "../class/AirQuality.mjs";
import HKO from "../class/HKO.mjs";
import IQAir from "../class/IQAir.mjs";
import MatchEnum from "../class/MatchEnum.mjs";
import OpenWeather from "../class/OpenWeather.mjs";
import QWeather from "../class/QWeather.mjs";
import WAQI from "../class/WAQI.mjs";
import Weather from "../class/Weather.mjs";
import WeatherKit2 from "../class/WeatherKit2.mjs";
import database from "../function/database.mjs";
import parseWeatherKitURL from "../function/parseWeatherKitURL.mjs";
import patchFlatBufferRootTableField from "../function/patchFlatBufferRootTableField.mjs";
import setENV from "../function/setENV.mjs";

const ORIGINAL_COUNTRY_HEADER = "X-iRingo-Original-Country";
const ORIGINAL_STOREFRONT_HEADER = "X-iRingo-Original-Store-Front";
const AIR_QUALITY_CACHE_KEY = "iRingo.WeatherKit.RuntimeCaches";
const AIR_QUALITY_CACHE_TTL = 10 * 60 * 1000;
const AIR_QUALITY_FAILURE_CACHE_TTL = 60 * 1000;
const AIR_QUALITY_PROVIDERS = ["WeatherKit", "IQAir", "QWeather", "WAQI"];
const AIR_QUALITY_POLLUTANTS_PROVIDERS = ["Auto", "IndexProvider", ...AIR_QUALITY_PROVIDERS];
const AIR_QUALITY_POLLUTANT_CAPABLE_PROVIDERS = ["IQAir", "QWeather"];
const AIR_QUALITY_SCALE_CACHE_BUSTER_VERSION = "3171";

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
    url.pathname = url.pathname.replace(/^(\/api\/v\d+\/weather\/[^/]*?)(?:-[A-Z]{2})?(\/)/i, (_match, prefix, suffix) => `${prefix}-${country}${suffix}`);
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

function logNotificationChannelsResponse(body, headers) {
    const text = JSON.stringify(body, null, 2);
    const chunkSize = 12000;
    Console.log(`severeWeatherNotificationChannels headers: ${JSON.stringify(headers ?? {})}`);
    Console.log(`severeWeatherNotificationChannels body length: ${text.length}`);
    for (let index = 0; index < text.length; index += chunkSize) {
        Console.log(`severeWeatherNotificationChannels body[${index}-${Math.min(index + chunkSize, text.length)}]: ${text.slice(index, index + chunkSize)}`);
    }
}

function cleanAppleFetchHeaders(headers, country, storefront) {
    const cleanedHeaders = { ...(headers ?? {}) };
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
            return (getAirQualityProvider(Settings) !== "WeatherKit" || getAirQualityStandard(Settings) !== "Provider") && isAirQualityReplaceEnabled(Settings, country);
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
     * @type {{Settings: import('./types').Settings}}
     */
    const { Settings, Configs } = setENV("iRingo", "WeatherKit", database);
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
            //Console.debug(`body: ${body}`);
            break;
        case "application/x-mpegURL":
        case "application/x-mpegurl":
        case "application/vnd.apple.mpegurl":
        case "audio/mpegurl":
            //body = M3U8.parse($response.body);
            //Console.debug(`body: ${JSON.stringify(body)}`);
            //$response.body = M3U8.stringify(body);
            break;
        case "text/xml":
        case "text/html":
        case "text/plist":
        case "application/xml":
        case "application/plist":
        case "application/x-plist":
            //body = XML.parse($response.body);
            //Console.debug(`body: ${JSON.stringify(body)}`);
            //$response.body = XML.stringify(body);
            break;
        case "text/vtt":
        case "application/vtt":
            //body = VTT.parse($response.body);
            //Console.debug(`body: ${JSON.stringify(body)}`);
            //$response.body = VTT.stringify(body);
            break;
        case "text/json":
        case "application/json":
            body = JSON.parse($response.body);
            switch (url.hostname) {
                case "weatherkit.apple.com":
                    // Route by path.
                    if (/^\/api\/v1\/severeWeatherNotificationChannels\/global$/i.test(url.pathname)) {
                        logNotificationChannelsResponse(body, $response.headers);
                    } else if (/^\/api\/v[123]\/availability\//.test(url.pathname)) {
                        Console.debug(`body: ${JSON.stringify(body)}`);
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
            //Console.debug(`$response: ${JSON.stringify($response, null, 2)}`);
            let rawBody = $response.bodyBytes ? new Uint8Array($response.bodyBytes) : ($response.body ?? new Uint8Array());
            //Console.debug(`isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`);
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
                                const matchEnum = new MatchEnum(body);
                                if (Settings?.LogLevel === "DEBUG" || Settings?.LogLevel === "ALL") {
                                    await matchEnum.init();
                                }
                                const parameters = parseWeatherKitURL(url);
                                parameters.country = getHeader($request.headers, ORIGINAL_COUNTRY_HEADER) ?? parameters.country;
                                const changedDataSets = new Set();
                                const enviroments = createProviderEnviroments(parameters, Settings);

                                for (const dataSet of parameters.dataSets) {
                                    switch (dataSet) {
                                        case "airQuality": {
                                            if (Settings?.LogLevel === "DEBUG" || Settings?.LogLevel === "ALL") {
                                                matchEnum.airQuality();
                                            }
                                            if (!shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) break;
                                            body.airQuality = await InjectAirQuality(body.airQuality, Settings, enviroments);
                                            changedDataSets.add(dataSet);
                                            break;
                                        }
                                        case "currentWeather": {
                                            if (Settings?.LogLevel === "DEBUG" || Settings?.LogLevel === "ALL") {
                                                matchEnum.weatherCondition();
                                                matchEnum.pressureTrend();
                                            }
                                            if (!shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) break;
                                            body.currentWeather = await InjectCurrentWeather(body.currentWeather, Settings, enviroments);
                                            changedDataSets.add(dataSet);
                                            break;
                                        }
                                        case "forecastDaily": {
                                            if (!shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) break;
                                            body.forecastDaily = await InjectForecastDaily(body.forecastDaily, Settings, enviroments);
                                            changedDataSets.add(dataSet);
                                            break;
                                        }
                                        case "forecastHourly": {
                                            if (!shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) break;
                                            body.forecastHourly = await InjectForecastHourly(body.forecastHourly, Settings, enviroments);
                                            changedDataSets.add(dataSet);
                                            break;
                                        }
                                        case "forecastNextHour": {
                                            Console.debug(`body.forecastNextHour: ${JSON.stringify(body?.forecastNextHour, null, 2)}`);
                                            if (Settings?.LogLevel === "DEBUG" || Settings?.LogLevel === "ALL") {
                                                matchEnum.conditionType();
                                                matchEnum.forecastToken();
                                            }
                                            if (!shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) break;
                                            body.forecastNextHour = await InjectForecastNextHour(body.forecastNextHour, Settings, enviroments);
                                            changedDataSets.add(dataSet);
                                            break;
                                        }
                                        case "news": {
                                            if (Settings?.LogLevel === "DEBUG" || Settings?.LogLevel === "ALL") {
                                                matchEnum.placementType();
                                            }
                                            Console.debug(`body.news: ${JSON.stringify(body?.news, null, 2)}`);
                                            break;
                                        }
                                        case "weatherAlerts": {
                                            if (Settings?.LogLevel === "DEBUG" || Settings?.LogLevel === "ALL") {
                                                matchEnum.severity();
                                                matchEnum.significanceType();
                                                matchEnum.urgency();
                                                matchEnum.certainty();
                                                matchEnum.importanceType();
                                                matchEnum.responseType();
                                            }
                                            Console.debug(`body.weatherAlerts: ${JSON.stringify(body?.weatherAlerts, null, 2)}`);
                                            break;
                                        }
                                        case "WeatherChange": {
                                            break;
                                        }
                                        case "trendComparison": {
                                            break;
                                        }
                                        case "locationInfo": {
                                            Console.debug(`body.locationInfo: ${JSON.stringify(body?.locationInfo, null, 2)}`);
                                            break;
                                        }
                                        default:
                                            break;
                                    }
                                }
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
 * @param {import('./types').Settings} Settings - Settings object.
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
            if (!hasAvailableProviderData(newCurrentWeather)) newCurrentWeather = await FetchOpenWeatherFallback("WeatherNow", Settings?.Weather?.Fallback?.Provider, enviroments, "InjectCurrentWeather");
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
        //Console.debug(`currentWeather: ${JSON.stringify(currentWeather, null, 2)}`);
    }
    Console.info("✅ InjectCurrentWeather");
    return currentWeather;
}

/**
 * Inject daily forecast data.
 * @param {any} forecastDaily - Daily forecast object.
 * @param {import('./types').Settings} Settings - Settings object.
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
            if (!hasAvailableProviderData(newForecastDaily)) newForecastDaily = await FetchOpenWeatherFallback("Daily", Settings?.Weather?.Fallback?.Provider, enviroments, "InjectForecastDaily");
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
        //Console.debug(`forecastDaily: ${JSON.stringify(forecastDaily, null, 2)}`);
    }
    Console.info("✅ InjectForecastDaily");
    return forecastDaily;
}

/**
 * Inject hourly forecast data.
 * @param {any} forecastHourly - Hourly forecast object.
 * @param {import('./types').Settings} Settings - Settings object.
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
            if (!hasAvailableProviderData(newForecastHourly)) newForecastHourly = await FetchOpenWeatherFallback("Hourly", Settings?.Weather?.Fallback?.Provider, enviroments, "InjectForecastHourly");
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
        //Console.debug(`forecastHourly: ${JSON.stringify(forecastHourly, null, 2)}`);
    }
    Console.info("✅ InjectForecastHourly");
    return forecastHourly;
}

/**
 * Inject next-hour precipitation forecast data.
 * @param {any} forecastNextHour - Next-hour forecast object.
 * @param {import('./types').Settings} Settings - Settings object.
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
            if (!hasUsableForecastNextHour(newForecastNextHour)) newForecastNextHour = await FetchOpenWeatherFallback("Minutely", Settings?.NextHour?.Fallback?.Provider, enviroments, "InjectForecastNextHour");
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
    if (hasUsableForecastNextHour(newForecastNextHour)) {
        newForecastNextHour.metadata = { ...forecastNextHour?.metadata, ...newForecastNextHour.metadata };
        forecastNextHour = { ...forecastNextHour, ...newForecastNextHour };
        Console.debug(`forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`);
    }
    Console.info("✅ InjectForecastNextHour");
    return forecastNextHour;
}

/**
 * Inject current air-quality data using the configured provider and fallback chain.
 * @param {any} airQuality - Original WeatherKit air-quality object.
 * @param {import('./types').Settings} Settings - Settings object.
 * @param {any} enviroments - Provider instances and request context.
 * @returns {Promise<any>} Air-quality object after replacement.
 */
async function InjectAirQuality(airQuality, Settings, enviroments) {
    Console.info("☑️ InjectAirQuality");
    if (!isAirQualityReplaceEnabled(Settings, enviroments.country)) {
        Console.warn("InjectAirQuality", `Unreplaced country: ${enviroments.country}`);
        Console.info("✅ InjectAirQuality");
        return airQuality;
    }

    const provider = getAirQualityProvider(Settings);
    if (provider === "WeatherKit") {
        Console.info("✅ InjectAirQuality");
        return refreshAirQualityScaleVersion(ApplyAirQualityStandard(AirQuality.FixPollutantsUnits(airQuality), Settings));
    }

    const originalAirQuality = normalizeAirQualityData(AirQuality.FixPollutantsUnits(airQuality));
    const injectedAirQuality = withFallbackPollutants(ApplyAirQualityStandard(await FetchAirQualityWithFallback(provider, getAirQualityFallbackProviders(Settings, provider), enviroments, Settings, originalAirQuality), Settings), originalAirQuality, getAirQualityPollutantsProvider(Settings) === "Auto");
    if (!hasAvailableProviderData(injectedAirQuality)) {
        Console.warn("InjectAirQuality", "All configured air-quality providers are unavailable");
        Console.info("✅ InjectAirQuality");
        return refreshAirQualityScaleVersion(originalAirQuality);
    }

    const { providerLogo: _providerLogo, ...metadata } = {
        ...(airQuality?.metadata ?? {}),
        ...(injectedAirQuality.metadata ?? {}),
    };

    const previousDayComparison = airQuality?.previousDayComparison ?? injectedAirQuality.previousDayComparison ?? AirQuality.Config.CompareCategoryIndexes.UNKNOWN;
    const patchedAirQuality = {
        ...airQuality,
        ...injectedAirQuality,
        metadata,
        previousDayComparison,
    };

    Console.debug(`airQuality: ${JSON.stringify(patchedAirQuality, null, 2)}`);
    Console.info("✅ InjectAirQuality");
    return refreshAirQualityScaleVersion(patchedAirQuality);
}

function isWeatherReplaceEnabled(Settings, country) {
    return (Settings?.Weather?.Replace ?? []).some(rule => {
        if (!isEnabledReplaceRule(rule)) return false;
        if (rule === country) return true;
        try {
            return new RegExp(rule).test(country);
        } catch {
            return false;
        }
    });
}

function isAirQualityReplaceEnabled(Settings, country) {
    const rules = Settings?.AirQuality?.Replace?.length ? Settings.AirQuality.Replace : (Settings?.Weather?.Replace ?? []);
    return rules.some(rule => {
        if (!isEnabledReplaceRule(rule)) return false;
        if (rule === country) return true;
        try {
            return new RegExp(rule).test(country);
        } catch {
            return false;
        }
    });
}

function isEnabledReplaceRule(rule) {
    const value = `${rule ?? ""}`.trim().toLowerCase();
    return !!value && !["off", "disabled", "disable", "none", "false", "0"].includes(value);
}

function hasAvailableProviderData(data) {
    return !!(data?.metadata && !data.metadata.temporarilyUnavailable);
}

function hasUsableForecastNextHour(data) {
    if (!hasAvailableProviderData(data) || !Array.isArray(data?.minutes) || data.minutes.length === 0) return false;
    return data.minutes.some(minute => Number.isFinite(Number(minute?.startTime)) && Number.isFinite(Number(minute?.precipitationIntensity)));
}

function getValidPollutants(data) {
    const validUnits = new Set(Object.values(AirQuality.Config.Units.WeatherKit));
    return (Array.isArray(data?.pollutants) ? data.pollutants : [])
        .filter(pollutant => {
            const amount = Number(pollutant?.amount);
            return pollutant?.pollutantType && pollutant.pollutantType !== "NOT_AVAILABLE" && Number.isFinite(amount) && validUnits.has(pollutant?.units);
        })
        .map(pollutant => ({ ...pollutant, amount: Number(pollutant.amount) }));
}

function normalizeAirQualityData(data) {
    if (!data) return data;
    return { ...data, pollutants: getValidPollutants(data) };
}

function hasPollutants(data) {
    return getValidPollutants(data).length > 0;
}

function refreshAirQualityScaleVersion(airQuality) {
    const scaleName = `${airQuality?.scale ?? ""}`.split(".")[0];
    if (!["EPA_NowCast", "HJ6332012", "EU_EAQI"].includes(scaleName)) return airQuality;
    return { ...airQuality, scale: `${scaleName}.${AIR_QUALITY_SCALE_CACHE_BUSTER_VERSION}` };
}

function withFallbackPollutants(airQuality, fallbackAirQuality, enabled = true) {
    if (!enabled || !airQuality || hasPollutants(airQuality) || !hasPollutants(fallbackAirQuality)) return airQuality;

    return {
        ...airQuality,
        metadata: {
            ...airQuality.metadata,
            providerName: [airQuality.metadata?.providerName, `Pollutants: ${fallbackAirQuality.metadata?.providerName}`].filter(Boolean).join("\n"),
        },
        pollutants: getValidPollutants(fallbackAirQuality),
    };
}

function getAirQualityProviderValue(provider, fallback = "WeatherKit") {
    return AIR_QUALITY_PROVIDERS.includes(provider) ? provider : fallback;
}

function getAirQualityProvider(Settings) {
    return getAirQualityProviderValue(Settings?.AirQuality?.Provider ?? Settings?.AirQuality?.Current?.Index?.Provider, "WeatherKit");
}

function getAirQualityPollutantsProvider(Settings) {
    const provider = Settings?.AirQuality?.Pollutants?.Provider ?? Settings?.AirQuality?.Current?.Pollutants?.Provider ?? "Auto";
    return AIR_QUALITY_POLLUTANTS_PROVIDERS.includes(provider) ? provider : "Auto";
}

function getAirQualityStandard(Settings) {
    const standard = Settings?.AirQuality?.Standard ?? Settings?.AirQuality?.Scale?.Mode ?? "Provider";
    return ["Provider", "US", "CN"].includes(standard) ? standard : "Provider";
}

function getAirQualityRequestTimeout(Settings) {
    const timeout = Number.parseInt(Settings?.AirQuality?.RequestTimeout ?? 3000, 10);
    if (!Number.isFinite(timeout) || timeout <= 0) return 3000;
    return Math.min(Math.max(timeout, 500), 5000);
}

function ApplyAirQualityStandard(airQuality, Settings) {
    const standard = getAirQualityStandard(Settings);
    if (standard === "Provider") return normalizeAirQualityData(airQuality);

    const algorithm = standard === "CN" ? "WAQI_InstantCast_CN" : "WAQI_InstantCast_US";
    const label = standard === "CN" ? "China AQI (HJ 633-2012)" : "US AQI (EPA NowCast)";
    const fixedAirQuality = normalizeAirQualityData(AirQuality.FixPollutantsUnits(airQuality));

    if (!hasPollutants(fixedAirQuality)) {
        Console.warn("ApplyAirQualityStandard", `No pollutants available, keep provider AQI for ${label}`);
        return fixedAirQuality;
    }

    const calculatedAirQuality = AirQuality.Pollutants2AQI(fixedAirQuality, Settings, {
        algorithm,
        allowOverRange: false,
        forcePrimaryPollutant: true,
    });

    if (!hasAvailableProviderData(calculatedAirQuality) || !Number.isFinite(Number(calculatedAirQuality.index))) {
        Console.warn("ApplyAirQualityStandard", `Unable to recalculate AQI for ${label}`);
        return fixedAirQuality;
    }

    return {
        ...fixedAirQuality,
        ...calculatedAirQuality,
        metadata: {
            ...fixedAirQuality.metadata,
            providerName: [fixedAirQuality.metadata?.providerName, `AQI Standard: ${label}`].filter(Boolean).join("\n"),
            temporarilyUnavailable: false,
        },
        previousDayComparison: fixedAirQuality.previousDayComparison ?? AirQuality.Config.CompareCategoryIndexes.UNKNOWN,
    };
}

function getAirQualityFallbackProviders(Settings, provider) {
    const configuredProviders = Settings?.AirQuality?.Fallback?.Provider ?? (provider === "IQAir" ? ["QWeather", "WAQI"] : ["WAQI"]);
    const fallbackProviders = (Array.isArray(configuredProviders) ? configuredProviders : [configuredProviders]).filter(item => item && item !== provider && item !== "WeatherKit");
    return fallbackProviders.length ? fallbackProviders : provider === "IQAir" ? ["QWeather", "WAQI"] : ["WAQI"];
}

function uniqueProviders(providers = []) {
    return providers.filter((provider, index, array) => provider && AIR_QUALITY_PROVIDERS.includes(provider) && array.indexOf(provider) === index);
}

function formatCoordinate(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(3) : `${value ?? ""}`;
}

function getAirQualityCacheKey(provider, enviroments) {
    return [provider, enviroments.country ?? "", formatCoordinate(enviroments.latitude), formatCoordinate(enviroments.longitude)].join(":");
}

function getAirQualityCacheStore() {
    const store = Storage.getItem(AIR_QUALITY_CACHE_KEY, {});
    return store && typeof store === "object" && !Array.isArray(store) ? store : {};
}

function readCachedAirQuality(provider, enviroments) {
    const store = getAirQualityCacheStore();
    const key = getAirQualityCacheKey(provider, enviroments);
    const cached = store?.[key];
    if (!cached) return undefined;

    if (Number(cached.expiresAt) <= Date.now()) {
        delete store[key];
        Storage.setItem(AIR_QUALITY_CACHE_KEY, store);
        return undefined;
    }

    Console.info("FetchAirQualityProvider", `${provider} cache hit`);
    return cached.airQuality;
}

function writeCachedAirQuality(provider, enviroments, airQuality) {
    const store = getAirQualityCacheStore();
    const key = getAirQualityCacheKey(provider, enviroments);
    const ttl = hasAvailableProviderData(airQuality) ? AIR_QUALITY_CACHE_TTL : AIR_QUALITY_FAILURE_CACHE_TTL;
    store[key] = {
        expiresAt: Date.now() + ttl,
        airQuality,
    };
    Storage.setItem(AIR_QUALITY_CACHE_KEY, store);
}

function unavailableAirQuality(provider, enviroments, reason = "unavailable") {
    const timeStamp = (Date.now() / 1000) | 0;
    return {
        metadata: {
            expireTime: timeStamp + 60,
            language: `${enviroments.language ?? "en"}-${enviroments.country ?? "US"}`,
            latitude: enviroments.latitude,
            longitude: enviroments.longitude,
            providerName: `${provider}\n${reason}`,
            readTime: timeStamp,
            reportedTime: timeStamp,
            temporarilyUnavailable: true,
            sourceType: "STATION",
        },
        pollutants: [],
        previousDayComparison: AirQuality.Config.CompareCategoryIndexes.UNKNOWN,
    };
}

function createProviderEnviroments(parameters, Settings) {
    const enviroments = { country: parameters.country, language: parameters.language, latitude: parameters.latitude, longitude: parameters.longitude };
    const airQualityRequestTimeout = getAirQualityRequestTimeout(Settings);
    Object.defineProperties(enviroments, {
        openWeather: {
            get() {
                if (!this._openWeather) this._openWeather = new OpenWeather(parameters, Settings?.API?.OpenWeather?.Token, Settings?.API?.OpenWeather?.URL);
                return this._openWeather;
            },
        },
        qWeather: {
            get() {
                if (!this._qWeather) this._qWeather = new QWeather(parameters, Settings?.API?.QWeather?.Token, Settings?.API?.QWeather?.Host, airQualityRequestTimeout);
                return this._qWeather;
            },
        },
        waqi: {
            get() {
                if (!this._waqi) this._waqi = new WAQI(parameters, Settings?.API?.WAQI?.Token, airQualityRequestTimeout);
                return this._waqi;
            },
        },
        iqAir: {
            get() {
                if (!this._iqAir) this._iqAir = new IQAir(parameters, Settings?.API?.IQAir?.Token, Settings?.API?.IQAir?.URL, airQualityRequestTimeout);
                return this._iqAir;
            },
        },
    });
    return enviroments;
}

async function FetchProviderData(method, provider, enviroments) {
    switch (provider) {
        case "QWeather":
            return await enviroments.qWeather[method]();
        case "OpenWeather":
            return await enviroments.openWeather[method]();
        case "WeatherKit":
        default:
            return undefined;
    }
}

async function FetchAirQualityProvider(provider, enviroments, Settings) {
    if (provider === "WeatherKit") return undefined;

    const cachedAirQuality = readCachedAirQuality(provider, enviroments);
    if (cachedAirQuality) return cachedAirQuality;

    const timeout = getAirQualityRequestTimeout(Settings);
    let timer;
    try {
        const airQuality = await Promise.race([
            (async () => {
                switch (provider) {
                    case "IQAir":
                        return await enviroments.iqAir.CurrentAirQuality();
                    case "QWeather":
                        return await enviroments.qWeather.CurrentAirQuality();
                    case "WAQI":
                        return await FetchWAQIAirQuality(enviroments);
                    case "WeatherKit":
                    default:
                        return undefined;
                }
            })().catch(error => {
                Console.warn("FetchAirQualityProvider", `${provider} failed: ${error}`);
                return unavailableAirQuality(provider, enviroments, "request_failed");
            }),
            new Promise(resolve => {
                timer = setTimeout(() => {
                    Console.warn("FetchAirQualityProvider", `${provider} timed out after ${timeout}ms`);
                    resolve(unavailableAirQuality(provider, enviroments, "timeout"));
                }, timeout);
            }),
        ]);
        const normalizedAirQuality = normalizeAirQualityData(airQuality);
        writeCachedAirQuality(provider, enviroments, normalizedAirQuality);
        return normalizedAirQuality;
    } finally {
        if (timer) clearTimeout(timer);
    }
}

async function FetchAirQualityWithFallback(provider, fallbackProviders, enviroments, Settings, originalAirQuality) {
    const providers = uniqueProviders([provider, ...fallbackProviders]);
    const pollutantsProvider = getAirQualityPollutantsProvider(Settings);
    Console.info("☑️ FetchAirQualityWithFallback", `provider: ${provider}`, `fallback: ${fallbackProviders.join(",")}`, `pollutantsProvider: ${pollutantsProvider}`, `timeout: ${getAirQualityRequestTimeout(Settings)}ms`);
    const attempts = [];

    for (const currentProvider of providers) {
        const airQuality = await FetchAirQualityProvider(currentProvider, enviroments, Settings);
        attempts.push({ provider: currentProvider, airQuality });
        if (hasAvailableProviderData(airQuality) && Number.isFinite(Number(airQuality.index))) break;
        Console.warn("FetchAirQualityWithFallback", `${currentProvider} unavailable, trying next provider`);
    }

    const indexAttempt = attempts.find(({ airQuality }) => hasAvailableProviderData(airQuality) && Number.isFinite(Number(airQuality.index)));
    if (!indexAttempt) {
        Console.info("✅ FetchAirQualityWithFallback");
        return attempts.find(({ airQuality }) => airQuality?.metadata)?.airQuality;
    }

    let result = normalizeAirQualityData(indexAttempt.airQuality);
    let pollutantAttempt = hasPollutants(result) ? indexAttempt : undefined;

    if (!pollutantAttempt && pollutantsProvider === "WeatherKit" && hasPollutants(originalAirQuality)) {
        pollutantAttempt = { provider: "WeatherKit", airQuality: originalAirQuality };
    }

    if (!pollutantAttempt && !["Auto", "IndexProvider", "WeatherKit"].includes(pollutantsProvider)) {
        const airQuality = attempts.find(attempt => attempt.provider === pollutantsProvider)?.airQuality ?? (await FetchAirQualityProvider(pollutantsProvider, enviroments, Settings));
        if (hasAvailableProviderData(airQuality) && hasPollutants(airQuality)) pollutantAttempt = { provider: pollutantsProvider, airQuality };
    }

    if (!pollutantAttempt && pollutantsProvider === "Auto" && hasPollutants(originalAirQuality)) {
        pollutantAttempt = { provider: "WeatherKit", airQuality: originalAirQuality };
    }

    if (!pollutantAttempt && pollutantsProvider === "Auto") {
        for (const currentProvider of providers.filter(provider => AIR_QUALITY_POLLUTANT_CAPABLE_PROVIDERS.includes(provider) && !attempts.some(attempt => attempt.provider === provider))) {
            const airQuality = await FetchAirQualityProvider(currentProvider, enviroments, Settings);
            if (hasAvailableProviderData(airQuality) && hasPollutants(airQuality)) {
                pollutantAttempt = { provider: currentProvider, airQuality };
                break;
            }
        }
        if (!pollutantAttempt) {
            pollutantAttempt = attempts.find(({ provider, airQuality }) => AIR_QUALITY_POLLUTANT_CAPABLE_PROVIDERS.includes(provider) && hasAvailableProviderData(airQuality) && hasPollutants(airQuality));
        }
    }

    if (pollutantAttempt && pollutantAttempt.provider !== indexAttempt.provider) {
        const pollutants = getValidPollutants(pollutantAttempt.airQuality);
        result = {
            ...result,
            metadata: {
                ...result.metadata,
                providerName: [result.metadata?.providerName, `Pollutants: ${pollutantAttempt.airQuality.metadata?.providerName}`].filter(Boolean).join("\n"),
            },
            pollutants,
        };
    }

    Console.info("✅ FetchAirQualityWithFallback", `indexProvider: ${indexAttempt.provider}`, `pollutantsProvider: ${pollutantAttempt?.provider ?? indexAttempt.provider}`);
    return result;
}

async function FetchWAQIAirQuality(enviroments) {
    if (enviroments.waqi.token) return await enviroments.waqi.AQI2();

    return await enviroments.waqi.Nearest();
}

async function FetchOpenWeatherFallback(method, fallbackProvider, enviroments, context) {
    switch (fallbackProvider) {
        case "QWeather":
            Console.warn(context, "OpenWeather unavailable, fallback to QWeather");
            return await FetchProviderData(method, "QWeather", enviroments);
        case "WeatherKit":
        default:
            Console.warn(context, "OpenWeather unavailable, fallback to WeatherKit");
            return undefined;
    }
}
