import { Console } from "@nsnanocat/util";

export default class Weather {
    static Name = "Weather";
    static Version = "0.3.0";
    static Author = "Virgil Clyne & 001";

    /**
     * Estimate UV Index from DSWRF (W/m2).
     * @param {number} dswrf - Downward short-wave radiation flux.
     * @param {number} k - Optional UV ratio coefficient. Defaults to 0.04.
     * @returns {number} Rounded integer UV Index.
     */
    static ConvertDSWRF(dswrf, k = 0.04) {
        Console.info("☑️ ConvertDSWRF");
        const uvIndex = Math.round((Math.max(dswrf, 0) * k) / 0.025); // Estimate UV Index.
        //Console.debug(`UV Index: ${uvIndex}`);
        Console.info("✅ ConvertDSWRF");
        // Clamp the rounded result to 0-11.
        return Math.min(uvIndex, 11);
    }

    /**
     * Merge a new forecast array into the original forecast array.
     * @param {array} to - Original forecast array.
     * @param {array} from - New forecast array.
     * @returns {array} Original forecast array.
     */
    static mergeForecast(to = [], from = []) {
        let i = 0,
            j = 0;
        while (i < to.length) {
            const forecastStart = to[i].forecastStart;
            const newForecastStart = j < from.length ? from[j].forecastStart : Number.POSITIVE_INFINITY;

            if (forecastStart === newForecastStart) {
                //Console.debug(`${i}: ${newForecastStart} -> ${forecastStart}`);
                // Merge fields from from[j] into to[i] in place.
                if (Object.hasOwn(from[j], "daytimeForecast")) from[j].daytimeForecast = { ...to[i].daytimeForecast, ...from[j].daytimeForecast };
                if (Object.hasOwn(from[j], "overnightForecast")) from[j].overnightForecast = { ...to[i].overnightForecast, ...from[j].overnightForecast };
                if (Object.hasOwn(from[j], "restOfDayForecast")) from[j].restOfDayForecast = { ...to[i].restOfDayForecast, ...from[j].restOfDayForecast };
                Object.assign(to[i], from[j]);
                i++;
                j++;
            } else if (newForecastStart < forecastStart) {
                //Console.debug(`${j}: ${newForecastStart} -> X`);
                j++; // Let from catch up with to.
            } else {
                //Console.debug(`${i}: X -> ${forecastStart}`);
                i++; // No matching entry in to; keep to[i].
            }
        }
        return to; // Return the same reference.
    }

    static ConvertWeatherCode(skycon) {
        switch (skycon) {
            // Clear.
            case "\u6674":
            case "CLEAR_DAY":
            case "CLEAR_NIGHT":
                return "CLEAR";

            // Cloud-related values.
            case "\u591a\u4e91":
            case "PARTLY_CLOUDY_DAY":
            case "PARTLY_CLOUDY_NIGHT":
                return "PARTLY_CLOUDY";
            case "\u5c11\u4e91":
                return "MOSTLY_CLEAR";
            case "\u6674\u95f4\u591a\u4e91":
                return "PARTLY_CLOUDY";
            case "\u9634":
            case "CLOUDY":
                return "CLOUDY";

            // Wind-related values.
            case "WIND":
                return "WINDY";

            // Fog and haze related values.
            case "\u8584\u96fe":
            case "\u96fe":
            case "\u6d53\u96fe":
            case "\u5f3a\u6d53\u96fe":
            case "\u5927\u96fe":
            case "\u7279\u5f3a\u6d53\u96fe":
            case "FOG":
                return "FOGGY";
            case "\u973e":
            case "\u4e2d\u5ea6\u973e":
            case "\u91cd\u5ea6\u973e":
            case "\u4e25\u91cd\u973e":
            case "LIGHT_HAZE":
            case "MODERATE_HAZE":
            case "HEAVY_HAZE":
                return "HAZE";

            // Dust and sand. Apple has no DUST/SAND definition, so use HAZE.
            case "\u626c\u6c99":
            case "\u6d6e\u5c18":
            case "\u6c99\u5c18\u66b4":
            case "\u5f3a\u6c99\u5c18\u66b4":
            case "DUST":
            case "SAND":
                return "HAZE";

            // Rain-related values.
            case "\u5c0f\u96e8":
            case "\u6bdb\u6bdb\u96e8/\u7ec6\u96e8":
            case "LIGHT_RAIN":
                return "DRIZZLE";
            case "\u96e8":
            case "\u9635\u96e8":
            case "\u4e2d\u96e8":
            case "\u5c0f\u5230\u4e2d\u96e8":
            case "MODERATE_RAIN":
                return "RAIN";
            case "\u5927\u96e8":
            case "\u4e2d\u5230\u5927\u96e8":
                return "HEAVY_RAIN";
            case "\u66b4\u96e8":
            case "\u5927\u66b4\u96e8":
            case "\u5f3a\u964d\u96e8":
            case "\u7279\u5927\u66b4\u96e8":
            case "\u5927\u5230\u66b4\u96e8":
            case "\u66b4\u96e8\u5230\u5927\u66b4\u96e8":
            case "\u5927\u66b4\u96e8\u5230\u7279\u5927\u66b4\u96e8":
            case "\u6781\u7aef\u964d\u96e8":
            case "HEAVY_RAIN":
                return "HEAVY_RAIN";
            case "\u96f7\u9635\u96e8":
            case "\u5f3a\u96f7\u9635\u96e8":
            case "STORM_RAIN":
            case "\u96f7\u9635\u96e8\u4f34\u6709\u51b0\u96f9":
                return "THUNDERSTORMS";

            // Snow-related values.
            case "\u5c0f\u96ea":
            case "LIGHT_SNOW":
                return "FLURRIES";
            case "\u96ea":
            case "\u9635\u96ea":
            case "\u4e2d\u96ea":
            case "\u5c0f\u5230\u4e2d\u96ea":
            case "MODERATE_SNOW":
                return "SNOW";
            case "\u5927\u96ea":
            case "\u4e2d\u5230\u5927\u96ea":
            case "HEAVY_SNOW":
                return "HEAVY_SNOW";
            case "\u66b4\u96ea":
            case "\u5927\u5230\u66b4\u96ea":
            case "STORM_SNOW":
                return "BLIZZARD";

            // Mixed rain and snow.
            case "\u96e8\u5939\u96ea":
            case "\u96e8\u96ea\u5929\u6c14":
            case "\u9635\u96e8\u5939\u96ea":
            case "\u51bb\u96e8":
                return "FREEZING_DRIZZLE";

            // Temperature-related values.
            case "\u70ed":
            case "\u51b7":

            // Unknown.
            case "\u672a\u77e5":
            default:
                Console.debug(`skycon: ${skycon}`);
                return null;
        }
    }

    static ConvertMoonPhase(moonPhase) {
        switch (moonPhase) {
            case "\u65b0\u6708":
                return "NEW";
            case "\u86fe\u7709\u6708":
                return "WAXING_CRESCENT";
            case "\u4e0a\u5f26\u6708":
                return "FIRST_QUARTER";
            case "\u76c8\u51f8\u6708":
                return "WAXING_GIBBOUS";
            case "\u6ee1\u6708":
                return "FULL";
            case "\u4e8f\u51f8\u6708":
                return "WANING_GIBBOUS";
            case "\u4e0b\u5f26\u6708":
                return "THIRD_QUARTER";
            case "\u6b8b\u6708":
                return "WANING_CRESCENT";
            default:
                Console.debug(`moonPhase: ${moonPhase}`);
                return null;
        }
    }
}
