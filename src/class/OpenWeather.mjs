import { Console, fetch } from "@nsnanocat/util";
import Weather from "./Weather.mjs";
import ForecastNextHour from "./ForecastNextHour.mjs";
import providerNameToLogo from "../function/providerNameToLogo.mjs";

const DEFAULT_ENDPOINT = "https://api.openweathermap.org/data/4.0/onecall";

export default class OpenWeather {
    constructor(parameters, token, endpoint = DEFAULT_ENDPOINT) {
        this.Name = "OpenWeather";
        this.Version = "1.0.0";
        Console.log(`🟧 ${this.Name} v${this.Version}`);
        this.endpoint = OpenWeather.#NormalizeEndpoint(endpoint);
        this.token = token;
        this.version = parameters.version;
        this.language = OpenWeather.#NormalizeLanguage(parameters.language, parameters.country);
        this.latitude = parameters.latitude;
        this.longitude = parameters.longitude;
        this.country = parameters.country;
    }

    #cache = {};

    static #NormalizeEndpoint(endpoint = DEFAULT_ENDPOINT) {
        const normalized = endpoint || DEFAULT_ENDPOINT;
        const withProtocol = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
        return withProtocol.replace(/\/+$/, "");
    }

    static #NormalizeLanguage(language = "en", country = "") {
        const normalizedLanguage = language?.toLowerCase?.() || "en";
        const normalizedCountry = country?.toUpperCase?.() || "";
        if (normalizedLanguage === "zh") {
            switch (normalizedCountry) {
                case "TW":
                    return "zh_tw";
                case "CN":
                case "HK":
                case "MO":
                    return "zh_cn";
                default:
                    return "zh_cn";
            }
        }
        return normalizedLanguage;
    }

    #BuildURL(path) {
        const url = new URL(`${this.endpoint}/${path}`);
        url.searchParams.set("lat", this.latitude);
        url.searchParams.set("lon", this.longitude);
        url.searchParams.set("units", "metric");
        url.searchParams.set("lang", this.language);
        url.searchParams.set("appid", this.token ?? "");
        return url.toString();
    }

    async #Fetch(path) {
        Console.info("☑️ OpenWeather.Fetch", `path: ${path}`);
        if (this.#cache[path]) {
            Console.info("✅ OpenWeather.Fetch", "Using cache");
            return this.#cache[path];
        }

        const request = { url: this.#BuildURL(path) };
        try {
            const body = await fetch(request).then(response => JSON.parse(response?.body ?? "{}"));
            if (body?.cod && `${body.cod}` !== "200") throw Error(JSON.stringify(body));
            if (!Array.isArray(body?.data)) throw Error(JSON.stringify(body ?? {}));
            this.#cache[path] = body;
            return body;
        } catch (error) {
            Console.error(`OpenWeather.Fetch: ${error}`);
        } finally {
            Console.info("✅ OpenWeather.Fetch");
        }
        return {};
    }

    #Metadata(body, sourceType = "MODELED", reportedTime = undefined) {
        const timeStamp = Math.trunc(Date.now() / 1000);
        return {
            attributionUrl: "https://openweathermap.org/",
            expireTime: timeStamp + 10 * 60,
            language: this.language,
            latitude: OpenWeather.#Number(body?.lat, this.latitude),
            longitude: OpenWeather.#Number(body?.lon, this.longitude),
            providerLogo: providerNameToLogo("OpenWeather", this.version),
            providerName: "OpenWeather",
            readTime: timeStamp,
            reportedTime: reportedTime ?? body?.data?.[0]?.dt ?? timeStamp,
            temporarilyUnavailable: false,
            sourceType,
        };
    }

    static #Number(value, fallback = undefined) {
        const number = Number.parseFloat(value);
        if (Number.isFinite(number)) return number;
        const fallbackNumber = Number.parseFloat(fallback);
        return Number.isFinite(fallbackNumber) ? fallbackNumber : undefined;
    }

    static #Integer(value, fallback = undefined) {
        const number = Number.parseInt(value, 10);
        if (Number.isFinite(number)) return number;
        const fallbackNumber = Number.parseInt(fallback, 10);
        return Number.isFinite(fallbackNumber) ? fallbackNumber : undefined;
    }

    static #PrecipitationIntensity(data = {}) {
        const rain = OpenWeather.#Number(data?.rain?.["1h"], 0);
        const snow = OpenWeather.#Number(data?.snow?.["1h"], 0);
        return (rain ?? 0) + (snow ?? 0);
    }

    static #PrecipitationType(data = {}) {
        const rain = OpenWeather.#Number(data?.rain?.["1h"], 0);
        const snow = OpenWeather.#Number(data?.snow?.["1h"], 0);
        const id = OpenWeather.#Integer(data?.weather?.[0]?.id);
        if ((snow ?? 0) > 0 || (id >= 600 && id < 700)) return "SNOW";
        if ((rain ?? 0) > 0 || (id >= 200 && id < 600)) return "RAIN";
        return undefined;
    }

    static #WeatherCondition(weather = {}) {
        const id = OpenWeather.#Integer(weather?.id);
        if (id >= 200 && id < 300) return "THUNDERSTORMS";
        if (id >= 300 && id < 400) return "DRIZZLE";
        if (id >= 500 && id < 600) {
            if (id === 511) return "FREEZING_DRIZZLE";
            if (id >= 502) return "HEAVY_RAIN";
            if (id === 500) return "DRIZZLE";
            return "RAIN";
        }
        if (id >= 600 && id < 700) {
            if ([611, 612, 613, 615, 616].includes(id)) return "SLEET";
            if ([602, 622].includes(id)) return "HEAVY_SNOW";
            if (id === 600 || id === 620) return "FLURRIES";
            return "SNOW";
        }
        switch (id) {
            case 701:
            case 741:
                return "FOGGY";
            case 711:
            case 721:
            case 731:
            case 751:
            case 761:
            case 762:
                return "HAZE";
            case 771:
            case 781:
                return "WINDY";
            case 800:
                return "CLEAR";
            case 801:
                return "MOSTLY_CLEAR";
            case 802:
                return "PARTLY_CLOUDY";
            case 803:
                return "MOSTLY_CLOUDY";
            case 804:
                return "CLOUDY";
            default:
                return Weather.ConvertWeatherCode(weather?.main);
        }
    }

    static #MoonPhase(moonPhase) {
        const value = OpenWeather.#Number(moonPhase);
        if (value === undefined) return undefined;
        if (value === 0 || value === 1) return "NEW";
        if (value < 0.25) return "WAXING_CRESCENT";
        if (value === 0.25) return "FIRST_QUARTER";
        if (value < 0.5) return "WAXING_GIBBOUS";
        if (value === 0.5) return "FULL";
        if (value < 0.75) return "WANING_GIBBOUS";
        if (value === 0.75) return "THIRD_QUARTER";
        return "WANING_CRESCENT";
    }

    static #Daylight(data = {}) {
        const icon = data?.weather?.[0]?.icon;
        if (typeof icon === "string" && icon.endsWith("d")) return true;
        if (typeof icon === "string" && icon.endsWith("n")) return false;
        return undefined;
    }

    async WeatherNow() {
        Console.info("☑️ WeatherNow");
        let currentWeather;
        try {
            const body = await this.#Fetch("current");
            const current = body?.data?.[0];
            if (!current) throw Error(JSON.stringify(body ?? {}));
            const precipitationIntensity = OpenWeather.#PrecipitationIntensity(current);
            currentWeather = {
                metadata: this.#Metadata(body, "MODELED", current.dt),
                asOf: current.dt,
                cloudCover: OpenWeather.#Integer(current.clouds),
                conditionCode: OpenWeather.#WeatherCondition(current.weather?.[0]),
                daylight: OpenWeather.#Daylight(current),
                humidity: OpenWeather.#Integer(current.humidity),
                perceivedPrecipitationIntensity: precipitationIntensity,
                precipitationAmount1h: precipitationIntensity,
                precipitationIntensity,
                pressure: OpenWeather.#Number(current.pressure),
                temperature: OpenWeather.#Number(current.temp),
                temperatureApparent: OpenWeather.#Number(current.feels_like),
                temperatureDewPoint: OpenWeather.#Number(current.dew_point),
                uvIndex: OpenWeather.#Number(current.uvi),
                visibility: OpenWeather.#Number(current.visibility),
                windDirection: OpenWeather.#Integer(current.wind_deg),
                windGust: OpenWeather.#Number(current.wind_gust),
                windSpeed: OpenWeather.#Number(current.wind_speed),
            };
        } catch (error) {
            Console.error(`WeatherNow: ${error}`);
        } finally {
            Console.info("✅ WeatherNow");
        }
        return currentWeather;
    }

    async Minutely() {
        Console.info("☑️ Minutely");
        let forecastNextHour;
        try {
            const body = await this.#Fetch("timeline/1min");
            if (!body?.data?.length) throw Error(JSON.stringify(body ?? {}));
            const timeStamp = Math.trunc(Date.now() / 1000);
            const minuteStamp = new Date((body.data[0].dt ?? timeStamp) * 1000).setSeconds(0, 0) / 1000;
            forecastNextHour = {
                metadata: this.#Metadata(body, "MODELED", body.data[0].dt),
                condition: [],
                forecastEnd: 0,
                forecastStart: minuteStamp,
                minutes: body.data.map((minute, index) => ({
                    perceivedPrecipitationIntensity: 0,
                    precipitationChance: OpenWeather.#Number(minute.precipitation, 0) > 0 ? 100 : 0,
                    precipitationIntensity: OpenWeather.#Number(minute.precipitation, 0),
                    startTime: minute.dt ?? minuteStamp + 60 * index,
                })),
                summary: [],
            };
            forecastNextHour.minutes.length = Math.min(85, forecastNextHour.minutes.length);
            forecastNextHour.forecastEnd = minuteStamp + 60 * forecastNextHour.minutes.length;
            forecastNextHour.minutes = ForecastNextHour.Minute(forecastNextHour.minutes, "rain", "mmph");
            forecastNextHour.summary = ForecastNextHour.Summary(forecastNextHour.minutes);
            forecastNextHour.condition = ForecastNextHour.Condition(forecastNextHour.summary);
        } catch (error) {
            Console.error(`Minutely: ${error}`);
        } finally {
            Console.info("✅ Minutely");
        }
        return forecastNextHour;
    }

    async Hourly() {
        Console.info("☑️ Hourly");
        let forecastHourly;
        try {
            const body = await this.#Fetch("timeline/1h");
            if (!body?.data?.length) throw Error(JSON.stringify(body ?? {}));
            forecastHourly = {
                metadata: this.#Metadata(body, "MODELED", body.data[0].dt),
                hours: body.data.map(hour => {
                    const precipitationIntensity = OpenWeather.#PrecipitationIntensity(hour);
                    return {
                        cloudCover: OpenWeather.#Integer(hour.clouds),
                        conditionCode: OpenWeather.#WeatherCondition(hour.weather?.[0]),
                        daylight: OpenWeather.#Daylight(hour),
                        forecastStart: hour.dt,
                        humidity: OpenWeather.#Integer(hour.humidity),
                        perceivedPrecipitationIntensity: precipitationIntensity,
                        precipitationAmount: precipitationIntensity,
                        precipitationChance: Math.round(OpenWeather.#Number(hour.pop, 0) * 100),
                        precipitationIntensity,
                        precipitationType: OpenWeather.#PrecipitationType(hour),
                        pressure: OpenWeather.#Number(hour.pressure),
                        snowfallAmount: OpenWeather.#Number(hour?.snow?.["1h"]),
                        snowfallIntensity: OpenWeather.#Number(hour?.snow?.["1h"]),
                        temperature: OpenWeather.#Number(hour.temp),
                        temperatureApparent: OpenWeather.#Number(hour.feels_like),
                        temperatureDewPoint: OpenWeather.#Number(hour.dew_point),
                        uvIndex: OpenWeather.#Number(hour.uvi),
                        visibility: OpenWeather.#Number(hour.visibility),
                        windDirection: OpenWeather.#Integer(hour.wind_deg),
                        windGust: OpenWeather.#Number(hour.wind_gust),
                        windSpeed: OpenWeather.#Number(hour.wind_speed),
                    };
                }),
            };
        } catch (error) {
            Console.error(`Hourly: ${error}`);
        } finally {
            Console.info("✅ Hourly");
        }
        return forecastHourly;
    }

    async Daily() {
        Console.info("☑️ Daily");
        let forecastDaily;
        try {
            const body = await this.#Fetch("timeline/1day");
            if (!body?.data?.length) throw Error(JSON.stringify(body ?? {}));
            forecastDaily = {
                metadata: this.#Metadata(body, "MODELED", body.data[0].dt),
                days: body.data.map(day => {
                    const precipitationIntensity = OpenWeather.#PrecipitationIntensity(day);
                    return {
                        forecastStart: day.dt,
                        forecastEnd: day.dt ? day.dt + 24 * 3600 : undefined,
                        conditionCode: OpenWeather.#WeatherCondition(day.weather?.[0]),
                        humidityMax: OpenWeather.#Integer(day.humidity),
                        humidityMin: OpenWeather.#Integer(day.humidity),
                        maxUvIndex: OpenWeather.#Number(day.uvi),
                        moonPhase: OpenWeather.#MoonPhase(day.moon_phase),
                        moonrise: day.moonrise,
                        moonset: day.moonset,
                        precipitationAmount: precipitationIntensity,
                        precipitationChance: Math.round(OpenWeather.#Number(day.pop, 0) * 100),
                        precipitationType: OpenWeather.#PrecipitationType(day),
                        snowfallAmount: OpenWeather.#Number(day?.snow?.["1h"]),
                        sunrise: day.sunrise,
                        sunset: day.sunset,
                        temperatureMax: OpenWeather.#Number(day.temp?.max),
                        temperatureMin: OpenWeather.#Number(day.temp?.min),
                        visibilityMax: OpenWeather.#Number(day.visibility),
                        visibilityMin: OpenWeather.#Number(day.visibility),
                        windGustSpeedMax: OpenWeather.#Number(day.wind_gust),
                        windSpeedAvg: OpenWeather.#Number(day.wind_speed),
                        windSpeedMax: OpenWeather.#Number(day.wind_speed),
                        daytimeForecast: {
                            forecastStart: day.dt ? day.dt + 7 * 3600 : undefined,
                            forecastEnd: day.dt ? day.dt + 19 * 3600 : undefined,
                            cloudCover: OpenWeather.#Integer(day.clouds),
                            conditionCode: OpenWeather.#WeatherCondition(day.weather?.[0]),
                            humidityMax: OpenWeather.#Integer(day.humidity),
                            humidityMin: OpenWeather.#Integer(day.humidity),
                            precipitationAmount: precipitationIntensity,
                            precipitationChance: Math.round(OpenWeather.#Number(day.pop, 0) * 100),
                            precipitationType: OpenWeather.#PrecipitationType(day),
                            snowfallAmount: OpenWeather.#Number(day?.snow?.["1h"]),
                            temperatureMax: OpenWeather.#Number(day.temp?.max),
                            temperatureMin: OpenWeather.#Number(day.temp?.day),
                            windDirection: OpenWeather.#Integer(day.wind_deg),
                            windGustSpeedMax: OpenWeather.#Number(day.wind_gust),
                            windSpeed: OpenWeather.#Number(day.wind_speed),
                            windSpeedMax: OpenWeather.#Number(day.wind_speed),
                        },
                        overnightForecast: {
                            forecastStart: day.dt ? day.dt + 19 * 3600 : undefined,
                            forecastEnd: day.dt ? day.dt + 31 * 3600 : undefined,
                            cloudCover: OpenWeather.#Integer(day.clouds),
                            conditionCode: OpenWeather.#WeatherCondition(day.weather?.[0]),
                            humidityMax: OpenWeather.#Integer(day.humidity),
                            humidityMin: OpenWeather.#Integer(day.humidity),
                            precipitationAmount: precipitationIntensity,
                            precipitationChance: Math.round(OpenWeather.#Number(day.pop, 0) * 100),
                            precipitationType: OpenWeather.#PrecipitationType(day),
                            snowfallAmount: OpenWeather.#Number(day?.snow?.["1h"]),
                            temperatureMax: OpenWeather.#Number(day.temp?.night),
                            temperatureMin: OpenWeather.#Number(day.temp?.min),
                            windDirection: OpenWeather.#Integer(day.wind_deg),
                            windGustSpeedMax: OpenWeather.#Number(day.wind_gust),
                            windSpeed: OpenWeather.#Number(day.wind_speed),
                            windSpeedMax: OpenWeather.#Number(day.wind_speed),
                        },
                    };
                }),
            };
        } catch (error) {
            Console.error(`Daily: ${error}`);
        } finally {
            Console.info("✅ Daily");
        }
        return forecastDaily;
    }
}
