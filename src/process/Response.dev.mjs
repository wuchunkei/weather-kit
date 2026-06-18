import { Console, Lodash as _, fetch } from "@nsnanocat/util";
import database from "../function/database.mjs";
import setENV from "../function/setENV.mjs";
import * as flatbuffers from "flatbuffers";
import WeatherKit2 from "../class/WeatherKit2.mjs";
import parseWeatherKitURL from "../function/parseWeatherKitURL.mjs";
import OpenWeather from "../class/OpenWeather.mjs";
import QWeather from "../class/QWeather.mjs";
import Weather from "../class/Weather.mjs";
import MatchEnum from "../class/MatchEnum.mjs";
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
            return false;
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
                    if (/^\/api\/v[123]\/availability\//.test(url.pathname)) {
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
                                const enviroments = {
                                    openWeather: new OpenWeather(parameters, Settings?.API?.OpenWeather?.Token, Settings?.API?.OpenWeather?.URL),
                                    qWeather: new QWeather(parameters, Settings?.API?.QWeather?.Token, Settings?.API?.QWeather?.Host),
                                    country: parameters.country,
                                };

                                await Promise.all(
                                    parameters.dataSets.map(async dataSet => {
                                        switch (dataSet) {
                                            case "airQuality": {
                                                if (Settings?.LogLevel === "DEBUG" || Settings?.LogLevel === "ALL") {
                                                    matchEnum.airQuality();
                                                }
                                                break;
                                            }
                                            case "currentWeather": {
                                                if (Settings?.LogLevel === "DEBUG" || Settings?.LogLevel === "ALL") {
                                                    matchEnum.weatherCondition();
                                                    matchEnum.pressureTrend();
                                                }
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
                                                Console.debug(`body.forecastNextHour: ${JSON.stringify(body?.forecastNextHour, null, 2)}`);
                                                if (Settings?.LogLevel === "DEBUG" || Settings?.LogLevel === "ALL") {
                                                    matchEnum.conditionType();
                                                    matchEnum.forecastToken();
                                                }
                                                body.forecastNextHour = await InjectForecastNextHour(body.forecastNextHour, Settings, enviroments);
                                                if (shouldPatchInjectedDataSet(dataSet, Settings, enviroments.country)) changedDataSets.add(dataSet);
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
            if (!hasAvailableProviderData(newForecastNextHour)) newForecastNextHour = await FetchOpenWeatherFallback("Minutely", Settings?.NextHour?.Fallback?.Provider, enviroments, "InjectForecastNextHour");
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
        Console.debug(`forecastNextHour: ${JSON.stringify(forecastNextHour, null, 2)}`);
    }
    Console.info("✅ InjectForecastNextHour");
    return forecastNextHour;
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

function hasAvailableProviderData(data) {
    return !!(data?.metadata && !data.metadata.temporarilyUnavailable);
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
