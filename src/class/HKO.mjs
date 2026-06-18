import { Console, fetch as request } from "@nsnanocat/util";

const DEFAULT_ENDPOINT = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php";

function timestamp(value, fallback) {
    const time = new Date(value).getTime() / 1000;
    return Number.isFinite(time) && time > 0 ? Math.trunc(time) : fallback;
}

function uuidFromString(value) {
    const bytes = new Array(16).fill(0);
    const text = String(value ?? "hko-weather-alert");
    for (let index = 0; index < text.length; index++) {
        const char = text.charCodeAt(index);
        bytes[index % 16] = (bytes[index % 16] * 31 + char + index) & 255;
        bytes[(index * 7) % 16] = (bytes[(index * 7) % 16] ^ char ^ index) & 255;
    }
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = bytes.map(byte => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default class HKO {
    constructor(parameters, endpoint = DEFAULT_ENDPOINT) {
        this.Name = "HKO";
        this.Version = "1.0.0";
        Console.log(`🟧 ${this.Name} v${this.Version}`);
        this.endpoint = endpoint || DEFAULT_ENDPOINT;
        this.language = parameters.language;
        this.hkoLanguage = HKO.#NormalizeLanguage(parameters.language);
        this.latitude = parameters.latitude;
        this.longitude = parameters.longitude;
        this.country = parameters.country;
    }

    #cache = {};

    static #NormalizeLanguage(language = "en") {
        const normalized = language.toLowerCase();
        if (normalized.startsWith("zh") || normalized.startsWith("yue")) return "tc";
        return "en";
    }

    static #Severity(warning = {}) {
        const code = warning.code ?? "";
        if (code === "WRAINB" || /TC10|TC9|TC8/i.test(code)) return "EXTREME";
        if (code === "WRAINR" || ["WL", "WFIREY", "WMSGNL", "WFNTSA"].includes(code)) return "SEVERE";
        if (code === "WRAINA" || ["WTS", "WHOT", "WCOLD", "WFROST"].includes(code)) return "MODERATE";
        return "MINOR";
    }

    static #Responses(warning = {}) {
        const code = warning.code ?? warning.warningStatementCode;
        if (["WRAINB", "WRAINR", "WL", "WFNTSA"].includes(code)) return ["AVOID", "MONITOR"];
        if (["WTS", "WTCSGNL"].includes(code)) return ["SHELTER", "MONITOR"];
        return ["MONITOR"];
    }

    static #DetailsUrl(language = "en") {
        return `https://www.hko.gov.hk/${language === "tc" ? "tc" : "en"}/wxinfo/dailywx/wxwarntoday.htm`;
    }

    static #Description(detail = {}, warning = {}) {
        const contents = detail?.contents ?? [];
        if (contents.length) return contents.join("\n");
        return warning.name ?? warning.code ?? "";
    }

    async #Fetch(dataType) {
        if (this.#cache[dataType]) return this.#cache[dataType];
        const url = new URL(this.endpoint);
        url.searchParams.set("dataType", dataType);
        url.searchParams.set("lang", this.hkoLanguage);
        const body =
            globalThis.process?.versions?.node && globalThis.fetch
                ? await globalThis.fetch(url).then(response => response.json())
                : await request({ url: url.toString() }).then(response => JSON.parse(response?.body ?? "{}"));
        this.#cache[dataType] = body;
        return body;
    }

    async WeatherAlerts() {
        Console.info("☑️ HKO.WeatherAlerts");
        try {
            if (this.country !== "HK") return undefined;

            const [summary, info] = await Promise.all([this.#Fetch("warnsum"), this.#Fetch("warningInfo")]);
            const details = info?.details ?? [];
            const now = Math.trunc(Date.now() / 1000);
            const detailMap = new Map(details.map(detail => [`${detail.warningStatementCode}:${detail.subtype ?? ""}`, detail]));
            const alerts = Object.entries(summary ?? {}).map(([key, warning]) => {
                const detail = detailMap.get(`${key}:${warning.code ?? ""}`) ?? detailMap.get(`${key}:`) ?? {};
                const issuedTime = timestamp(warning.issueTime, timestamp(detail.updateTime, now));
                const updateTime = timestamp(warning.updateTime ?? detail.updateTime, issuedTime);
                const expireTime = timestamp(warning.expireTime, now + 6 * 60 * 60);
                const detailsUrl = HKO.#DetailsUrl(this.hkoLanguage);
                return {
                    areaId: "HK",
                    areaName: "Hong Kong",
                    attributionUrl: detailsUrl,
                    certainty: "OBSERVED",
                    countryCode: "HK",
                    description: HKO.#Description(detail, warning),
                    detailsUrl,
                    effectiveTime: issuedTime,
                    expireTime,
                    issuedTime,
                    eventOnsetTime: issuedTime,
                    eventEndTime: expireTime,
                    eventSource: "HKO",
                    id: uuidFromString(`HKO:${warning.code ?? key}:${issuedTime}`),
                    importance: HKO.#Severity(warning) === "MINOR" ? "NORMAL" : "HIGH",
                    phenomenon: warning.type ? `${warning.name} - ${warning.type}` : warning.name,
                    responses: HKO.#Responses(warning),
                    severity: HKO.#Severity(warning),
                    significance: warning.actionCode === "CANCEL" ? "STATEMENT" : "WARNING",
                    source: "Hong Kong Observatory",
                    token: warning.code ?? key,
                };
            });
            if (!alerts.length) return undefined;

            const reportedTime = Math.max(...alerts.map(alert => alert.issuedTime ?? now));
            return {
                metadata: {
                    attributionUrl: HKO.#DetailsUrl(this.hkoLanguage),
                    expireTime: now + 10 * 60,
                    language: `${this.language}-${this.country}`,
                    latitude: Number.parseFloat(this.latitude),
                    longitude: Number.parseFloat(this.longitude),
                    providerName: "Hong Kong Observatory",
                    readTime: now,
                    reportedTime,
                    temporarilyUnavailable: false,
                    sourceType: "STATION",
                },
                detailsUrl: HKO.#DetailsUrl(this.hkoLanguage),
                alerts,
            };
        } catch (error) {
            Console.warn("HKO.WeatherAlerts", error);
            return undefined;
        } finally {
            Console.info("✅ HKO.WeatherAlerts");
        }
    }
}
