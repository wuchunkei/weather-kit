import { Console } from "@nsnanocat/util";

export default class ForecastNextHour {
    Name = "ForecastNextHour";
    Version = "v1.6.3";
    Author = "iRingo";

    static #Configs = {
        Pollutants: {
            co: "CO",
            no: "NO",
            no2: "NO2",
            so2: "SO2",
            o3: "OZONE",
            nox: "NOX",
            pm25: "PM2_5",
            pm10: "PM10",
            other: "NOT_AVAILABLE",
        },
        WeatherCondition: {
            "\u6674\u6717": "CLEAR",
            "\u96e8\u5939\u96ea": "SLEET",
            "\u5c0f\u96e8": "DRIZZLE",
            "\u4e0b\u96e8": "RAIN",
            "\u4e2d\u96e8": "RAIN",
            "\u5927\u96e8": "HEAVY_RAIN",
            "\u5c0f\u96ea": "FLURRIES",
            "\u4e0b\u96ea": "SNOW",
            "\u4e2d\u96ea": "SNOW",
            "\u5927\u96ea": "HEAVY_SNOW",
            "\u51b0\u96f9": "HAIL",
        },
        PrecipitationType: {
            "\u6674\u6717": "CLEAR",
            "\u96e8\u5939\u96ea": "SLEET",
            rain: "RAIN",
            "\u96e8": "RAIN",
            snow: "SNOW",
            "\u96ea": "SNOW",
            "\u51b0\u96f9": "HAIL",
        },
        Precipitation: {
            Level: {
                INVALID: -1,
                NO: 0,
                LIGHT: 1,
                MODERATE: 2,
                HEAVY: 3,
                EXTREME: 4,
            },
            Range: {
                radar: {
                    NO: [0, 0.031],
                    LIGHT: [0.031, 0.25],
                    MODERATE: [0.25, 0.35],
                    HEAVY: [0.35, 0.48],
                    EXTREME: [0.48, Number.MAX_VALUE],
                },
                mmph: {
                    NO: [0, 0.08],
                    LIGHT: [0.08, 3.44],
                    MODERATE: [3.44, 11.33],
                    HEAVY: [11.33, 51.3],
                    EXTREME: [51.3, Number.MAX_VALUE],
                },
                precipitation: {
                    NO: [0, 0.01],
                    LIGHT: [0.01, 0.6],
                    MODERATE: [0.6, 1.65],
                    HEAVY: [1.65, 8.0],
                    EXTREME: [8.0, 205.0],
                },
            },
        },
    };

    static WeatherCondition(sentence) {
        Console.info("☑️ WeatherCondition", `sentence: ${sentence}`);
        let weatherCondition = "CLEAR";
        Object.keys(ForecastNextHour.#Configs.WeatherCondition).forEach(key => {
            if (sentence.includes(key)) weatherCondition = ForecastNextHour.#Configs.WeatherCondition[key];
        });
        Console.info(`✅ WeatherCondition: ${weatherCondition}`);
        return weatherCondition;
    }

    // Infer the precipitation type from the description text.
    static PrecipitationType(sentence) {
        Console.info("☑️ PrecipitationType", `sentence: ${sentence}`);
        let precipitationType = "CLEAR";
        Object.keys(ForecastNextHour.#Configs.PrecipitationType).forEach(key => {
            if (sentence.includes(key)) precipitationType = ForecastNextHour.#Configs.PrecipitationType[key];
        });
        Console.info(`✅ PrecipitationType: ${precipitationType}`);
        return precipitationType;
    }

    static Minute(minutes = [], description = "", units = "mmph") {
        Console.info("☑️ Minute");
        const precipitationType = ForecastNextHour.PrecipitationType(description);
        minutes = minutes.map((minute, i) => {
            // Infer perceivedPrecipitationIntensity from precipitationIntensity.
            minute.precipitationIntensity = Math.trunc(minute.precipitationIntensity * 1000000) / 1000000;
            minute.perceivedPrecipitationIntensity = ForecastNextHour.#ConvertPrecipitationIntensity(minute.precipitationIntensity, units);
            // Infer condition and summaryCondition from perceivedPrecipitationIntensity and precipitationChance.
            if (minute.perceivedPrecipitationIntensity > 2) {
                // Heavy precipitation, strongly perceptible.
                switch (precipitationType) {
                    case "RAIN":
                        minute.condition = "HEAVY_RAIN";
                        break;
                    case "SNOW":
                        minute.condition = "HEAVY_SNOW";
                        break;
                    default:
                        minute.condition = precipitationType;
                        break;
                }

                minute.summaryCondition = precipitationType;
                minute.clear = false;
            } else if (minute.perceivedPrecipitationIntensity > 1) {
                // Moderate precipitation, clearly perceptible.
                switch (precipitationType) {
                    case "RAIN":
                        minute.condition = "RAIN";
                        break;
                    case "SNOW":
                        minute.condition = "SNOW";
                        break;
                    default:
                        minute.condition = precipitationType;
                        break;
                }
                minute.summaryCondition = precipitationType;
                minute.clear = false;
            } else if (minute.perceivedPrecipitationIntensity > 0.1) {
                // Apple Weather displays no precipitation when perceivedPrecipitationIntensity is below 0.1.
                // Light precipitation that can be perceived.
                switch (precipitationType) {
                    case "RAIN":
                        minute.condition = "DRIZZLE";
                        break;
                    case "SNOW":
                        minute.condition = "FLURRIES";
                        break;
                    default:
                        minute.condition = precipitationType;
                        break;
                }
                minute.summaryCondition = precipitationType;
                minute.clear = false;
            } else if (minute.perceivedPrecipitationIntensity > 0) {
                // Possible precipitation.
                switch (precipitationType) {
                    case "RAIN":
                        minute.condition = "POSSIBLE_DRIZZLE";
                        break;
                    case "SNOW":
                        minute.condition = "POSSIBLE_FLURRIES";
                        break;
                    default:
                        minute.condition = `POSSIBLE_${precipitationType}`;
                        break;
                }
                minute.summaryCondition = precipitationType;
                minute.clear = false;
            } else {
                minute.condition = "CLEAR";
                minute.summaryCondition = "CLEAR";
                minute.clear = true;
            }
            //Console.debug(`minutes[${i}]`, JSON.stringify(minute, null, 2));
            return minute;
        });

        Console.info("✅ Minute");
        return minutes;
    }

    static Summary(minutes = []) {
        Console.info("☑️ Summary");
        const Summaries = [];
        const Summary = {
            condition: "CLEAR",
            startTime: 0,
            precipitationChance: 0,
            precipitationIntensity: 0,
            //beginCondition: "",
            //endCondition: "",
            maxCondition: "",
            clear: true,
        };
        const Length = Math.min(71, minutes.length);
        for (let i = 0; i < Length; i++) {
            const minute = minutes[i];
            const previousMinute = minutes[i - 1];
            switch (i) {
                case 0: // First item.
                    Summary.startTime = minute.startTime;
                    Summary.condition = minute.summaryCondition; // condition only tracks precipitation type, not intensity detail.
                    Summary.precipitationChance = minute.precipitationChance;
                    Summary.precipitationIntensity = minute.precipitationIntensity;
                    //Summary.beginCondition = minute.condition;
                    //Summary.endCondition = "";
                    Summary.maxCondition = minute.condition;
                    Summary.clear = minute.clear;
                    break;
                case Length - 1: // Last item.
                    Summary.endTime = 0; // Empty values must be written as zero.
                    //Summary.endCondition = minute.condition;
                    Summary.clear = minute.clear;
                    Console.debug(`Summaries[${i}]`, JSON.stringify({ ...minute, ...Summary }, null, 2));
                    Summaries.push({ ...Summary });
                    break;
                default: // Middle items.
                    if (minute.summaryCondition !== previousMinute.summaryCondition) {
                        // Finish the current summary.
                        Summary.endTime = minute.startTime;
                        //Summary.endCondition = previousMinute.condition;
                        Console.debug(`Summaries[${i}]`, JSON.stringify({ ...previousMinute, ...Summary }, null, 2));
                        Summaries.push({ ...Summary });

                        // Start a new summary.
                        Summary.startTime = minute.startTime;
                        Summary.condition = minute.summaryCondition; // condition only tracks precipitation type, not intensity detail.
                        Summary.precipitationChance = minute.precipitationChance;
                        Summary.precipitationIntensity = minute.precipitationIntensity;
                        //Summary.beginCondition = minute.condition;
                        //Summary.endCondition = ""; // Reset.
                        Summary.maxCondition = minute.condition; // Reset.
                        Summary.clear = minute.clear;
                    } else {
                        // Same condition; update the maximum value.
                        Summary.precipitationChance = Math.max(Summary.precipitationChance, minute.precipitationChance);
                        Summary.precipitationIntensity = Math.max(Summary.precipitationIntensity, minute.precipitationIntensity);
                        if (Summary.precipitationIntensity === minute.precipitationIntensity) Summary.maxCondition = minute.condition;
                    }
                    break;
            }
        }
        Console.debug(`Summaries: ${JSON.stringify(Summaries, null, 2)}`);
        Console.info("✅ Summary");
        return Summaries;
    }

    static Condition(summaries = []) {
        Console.info("☑️ Condition");
        const Conditions = [];
        // Use summaries to decide the overall pattern first.
        switch (summaries.map(summary => summary.clear).join("|")) {
            case "true": {
                // All CLEAR, no precipitation: CLEAR.
                const CLEAR = summaries[0]; // CLEAR period.
                // Show CLEAR during the CLEAR period.
                Conditions.push({
                    beginCondition: CLEAR.maxCondition,
                    endCondition: CLEAR.maxCondition,
                    forecastToken: "CLEAR",
                    parameters: [],
                    startTime: CLEAR.startTime,
                    endTime: 0, // CLEAR period.
                });
                break;
            }
            case "false": {
                // All precipitation: CONSTANT.
                const CONSTANT = summaries[0]; // CONSTANT period.
                // Show CONSTANT during the CONSTANT period.
                Conditions.push({
                    beginCondition: CONSTANT.maxCondition,
                    endCondition: CONSTANT.maxCondition,
                    forecastToken: "CONSTANT",
                    parameters: [],
                    startTime: CONSTANT.startTime, // CONSTANT period.
                    endTime: 0, // CONSTANT period.
                });
                break;
            }
            case "true|false": {
                // CLEAR followed by precipitation: START.
                const CLEAR = summaries[0]; // START period.
                const START = summaries[1]; // CONSTANT period.
                // Show START during the CLEAR period.
                Conditions.push({
                    beginCondition: START.maxCondition,
                    endCondition: START.maxCondition,
                    forecastToken: "START",
                    parameters: [{ date: START.startTime, type: "FIRST_AT" }], // Precipitation starts.
                    startTime: CLEAR.startTime, // CLEAR period.
                    endTime: CLEAR.endTime, // CLEAR period.
                });
                // Show CONSTANT during the START period.
                Conditions.push({
                    beginCondition: START.maxCondition,
                    endCondition: START.maxCondition,
                    forecastToken: "CONSTANT",
                    parameters: [],
                    startTime: START.startTime, // START period.
                    endTime: 0, // START period.
                });
                break;
            }
            case "false|true": {
                // Precipitation followed by CLEAR: STOP.
                const STOP = summaries[0]; // STOP period.
                const CLEAR = summaries[1]; // CLEAR period.
                // Show STOP during the STOP period.
                Conditions.push({
                    beginCondition: STOP.maxCondition,
                    endCondition: STOP.maxCondition,
                    forecastToken: "STOP",
                    parameters: [{ date: STOP.endTime, type: "FIRST_AT" }], // Precipitation ends.
                    startTime: STOP.startTime, // STOP period.
                    endTime: STOP.endTime, // STOP period.
                });
                // Show CLEAR during the CLEAR period.
                Conditions.push({
                    beginCondition: CLEAR.maxCondition,
                    endCondition: CLEAR.maxCondition,
                    forecastToken: "CLEAR",
                    parameters: [],
                    startTime: CLEAR.startTime, // CLEAR period.
                    endTime: 0, // CLEAR period.
                });
                break;
            }
            case "false|true|false": {
                // Precipitation, then CLEAR, then precipitation: STOP_START.
                const STOP = summaries[0]; // STOP period.
                const CLEAR = summaries[1]; // START period.
                const START = summaries[2]; // START period.
                // Show STOP_START during the STOP period.
                Conditions.push({
                    beginCondition: STOP.maxCondition, // First precipitation starts.
                    endCondition: START.maxCondition, // First precipitation ends.
                    forecastToken: "STOP_START",
                    parameters: [
                        { date: STOP.endTime, type: "FIRST_AT" }, // First precipitation ends.
                        { date: START.startTime, type: "SECOND_AT" }, // Second precipitation starts.
                    ],
                    startTime: STOP.startTime, // STOP period.
                    endTime: STOP.endTime, // STOP period.
                });
                // Show START during the CLEAR period.
                Conditions.push({
                    beginCondition: START.maxCondition,
                    endCondition: START.maxCondition,
                    forecastToken: "START",
                    parameters: [{ date: START.startTime, type: "FIRST_AT" }],
                    startTime: CLEAR.startTime, // CLEAR period.
                    endTime: CLEAR.endTime, // CLEAR period.
                });
                // Show CONSTANT during the START period.
                Conditions.push({
                    beginCondition: START.maxCondition,
                    endCondition: START.maxCondition,
                    forecastToken: "CONSTANT",
                    parameters: [],
                    startTime: START.startTime, // START period.
                    endTime: 0, // START period.
                });
                break;
            }
            case "true|false|true": {
                // CLEAR, then precipitation, then CLEAR: START_STOP.
                const CLEAR1 = summaries[0]; // START_STOP period.
                const STOP = summaries[1]; // STOP period.
                const CLEAR2 = summaries[2]; // CLEAR period.
                // Show START_STOP during the CLEAR1 period.
                Conditions.push({
                    beginCondition: STOP.maxCondition, // START condition for STOP.
                    endCondition: STOP.maxCondition, // END condition for STOP.
                    forecastToken: "START_STOP",
                    parameters: [
                        { date: STOP.startTime, type: "FIRST_AT" },
                        { date: STOP.endTime, type: "SECOND_AT" },
                    ],
                    startTime: CLEAR1.startTime, // CLEAR1 period.
                    endTime: CLEAR1.endTime, // CLEAR1 period.
                });
                // Show STOP during the STOP period.
                Conditions.push({
                    beginCondition: STOP.maxCondition, // START condition for STOP.
                    endCondition: STOP.maxCondition, // END condition for STOP.
                    forecastToken: "STOP",
                    parameters: [{ date: STOP.endTime, type: "FIRST_AT" }],
                    startTime: STOP.startTime, // STOP period.
                    endTime: STOP.endTime, // STOP period.
                });
                // Show CLEAR during the CLEAR2 period.
                Conditions.push({
                    beginCondition: CLEAR2.maxCondition, // CLEAR2 period.
                    endCondition: CLEAR2.maxCondition, // CLEAR2 period.
                    forecastToken: "CLEAR",
                    parameters: [],
                    startTime: CLEAR2.startTime, // CLEAR2 period.
                    endTime: 0, // CLEAR2 period.
                });
                break;
            }
            case "false|true|false|true": {
                // Precipitation, CLEAR, precipitation, then CLEAR: STOP_START + START_STOP.
                const STOP1 = summaries[0]; // STOP period 1.
                const CLEAR1 = summaries[1]; // CLEAR period 1.
                const STOP2 = summaries[2]; // STOP period 2.
                const CLEAR2 = summaries[3]; // CLEAR period 2.
                // Show STOP_START during the STOP1 period.
                Conditions.push({
                    beginCondition: STOP1.maxCondition, // START condition for STOP1.
                    endCondition: STOP2.maxCondition, // START condition for STOP2.
                    forecastToken: "STOP_START",
                    parameters: [
                        { date: STOP1.endTime, type: "FIRST_AT" }, // STOP1 ends.
                        { date: STOP2.startTime, type: "SECOND_AT" }, // STOP2 starts.
                    ],
                    startTime: STOP1.startTime, // STOP1 period.
                    endTime: STOP1.endTime, // STOP1 period.
                });
                // Show START_STOP during the CLEAR1 period.
                Conditions.push({
                    beginCondition: STOP2.maxCondition, // STOP period 2.
                    endCondition: STOP2.maxCondition, // STOP period 2.
                    forecastToken: "START_STOP",
                    parameters: [
                        { date: STOP2.startTime, type: "FIRST_AT" }, // STOP2 starts.
                        { date: STOP2.endTime, type: "SECOND_AT" }, // STOP2 ends.
                    ],
                    startTime: CLEAR1.startTime, // CLEAR1 period.
                    endTime: CLEAR1.endTime, // CLEAR1 period.
                });
                // Show STOP during the STOP2 period.
                Conditions.push({
                    beginCondition: STOP2.maxCondition, // STOP period.
                    endCondition: STOP2.maxCondition, // STOP period.
                    forecastToken: "STOP",
                    parameters: [{ date: STOP2.endTime, type: "FIRST_AT" }],
                    startTime: STOP2.startTime, // STOP2 period.
                    endTime: STOP2.endTime, // STOP2 period.
                });
                // Show CLEAR during the CLEAR2 period.
                Conditions.push({
                    beginCondition: CLEAR2.maxCondition, // CLEAR period.
                    endCondition: CLEAR2.maxCondition, // CLEAR period.
                    forecastToken: "CLEAR",
                    parameters: [],
                    startTime: CLEAR2.startTime, // CLEAR2 period.
                    endTime: 0, // CLEAR2 period.
                });
                break;
            }
            case "true|false|true|false": {
                // CLEAR, precipitation, CLEAR, then precipitation: START_STOP + STOP_START.
                const CLEAR1 = summaries[0]; // CLEAR1 period.
                const START1 = summaries[1]; // START1 period.
                const CLEAR2 = summaries[2]; // CLEAR2 period.
                const START2 = summaries[3]; // START2 period.
                // Show START_STOP during the CLEAR1 period.
                Conditions.push({
                    beginCondition: START1.maxCondition, // START condition for START1.
                    endCondition: START1.maxCondition, // END condition for START1.
                    forecastToken: "START_STOP",
                    parameters: [
                        { date: START1.startTime, type: "FIRST_AT" }, // CLEAR1 ends.
                        { date: START1.endTime, type: "SECOND_AT" }, // CLEAR2 starts.
                    ],
                    startTime: CLEAR1.startTime, // CLEAR1 period.
                    endTime: CLEAR1.endTime, // CLEAR1 period.
                });
                // Show STOP_START during the START1 period.
                Conditions.push({
                    beginCondition: START1.maxCondition, // END condition for START1.
                    endCondition: START2.maxCondition, // START condition for START2.
                    forecastToken: "STOP_START",
                    parameters: [
                        { date: START1.endTime, type: "FIRST_AT" }, // START1 ends.
                        { date: START2.startTime, type: "SECOND_AT" }, // START2 starts.
                    ],
                    startTime: START1.startTime, // START1 period.
                    endTime: START1.endTime, // START1 period.
                });
                // Show START during the CLEAR2 period.
                Conditions.push({
                    beginCondition: START2.maxCondition, // START2.beginCondition; START condition for START2.
                    endCondition: START2.maxCondition, // START condition for START2.
                    forecastToken: "START",
                    parameters: [{ date: START2.startTime, type: "FIRST_AT" }],
                    startTime: CLEAR2.startTime, // CLEAR2 period.
                    endTime: CLEAR2.endTime, // CLEAR2 period.
                });
                // Show CONSTANT during the START2 period.
                Conditions.push({
                    beginCondition: START2.maxCondition, // START2 period.
                    endCondition: START2.maxCondition, // START2 period.
                    forecastToken: "CONSTANT",
                    parameters: [],
                    startTime: START2.startTime, // START2 period.
                    endTime: 0, // START2 period.
                });
                break;
            }
        }
        Console.debug(`Conditions: ${JSON.stringify(Conditions, null, 2)}`);
        Console.info("✅ Condition");
        return Conditions;
    }

    static #ConvertPrecipitationIntensity(precipitationIntensity, units = "mmph") {
        //Console.info("☑️ ConvertPrecipitationIntensity");
        //Console.debug(`precipitationIntensity: ${precipitationIntensity}`, `units: ${units}`);
        const Range = ForecastNextHour.#Configs.Precipitation.Range[units];
        let perceivedPrecipitationIntensity = 0;

        if (precipitationIntensity === 0) {
            // No precipitation.
            perceivedPrecipitationIntensity = 0;
        } else if (precipitationIntensity > Range.NO[0] && precipitationIntensity <= Range.NO[1]) {
            // Very light precipitation, usually not perceptible.
            perceivedPrecipitationIntensity = 0; // Very light precipitation is usually not perceptible.
        } else if (precipitationIntensity > Range.LIGHT[0] && precipitationIntensity <= Range.LIGHT[1]) {
            // Light precipitation, perceptible.
            // Calculate perceived intensity in the 0-1 range.
            perceivedPrecipitationIntensity = Math.min(1, (precipitationIntensity - Range.LIGHT[0]) / (Range.LIGHT[1] - Range.LIGHT[0]));
        } else if (precipitationIntensity > Range.MODERATE[0] && precipitationIntensity <= Range.MODERATE[1]) {
            // Moderate precipitation, clearly perceptible.
            // Calculate perceived intensity in the 1-2 range.
            perceivedPrecipitationIntensity = 1 + Math.min(1, (precipitationIntensity - Range.MODERATE[0]) / (Range.MODERATE[1] - Range.MODERATE[0]));
        } else if (precipitationIntensity > Range.HEAVY[0]) {
            // Heavy precipitation, strongly perceptible.
            // Calculate perceived intensity in the 2-3 range.
            perceivedPrecipitationIntensity = 2 + Math.min(1, (precipitationIntensity - Range.HEAVY[0]) / (Range.HEAVY[1] - Range.HEAVY[0]));
        }

        // Use Math.trunc to keep three decimal places; this truncates instead of rounding.
        perceivedPrecipitationIntensity = Math.trunc(perceivedPrecipitationIntensity * 1000) / 1000;

        //Console.debug(`perceivedPrecipitationIntensity: ${perceivedPrecipitationIntensity}`);
        //Console.info(`✅ ConvertPrecipitationIntensity`);
        return perceivedPrecipitationIntensity;
    }
}
