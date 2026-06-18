import { Console, fetch } from "@nsnanocat/util";
import AirQuality from "../class/AirQuality.mjs";

export default class IQAir {
    constructor(parameters, token, url = "https://api.airvisual.com/v2/nearest_city") {
        this.Name = "IQAir";
        this.Version = "1.0.0";
        Console.log(`🟧 ${this.Name} v${this.Version}`);
        this.endpoint = url || "https://api.airvisual.com/v2/nearest_city";
        this.headers = { Accept: "application/json" };
        this.token = token;
        this.version = parameters.version;
        this.language = parameters.language;
        this.latitude = parameters.latitude;
        this.longitude = parameters.longitude;
        this.country = parameters.country;
    }

    #currentAirQuality;

    static Pollutants = {
        p2: "PM2_5",
        p1: "PM10",
        o3: "OZONE",
        n2: "NO2",
        s2: "SO2",
        co: "CO",
    };

    static Units = {
        ugm3: "MICROGRAMS_PER_CUBIC_METER",
        "µg/m3": "MICROGRAMS_PER_CUBIC_METER",
        "μg/m3": "MICROGRAMS_PER_CUBIC_METER",
        mgm3: "MILLIGRAMS_PER_CUBIC_METER",
        ppb: "PARTS_PER_BILLION",
        ppm: "PARTS_PER_MILLION",
    };

    static Scale = AirQuality.Config.Scales.EPA_NowCast;
    static CNScale = AirQuality.Config.Scales.HJ6332012;

    static #ToUnixTime(value, fallback) {
        const timestamp = (new Date(value).getTime() / 1000) | 0;
        if (!Number.isFinite(timestamp) || timestamp <= 0) return fallback;
        return Math.min(timestamp, fallback);
    }

    static #CreatePollutants(pollution, units) {
        return Object.entries(IQAir.Pollutants)
            .map(([code, pollutantType]) => {
                const amount = Number.parseFloat(pollution?.[code]?.conc);
                const unit = IQAir.Units[units?.[code]];
                if (!Number.isFinite(amount) || !unit) return;
                return { amount, pollutantType, units: unit };
            })
            .filter(Boolean);
    }

    static FromBody(body, parameters = {}) {
        const timeStamp = (Date.now() / 1000) | 0;
        const data = body?.data;
        const pollution = data?.current?.pollution;
        const usIndex = Number.parseInt(pollution?.aqius, 10);
        const cnIndex = Number.parseInt(pollution?.aqicn, 10);
        const preferCNIndex = parameters?.country === "CN";
        const useCNIndex = Number.isFinite(cnIndex) && (preferCNIndex || !Number.isFinite(usIndex));
        const index = useCNIndex ? cnIndex : usIndex;
        const scale = useCNIndex ? IQAir.CNScale : IQAir.Scale;

        if (body?.status !== "success") {
            Console.warn("IQAir.FromBody", `Unexpected status: ${body?.status || "unavailable"}`);
            return IQAir.Unavailable(parameters, body?.status || "unavailable");
        }

        if (!Number.isFinite(index)) {
            Console.warn("IQAir.FromBody", "Missing aqius/aqicn index");
            return IQAir.Unavailable(parameters, "missing_aqi");
        }

        const categoryIndex = AirQuality.CategoryIndex(index, scale.categories);
        if (categoryIndex < 0) return IQAir.Unavailable(parameters, "invalid_aqi");

        const [longitude, latitude] = data?.location?.coordinates ?? [];
        const stationName = data?.name || data?.city;
        const providerName = ["IQAir", stationName ? `Station: ${stationName}` : undefined, data?.city ? `City: ${data.city}` : undefined].filter(Boolean).join("\n");
        const pollutants = IQAir.#CreatePollutants(pollution, data?.units);
        if (pollutants.length === 0) Console.warn("IQAir.FromBody", "AQI index is available, but pollutant concentrations are unavailable");

        return {
            metadata: {
                attributionUrl: "https://www.iqair.com/air-quality-map",
                expireTime: timeStamp + 60 * 60,
                language: `${parameters.language}-${parameters.country}`,
                latitude: Number.parseFloat(latitude ?? parameters.latitude),
                longitude: Number.parseFloat(longitude ?? parameters.longitude),
                providerName,
                readTime: timeStamp,
                reportedTime: IQAir.#ToUnixTime(pollution?.ts, timeStamp),
                temporarilyUnavailable: false,
                sourceType: "STATION",
            },
            categoryIndex,
            index,
            isSignificant: categoryIndex >= scale.categories.significantIndex,
            pollutants,
            previousDayComparison: AirQuality.Config.CompareCategoryIndexes.UNKNOWN,
            primaryPollutant: IQAir.Pollutants[useCNIndex ? pollution?.maincn : pollution?.mainus] || "NOT_AVAILABLE",
            scale: AirQuality.ToWeatherKitScale(scale.weatherKitScale),
        };
    }

    static Unavailable(parameters = {}, reason = "unavailable") {
        const timeStamp = (Date.now() / 1000) | 0;
        return {
            metadata: {
                attributionUrl: "https://www.iqair.com/air-quality-map",
                expireTime: timeStamp + 60 * 60,
                language: `${parameters.language}-${parameters.country}`,
                latitude: parameters.latitude,
                longitude: parameters.longitude,
                providerName: `IQAir${reason ? `\n${reason}` : ""}`,
                readTime: timeStamp,
                reportedTime: timeStamp,
                temporarilyUnavailable: true,
                sourceType: "STATION",
            },
            pollutants: [],
            previousDayComparison: AirQuality.Config.CompareCategoryIndexes.UNKNOWN,
        };
    }

    async CurrentAirQuality() {
        Console.info("☑️ CurrentAirQuality");
        if (this.#currentAirQuality) {
            Console.info("✅ CurrentAirQuality", "Using cache");
            return this.#currentAirQuality;
        }

        if (!this.token) {
            Console.warn("IQAir", "Missing API token");
            Console.info("✅ CurrentAirQuality");
            this.#currentAirQuality = IQAir.Unavailable(this, "missing_api_key");
            return this.#currentAirQuality;
        }

        const url = new URL(this.endpoint);
        url.searchParams.set("lat", this.latitude);
        url.searchParams.set("lon", this.longitude);
        url.searchParams.set("key", this.token);

        let airQuality;
        try {
            const body = await fetch({ url: url.toString(), headers: this.headers }).then(response => {
                Console.info("IQAir.CurrentAirQuality", `status: ${response?.status ?? response?.statusCode ?? "unknown"}`);
                return JSON.parse(response?.body ?? "{}");
            });
            airQuality = IQAir.FromBody(body, this);
        } catch (error) {
            Console.warn("IQAir.CurrentAirQuality", error);
            airQuality = IQAir.Unavailable(this, "request_failed");
        } finally {
            this.#currentAirQuality = airQuality;
            Console.info("✅ CurrentAirQuality");
        }
        return this.#currentAirQuality;
    }
}
