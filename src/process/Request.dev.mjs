import { Console, Lodash as _, Storage } from "@nsnanocat/util";
import database from "../function/database.mjs";
import setENV from "../function/setENV.mjs";

const ORIGINAL_COUNTRY_HEADER = "X-iRingo-Original-Country";
const VIRTUAL_COUNTRY = "US";
const VIRTUAL_STOREFRONT = "143441";

function getCountryFromPath(url) {
    const locale = url.pathname.match(/^\/api\/v\d+\/(?:availability|weather)\/(?<locale>[^/]+)\//i)?.groups?.locale;
    return locale?.match(/(?:^|-)(?<country>[A-Z]{2})$/)?.groups?.country;
}

function getRequestCountry($request, url) {
    return url.searchParams.get("country") || $request.headers?.GeoCountryCode || $request.headers?.geocountrycode || getCountryFromPath(url);
}

function setHeader(headers, name, value) {
    const key = Object.keys(headers).find(key => key.toLowerCase() === name.toLowerCase()) ?? name;
    headers[key] = value;
}

function replaceLocaleCountry(url, country) {
    url.pathname = url.pathname.replace(/^(\/api\/v\d+\/(?:availability|weather)\/[^/]*?)(?:-[A-Z]{2})?(\/)/i, (match, prefix, suffix) => `${prefix}-${country}${suffix}`);
}

function ApplyVirtualCountry($request, url) {
    const originalCountry = getRequestCountry($request, url);
    if (!originalCountry || originalCountry === VIRTUAL_COUNTRY) return;

    const headers = ($request.headers ??= {});
    setHeader(headers, ORIGINAL_COUNTRY_HEADER, originalCountry);
    setHeader(headers, "GeoCountryCode", VIRTUAL_COUNTRY);
    setHeader(headers, "geocountrycode", VIRTUAL_COUNTRY);

    const storefrontKey = Object.keys(headers).find(key => key.toLowerCase() === "x-apple-store-front");
    if (storefrontKey) headers[storefrontKey] = String(headers[storefrontKey]).replace(/^\d+/, VIRTUAL_STOREFRONT);
    else setHeader(headers, "X-Apple-Store-Front", VIRTUAL_STOREFRONT);

    url.searchParams.set("country", VIRTUAL_COUNTRY);
    replaceLocaleCountry(url, VIRTUAL_COUNTRY);
}

function ApplyAvailabilityVirtualCountry($request, url, Settings) {
    if (Settings?.NextHour?.Provider === "WeatherKit") return;

    ApplyVirtualCountry($request, url);
}

function ApplyNextHourVirtualCountry($request, url, Settings, dataSets) {
    if (Settings?.NextHour?.Provider === "WeatherKit") return;
    if (!dataSets?.includes("forecastNextHour")) return;

    ApplyVirtualCountry($request, url);
}

/***************** Processing *****************/
export async function Request($request) {
    // 构造回复数据
    let $response = undefined;
    // 解构URL
    const url = new URL($request.url);
    Console.info(`url: ${url.toJSON()}`);
    // 解析格式
    const FORMAT = ($request.headers?.["Content-Type"] ?? $request.headers?.["content-type"])?.split(";")?.[0];
    Console.info(`FORMAT: ${FORMAT}`);
    /**
     * 设置
     * @type {{Settings: import('./types').Settings}}
     */
    const { Settings, Caches, Configs } = setENV("iRingo", "WeatherKit", database);
    // 方法判断
    switch ($request.method) {
        case "POST":
        case "PUT":
        case "PATCH":
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
        case "DELETE":
            // 格式判断
            switch (FORMAT) {
                case undefined: // 视为无body
                    break;
                case "application/x-www-form-urlencoded":
                case "text/plain":
                default:
                    break;
                case "application/x-mpegURL":
                case "application/x-mpegurl":
                case "application/vnd.apple.mpegurl":
                case "audio/mpegurl":
                    //body = M3U8.parse($request.body);
                    //Console.debug(`body: ${JSON.stringify(body)}`);
                    //$request.body = M3U8.stringify(body);
                    break;
                case "text/xml":
                case "text/html":
                case "text/plist":
                case "application/xml":
                case "application/plist":
                case "application/x-plist":
                    //body = XML.parse($request.body);
                    //Console.debug(`body: ${JSON.stringify(body)}`);
                    //$request.body = XML.stringify(body);
                    break;
                case "text/vtt":
                case "application/vtt":
                    //body = VTT.parse($request.body);
                    //Console.debug(`body: ${JSON.stringify(body)}`);
                    //$request.body = VTT.stringify(body);
                    break;
                case "text/json":
                case "application/json":
                    //body = JSON.parse($request.body ?? "{}");
                    //Console.debug(`body: ${JSON.stringify(body)}`);
                    //$request.body = JSON.stringify(body);
                    break;
                case "application/protobuf":
                case "application/x-protobuf":
                case "application/vnd.google.protobuf":
                case "application/grpc":
                case "application/grpc+proto":
                case "application/octet-stream": {
                    //Console.debug(`$request: ${JSON.stringify($request, null, 2)}`);
                    let rawBody = $request.bodyBytes ? new Uint8Array($request.bodyBytes) : ($request.body ?? new Uint8Array());
                    //Console.debug(`isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody, null, 2)}`);
                    // 写入二进制数据
                    $request.body = rawBody;
                    break;
                }
            }
        //break; // 不中断，继续处理URL
        case "GET":
        case "HEAD":
        case "OPTIONS":
        default:
            delete $request?.headers?.["If-None-Match"];
            delete $request?.headers?.["if-none-match"];
            // 主机判断
            switch (url.hostname) {
                case "weatherkit.apple.com":
                    // 路径判断
                    switch (true) {
                        case /^\/api\/v[123]\/availability\//.test(url.pathname): {
                            ApplyAvailabilityVirtualCountry($request, url, Settings);
                            break;
                        }
                        case /^\/api\/v[23]\/weather\//.test(url.pathname): {
                            // 解决 macOS 天气 app 如果使用国际版 Maps 时，country 丢失不显示未来一小时降水的问题
                            switch (true) {
                                case $request.headers["User-Agent"]?.startsWith("WeatherKit_Weather_macOS_Version"):
                                case $request.headers["user-agent"]?.startsWith("WeatherKit_Weather_macOS_Version"):
                                    if (url.searchParams.has("country")) {
                                        //if (url.searchParams.get("country") === "CN") url.searchParams.set("country", "TW");
                                    } else {
                                        const gcc = Storage.getItem("@iRingo.Location.Caches")?.pep?.gcc;
                                        if (gcc) url.searchParams.set("country", gcc);
                                    }
                                    break;
                            }
                            let dataSets = url.searchParams.get("dataSets")?.split(",");
                            if (dataSets) {
                                dataSets = dataSets?.filter(dataSet => Settings.DataSets?.includes(dataSet));
                                url.searchParams.set("dataSets", dataSets?.join(","));
                            }
                            ApplyNextHourVirtualCountry($request, url, Settings, dataSets);
                            break;
                        }
                    }
                    break;
            }
            break;
        case "CONNECT":
        case "TRACE":
            break;
    }
    $request.url = url.toString();
    Console.debug(`$request.url: ${$request.url}`);
    return { $request, $response };
}
