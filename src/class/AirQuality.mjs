import { Console } from "@nsnanocat/util";
import SimplePrecisionMath from "./SimplePrecisionMath.mjs";

export default class AirQuality {
    static Name = "AirQuality";
    static Version = "3.1.0";
    static Author = "Virgil Clyne & Wordless Echo";

    static #CeilByPrecision(a, b) {
        // Get the number of decimal places in b.
        const decimals = (b.toString().split(".")[1] || "").length;

        // Build a precision multiplier from the decimal length.
        const multiplier = 10 ** decimals;

        // Round upward at the same precision.
        return Math.ceil(a * multiplier) / multiplier;
    }

    /**
     * Find the categoryIndex for a given AQI index value.
     *
     * Purpose:
     * - Find the range that contains the index in categories.ranges.
     * - Return the matching categoryIndex for primary-pollutant selection and UI categorization.
     *
     * @param {number} index
     * AQI index value to classify.
     *
     * @param {{
     *   ranges?: Array<{ categoryIndex: number, indexes: [number, number] }>
     * }} categories
     * Category configuration object.
     * - ranges[*].indexes is a [min, max] range.
     * - #CeilByPrecision is used before range comparison to normalize decimal precision.
     *
     * @returns {number}
     * Matching categoryIndex. Returns -1 when categories are invalid or no range matches.
     */

    static CategoryIndex(index, categories) {
        Console.info("☑️ CategoryIndex", `index: ${index}`);

        const failedCategoryIndex = -1;

        if (!categories?.ranges || !Array.isArray(categories.ranges) || categories.ranges.length === 0) {
            Console.debug(`categories: ${JSON.stringify(categories)}`);
            Console.error("GetPrimaryPollutant", "Invalid categories");
            return failedCategoryIndex;
        }

        const range = categories.ranges.find(({ indexes }) => {
            const [min, max] = indexes;
            return AirQuality.#CeilByPrecision(index, min) >= min && AirQuality.#CeilByPrecision(index, max) <= max;
        });
        if (!range) {
            Console.error("CategoryIndex", `No category found for index: ${index}`);
            return failedCategoryIndex;
        }

        Console.info("✅ CategoryIndex", `categoryIndex: ${range.categoryIndex}`);
        return range.categoryIndex;
    }

    static CompareCategoryIndexes(todayCategoryIndex, yesterdayCategoryIndex) {
        Console.info("☑️ CompareCategoryIndexes", `todayCategoryIndex: ${todayCategoryIndex}`, `yesterdayCategoryIndex: ${yesterdayCategoryIndex}`);

        const { UNKNOWN, SAME, WORSE, BETTER } = AirQuality.Config.CompareCategoryIndexes;
        const diff = Number(todayCategoryIndex) - Number(yesterdayCategoryIndex);

        if (Number.isNaN(diff)) {
            Console.error("CompareCategoryIndexes", "Invalid categoryIndex");
            return UNKNOWN;
        } else {
            if (diff === 0) {
                Console.info("✅ CompareCategoryIndexes");
                return SAME;
            } else if (diff > 0) {
                Console.info("✅ CompareCategoryIndexes");
                return WORSE;
            } else {
                Console.info("✅ CompareCategoryIndexes");
                return BETTER;
            }
        }
    }

    static ConvertUnits(pollutants, stpConversionFactors, pollutantScales) {
        Console.info("☑️ ConvertUnits");

        const friendlyUnits = AirQuality.Config.Units.Friendly;

        const convertedPollutants = pollutants
            .map(pollutant => {
                const pollutantScale = pollutantScales[pollutant.pollutantType];

                if (!pollutantScale) {
                    Console.info("ConvertUnits", `No scale for ${pollutant.pollutantType}, skip`);
                    return pollutant;
                }

                if (!pollutant.units || !Number.isFinite(Number(pollutant.amount))) {
                    Console.warn("ConvertUnits", `Skip invalid pollutant ${pollutant.pollutantType}`, `amount: ${pollutant.amount}`, `units: ${pollutant.units}`);
                    return undefined;
                }

                Console.info("ConvertUnits", `Converting ${pollutant.pollutantType}`);
                const amount = AirQuality.ConvertUnit(pollutant.amount, pollutant.units, pollutantScale.units, stpConversionFactors?.[pollutant.pollutantType] || -1, pollutantScale?.stpConversionFactor || -1);
                if (amount < 0) {
                    Console.error(
                        "ConvertUnits",
                        `Unable to convert units for ${pollutant.pollutantType}`,
                        `${pollutant.amount} ${friendlyUnits[pollutant.units] ?? pollutant.units} (STP conversion factor: ${stpConversionFactors?.[pollutant.pollutantType] || -1}) -> ${amount} ${friendlyUnits[pollutantScale.units] ?? pollutantScale.units} (STP conversion factor: ${pollutantScale?.stpConversionFactor || -1})`,
                    );
                    return pollutant;
                }

                Console.info("ConvertUnits", `Converted ${pollutant.pollutantType}: ${amount} ${friendlyUnits[pollutantScale.units] ?? pollutantScale.units}`);
                return { ...pollutant, amount, units: pollutantScale.units };
            })
            .filter(Boolean);
        Console.info("✅ ConvertUnits");
        return convertedPollutants;
    }

    /**
     * Normalize pollutant units.
     *
     * Notes:
     * - This is the shared entry point for air-quality normalization, currently focused on pollutant units.
     * - QWeather reports CO in mg/m3, while WeatherKit expects ug/m3.
     * - Add future provider-specific fixes here; this method can be promoted to FixAirQuality if needed.
     *
     * @param {any} airQuality - Air-quality object.
     * @returns {any} Air-quality object after unit normalization.
     */
    static FixPollutantsUnits(airQuality) {
        Console.info("☑️ FixPollutantsUnits");
        switch (airQuality?.metadata?.providerName) {
            case "\u548c\u98ce\u5929\u6c14":
            case "QWeather": {
                airQuality.pollutants = airQuality?.pollutants?.map(pollutant => {
                    switch (pollutant.pollutantType) {
                        case "CO": {
                            const { mgm3, ugm3 } = AirQuality.Config.Units.WeatherKit;
                            pollutant.amount = AirQuality.ConvertUnit(pollutant.amount, mgm3, ugm3);
                            break;
                        }
                        default:
                            break;
                    }
                    return pollutant;
                });
                break;
            }
            default: {
                Console.info(`Provider ${airQuality?.metadata?.providerName} is no need to fix.`);
                break;
            }
        }
        Console.info("✅ FixPollutantsUnits");
        return airQuality;
    }

    static #GetStpConversionFactors(airQuality) {
        Console.info("☑️ GetStpConversionFactors");

        switch (airQuality?.metadata?.providerName) {
            case "\u548c\u98ce\u5929\u6c14":
            case "QWeather":
            case "BreezoMeter":
            default: {
                Console.info("✅ GetStpConversionFactors", `STP conversion factors for ${airQuality?.metadata?.providerName}: US`);
                return AirQuality.Config.STP_ConversionFactors.US;
            }
        }
    }

    static Pollutants2AQI(airQuality, Settings, options = {}) {
        Console.info("☑️ Pollutants2AQI");
        const algorithm = options?.algorithm ?? Settings?.AirQuality?.Calculate?.Algorithm;
        const forcePrimaryPollutant = options?.forcePrimaryPollutant ?? Settings?.AirQuality?.Current?.Index?.ForceCNPrimaryPollutants;
        const allowOverRange = options?.allowOverRange ?? Settings?.AirQuality?.Calculate?.AllowOverRange;

        const stpConversionFactors = AirQuality.#GetStpConversionFactors(airQuality);
        const scale = AirQuality.Config.Scales[algorithm] ?? AirQuality.Config.Scales.UBA;

        switch (algorithm) {
            case "None": {
                return airQuality;
            }
            case "EU_EAQI": {
                // PollutantsToEAQI
                Console.info("☑️ PollutantsToEAQI");
                airQuality = AirQuality.#PollutantsToAirQuality(airQuality.pollutants, scale, { stpConversionFactors, allowOverRange: false });
                Console.info("✅ PollutantsToEAQI");
                break;
            }
            case "WAQI_InstantCast_US": {
                // PollutantsToInstantCastUS
                Console.info("☑️ PollutantsToInstantCastUS", `allowOverRange: ${allowOverRange}`);
                airQuality = AirQuality.#PollutantsToAirQuality(airQuality.pollutants, scale, { stpConversionFactors, allowOverRange });
                Console.info("✅ PollutantsToInstantCastUS");
                break;
            }
            case "WAQI_InstantCast_CN":
            case "WAQI_InstantCast_CN_25_DRAFT": {
                // PollutantsToInstantCastCN12 / PollutantsToInstantCastCN25 / #PollutantsToInstantCastCN
                Console.info("☑️ PollutantsToInstantCastCN", `allowOverRange: ${allowOverRange}`, `forcePrimaryPollutant: ${forcePrimaryPollutant}`);
                airQuality = AirQuality.#PollutantsToAirQuality(airQuality.pollutants, scale, { stpConversionFactors, allowOverRange });

                const isNotAvailable = !forcePrimaryPollutant && airQuality.index <= 50;
                if (isNotAvailable) {
                    Console.info("PollutantsToInstantCastCN", `Max index of pollutants ${airQuality.primaryPollutant} = ${airQuality.index} is <= 50, primaryPollutant will be set to NOT_AVAILABLE.`);
                }

                airQuality = {
                    ...airQuality,
                    primaryPollutant: isNotAvailable ? "NOT_AVAILABLE" : airQuality.primaryPollutant,
                };
                Console.info("✅ PollutantsToInstantCastCN");
                break;
            }
            case "UBA":
            default: {
                // PollutantsToUBA
                Console.info("☑️ PollutantsToUBA");
                airQuality = AirQuality.#PollutantsToAirQuality(airQuality.pollutants, scale, { stpConversionFactors, allowOverRange: true });
                airQuality = {
                    ...airQuality,
                    index: airQuality.categoryIndex,
                };
                Console.info("✅ PollutantsToUBA");
                break;
            }
        }

        Console.info("✅ Pollutants2AQI");
        return airQuality;
    }

    static ConvertPollutants(airQuality, injectedPollutants, needInjectIndex, injectedIndex, Settings) {
        const unitsMode = Settings?.AirQuality?.Current?.Pollutants?.Units?.Mode || "Scale";
        Console.info("☑️ ConvertPollutants", `mode: ${unitsMode}`);

        const getScale = scaleName => {
            const scales = AirQuality.Config.Scales;
            switch (scaleName) {
                case scales.HJ6332012.weatherKitScale.name:
                    return scales.WAQI_InstantCast_CN;
                case scales.EPA_NowCast.weatherKitScale.name:
                    return scales.WAQI_InstantCast_US;
                case scales.EU_EAQI.weatherKitScale.name:
                    return scales.EU_EAQI;
                default:
                    return scales[scaleName];
            }
        };

        const getPollutantScales = pollutantScales => {
            const { ugm3, ppb } = AirQuality.Config.Units.WeatherKit;
            const { US, EU } = AirQuality.Config.STP_ConversionFactors;
            const ugm3Scale = {
                OZONE: { units: ugm3, stpConversionFactor: -1 },
                NO2: { units: ugm3, stpConversionFactor: -1 },
                SO2: { units: ugm3, stpConversionFactor: -1 },
                CO: { units: ugm3, stpConversionFactor: -1 },
                C6H6: { units: ugm3, stpConversionFactor: -1 },
                NH3: { units: ugm3, stpConversionFactor: -1 },
                NO: { units: ugm3, stpConversionFactor: -1 },
            };
            const usPpbScale = {
                OZONE: { units: ppb, stpConversionFactor: US.OZONE },
                NO2: { units: ppb, stpConversionFactor: US.NO2 },
                SO2: { units: ppb, stpConversionFactor: US.SO2 },
                CO: { units: ppb, stpConversionFactor: US.CO },
                C6H6: { units: ppb, stpConversionFactor: US.C6H6 },
                NH3: { units: ppb, stpConversionFactor: US.NH3 },
                NO: { units: ppb, stpConversionFactor: US.NO },
            };
            const euPpbScale = {
                OZONE: { units: ppb, stpConversionFactor: EU.OZONE },
                NO2: { units: ppb, stpConversionFactor: EU.NO2 },
                SO2: { units: ppb, stpConversionFactor: EU.SO2 },
                CO: { units: ppb, stpConversionFactor: EU.CO },
                C6H6: { units: ppb, stpConversionFactor: EU.C6H6 },
                NH3: { units: ppb, stpConversionFactor: EU.NH3 },
                NO: { units: ppb, stpConversionFactor: EU.NO },
            };

            switch (unitsMode) {
                case "ugm3":
                    return { ...ugm3Scale, ...pollutantScales };
                case "EU_ppb":
                    return { ...euPpbScale, ...pollutantScales };
                case "US_ppb":
                    return { ...usPpbScale, ...pollutantScales };
                case "Force_ugm3":
                    return ugm3Scale;
                case "Force_EU_ppb":
                    return euPpbScale;
                case "Force_US_ppb":
                    return usPpbScale;
                case "Scale":
                default:
                    return pollutantScales;
            }
        };

        const replaceUnits = Settings?.AirQuality?.Current?.Pollutants?.Units?.Replace ?? [];
        const isIndexInjected = needInjectIndex && injectedIndex?.metadata && !injectedIndex.metadata.temporarilyUnavailable;
        const scaleName = AirQuality.GetNameFromScale(isIndexInjected ? injectedIndex?.scale : airQuality?.scale);

        const pollutants = injectedPollutants?.metadata && !injectedPollutants.metadata.temporarilyUnavailable ? injectedPollutants.pollutants : airQuality?.pollutants;
        Console.info("✅ ConvertPollutants");
        if (!Array.isArray(pollutants) || pollutants.length === 0) return pollutants ?? [];
        if (replaceUnits.includes(scaleName)) {
            if (isIndexInjected && Settings?.AirQuality?.Current?.Index?.Provider === "Calculate" && unitsMode === "Scale") {
                Console.info("ConvertPollutants", `Use pollutants from iRingo`);
                return injectedIndex.pollutants;
            } else {
                const scale = getScale(scaleName);
                if (!scale) {
                    Console.error("ConvertPollutants", `Unsupported scale name: ${scaleName}`);
                    return pollutants;
                }

                return AirQuality.ConvertUnits(pollutants, AirQuality.#GetStpConversionFactors(airQuality), getPollutantScales(scale.pollutants));
            }
        } else {
            return pollutants;
        }
    }

    static ToWeatherKitScale = ({ name, version }) => `${name}.${version}`;
    static GetNameFromScale(scale) {
        Console.info("☑️ GetNameFromScale", `scale: ${scale}`);

        const lastDotIndex = scale?.lastIndexOf(".");
        if (!scale || lastDotIndex === -1) {
            Console.error("GetNameFromScale", `Unable to find version number in scale: ${scale}`);
            return scale;
        }

        const scaleName = scale.substring(0, lastDotIndex);
        Console.info("✅ GetNameFromScale", `scaleName: ${scaleName}`);
        return scaleName;
    }

    /**
     * Choose the algorithm used for yesterday comparison from the configured comparison source and current scale.
     * - Calculate: use the user-configured algorithm directly.
     * - QWeather: always use China InstantCast.
     * - WeatherKit: map the current scale to a built-in algorithm.
     * @param {any} airQuality - Current air-quality object, used to read scale.
     * @param {any} Settings - Global settings object.
     * @returns {string} Selected algorithm name. Returns an empty string when no algorithm matches.
     */
    static chooseAlogrithm(airQuality, Settings) {
        Console.info("☑️ chooseAlogrithm", `currentIndexProvider: ${Settings?.AirQuality?.Comparison?.Yesterday?.IndexProvider}`);

        switch (Settings?.AirQuality?.Comparison?.Yesterday?.IndexProvider) {
            case "Calculate": {
                Console.info("✅ chooseAlogrithm", `algorithm: ${Settings?.AirQuality?.Calculate?.Algorithm}`);
                return Settings?.AirQuality?.Calculate?.Algorithm;
            }
            case "QWeather": {
                Console.info("✅ chooseAlogrithm", `algorithm: WAQI_InstantCast_CN`);
                return "WAQI_InstantCast_CN";
            }
            case "WeatherKit": {
                const currentScale = AirQuality.GetNameFromScale(airQuality?.scale);
                const scales = AirQuality.Config.Scales;

                if (currentScale === scales.HJ6332012.weatherKitScale.name) {
                    Console.info("✅ chooseAlogrithm", `algorithm: WAQI_InstantCast_CN`);
                    return "WAQI_InstantCast_CN";
                } else if (currentScale === scales.EPA_NowCast.weatherKitScale.name) {
                    Console.info("✅ chooseAlogrithm", `algorithm: WAQI_InstantCast_US`);
                    return "WAQI_InstantCast_US";
                } else {
                    const supportedScales = [scales.EU_EAQI.weatherKitScale.name, scales.UBA.weatherKitScale.name];
                    if (supportedScales.includes(currentScale)) {
                        Console.info("✅ chooseAlogrithm", `algorithm: ${currentScale}`);
                        return currentScale;
                    }

                    Console.error("chooseAlogrithm", "No suitable built-in algorithm found");
                    return "";
                }
            }
            default: {
                Console.error("chooseAlogrithm", "Unknown currentIndexProvider");
                return "";
            }
        }
    }

    /**
     * Append an air-quality standard description to providerName.
     * @param {any} airQuality - Air-quality object.
     * @param {any} Settings - Global settings object.
     * @returns {string} providerName with a standard description.
     */
    static appendScaleToProviderName(airQuality, Settings) {
        const providerName = airQuality?.metadata?.providerName;
        switch (providerName) {
            case "\u548c\u98ce\u5929\u6c14":
            case "QWeather":
                return `${providerName === "\u548c\u98ce\u5929\u6c14" ? "QWeather" : providerName} (China AQI, 2012-02 edition)`;
            case "iRingo":
                switch (Settings?.AirQuality?.Calculate?.Algorithm) {
                    case "EU_EAQI":
                        return `${providerName} (ETC HE Report 2024/17)`;
                    case "WAQI_InstantCast_US":
                        return `${providerName} (WAQI InstantCast with EPA-454/B-24-002)`;
                    case "WAQI_InstantCast_CN":
                        return `${providerName} (InstantCast with HJ 633—2012)`;
                    case "WAQI_InstantCast_CN_25_DRAFT":
                        return `${providerName} (InstantCast with HJ 633 2025 DRAFT)`;
                    case "UBA":
                    default:
                        return `${providerName} (FB001846)`;
                }
            default:
                return providerName;
        }
    }

    /**
     * Calculate a single pollutant index under the target standard.
     *
     * @param {{pollutantType: string, amount: number, units: string}} pollutant
     * Single pollutant data.
     *
     * @param {string} pollutantType
     * Pollutant type, such as OZONE, PM2_5, or NO2.
     *
     * @param {{
     *   units: string,
     *   ranges: {
     *     min: { indexes: [number, number], amounts: [number, number] },
     *     max: { indexes: [number, number], amounts: [number, number] },
     *     value: Array<{ indexes: [number, number], amounts: [number, number] }>
     *   }
     * }} pollutantScale
     * Segment thresholds and units for this pollutant under the target standard.
     *
     * @param {Record<string, string>} friendlyUnits
     * Friendly unit map used for log output.
     *
     * @returns {number}
     * Pollutant index. Returns min.indexes[0] below the minimum threshold and extrapolates from the max range above the limit.
     */
    static #ComputePollutantIndex(pollutant, pollutantType, pollutantScale, friendlyUnits) {
        if (!pollutantScale) {
            Console.warn("PollutantsToIndexes", `Standard does not define pollutant ${pollutantType}; index will be marked as -1`);
            return -1;
        }

        const { add, subtract, multiply, divide } = SimplePrecisionMath;

        Console.debug(`${pollutantType}: ${pollutant.amount} ${friendlyUnits[pollutant.units] ?? pollutant.units}`);

        const minValidAmount = pollutantScale.ranges.min.amounts[0];
        if (pollutant.amount < minValidAmount) {
            Console.error("PollutantsToIndexes", `Invalid amount for ${pollutantType}: ${pollutant.amount} ${friendlyUnits[pollutantScale.units]} must be >= ${minValidAmount}`);
            return pollutantScale.ranges.min.indexes[0];
        }

        const isOverRange = pollutant.amount > pollutantScale.ranges.max.amounts[1];
        if (isOverRange) {
            Console.warn("PollutantsToIndexes", `Over-range index detected for ${pollutantType}: ${pollutant.amount} ${friendlyUnits[pollutantScale.units]}`);
            Console.warn("PollutantsToIndexes", "Please take care.");
        }

        const { indexes, amounts } = isOverRange
            ? pollutantScale.ranges.max
            : pollutantScale.ranges.value.find(({ amounts }) => {
                  const [minAmount, maxAmount] = amounts;
                  return AirQuality.#CeilByPrecision(pollutant.amount, minAmount) >= minAmount && AirQuality.#CeilByPrecision(pollutant.amount, maxAmount) <= maxAmount;
              });
        Console.debug(`indexes: ${JSON.stringify(indexes)}`, `amounts: ${JSON.stringify(amounts)}`);

        const [minIndex, maxIndex] = indexes;
        const [minAmount, maxAmount] = amounts;
        const index = add(multiply(divide(subtract(maxIndex, minIndex), subtract(maxAmount, minAmount)), subtract(pollutant.amount, minAmount)), pollutant.amount > maxAmount ? maxIndex : minIndex);
        return index;
    }

    /**
     * Map pollutant concentrations to pollutant indexes under the target standard.
     *
     * Purpose:
     * 1) Find the concentration range for each pollutant from pollutantScales.
     * 2) Use #ComputePollutantIndex to calculate each pollutant index.
     * 3) Return { pollutantType, index } values for primary-pollutant selection.
     *
     * @param {Array<{pollutantType: string, amount: number, units: string}>} pollutants
     * Pollutant list.
     * - The units field represents the physical unit of amount, such as ug/m3, mg/m3, ppb, or ppm.
     * - Before entering this method, pollutants should already be aligned to the target units in pollutantScales.
     *
     * @param {Record<string, {
     *   units: string,
     *   ranges: {
     *     min: { indexes: [number, number], amounts: [number, number] },
     *     max: { indexes: [number, number], amounts: [number, number] },
     *     value: Array<{ indexes: [number, number], amounts: [number, number] }>
     *   }
     * }>} pollutantScales
     * Index standard definition, including units and segment thresholds for each pollutant.
     *
     * @returns {Array<{pollutantType: string, index: number}>}
     * Index list for each standard pollutant.
     * - When a pollutant required by the standard is missing, that pollutant returns index=-1.
     */
    static #PollutantsToIndexes(pollutants, pollutantScales) {
        return (Array.isArray(pollutants) ? pollutants : []).map(pollutant => {
            const index = AirQuality.#ComputePollutantIndex(pollutant, pollutant.pollutantType, pollutantScales?.[pollutant.pollutantType], AirQuality.Config.Units.Friendly);
            pollutant.index = index;
            return pollutant;
        });
    }

    static PrimaryPollutant(pollutants, categories) {
        Console.info("☑️ PrimaryPollutant");
        const failedPollutant = { pollutantType: "NOT_AVAILABLE", index: -1, categoryIndex: -1 };

        if (!Array.isArray(pollutants) || pollutants.length === 0) {
            Console.debug(`pollutants: ${JSON.stringify(pollutants)}`);
            Console.error("PrimaryPollutant", "Invalid pollutants");
            return failedPollutant;
        }

        const indexesWithCategory = pollutants
            .filter(({ index }) => Number.isFinite(index))
            .map(pollutant => ({
                ...pollutant,
                categoryIndex: AirQuality.CategoryIndex(pollutant.index, categories),
            }))
            .sort((a, b) => b.index - a.index);

        if (indexesWithCategory.length === 0) {
            Console.debug(`pollutants: ${JSON.stringify(pollutants)}`, `indexesWithCategory: ${JSON.stringify(indexesWithCategory)}`);
            Console.error("PrimaryPollutant", "No valid index found");
            return failedPollutant;
        }

        const maxCategoryIndex = indexesWithCategory.reduce((max, { categoryIndex }) => (categoryIndex > max ? categoryIndex : max), Number.NEGATIVE_INFINITY);
        const primaryPollutants = indexesWithCategory.filter(({ categoryIndex }) => categoryIndex === maxCategoryIndex);

        if (primaryPollutants.length > 1) {
            Console.warn("PrimaryPollutant", `Multiple pollutants share the same category, maxCategoryIndex: ${maxCategoryIndex}`);
            primaryPollutants.map(({ pollutantType, index }) => Console.warn("GetPrimaryPollutants", `${pollutantType}: ${index}`));
        }

        const primaryPollutant = primaryPollutants[0];
        Console.info("✅ PrimaryPollutant", `primaryPollutant: ${JSON.stringify(primaryPollutant)}`);
        return primaryPollutant;
    }

    /**
     * Convert pollutant concentrations into a normalized airQuality object.
     *
     * Purpose:
     * 1) Convert pollutants to target units defined by scale when configured.
     * 2) Calculate pollutant indexes and choose the primary pollutant.
     * 3) Produce a WeatherKit-style airQuality object and clamp the index when required.
     *
     * @param {Array<{pollutantType: string, amount: number, units: string}>} pollutants
     * Raw pollutant array.
     * - The units field of each item determines the physical unit of amount, such as ug/m3, mg/m3, ppb, or ppm.
     *
     * @param {{
     *   weatherKitScale: {name: string, version: string, maxIndex?: number},
     *   pollutants: Record<string, {units: string, stpConversionFactor?: number, ranges: any}>,
     *   categories: {significantIndex: number, ranges: Array<{categoryIndex: number, indexes: number[]}>}
     * }} scale
     * AQI standard configuration.
     * - scale.pollutants[*].units is the target unit.
     * - scale.weatherKitScale.maxIndex is an optional index cap.
     *
     * @param {{
     *   stpConversionFactors?: Record<string, number>,
     *   allowOverRange?: boolean
     * }} [options]
     * Calculation options.
     * - stpConversionFactors: dimensionless unit conversion factor table. When provided, unit conversion runs first.
     * - allowOverRange: whether indexes can exceed maxIndex. Defaults to true.
     *
     * @returns {{
     *   index: number,
     *   isSignificant: boolean,
     *   categoryIndex: number,
     *   pollutants: Array<{pollutantType: string, amount: number, units: string}>,
     *   metadata: {providerName: string, temporarilyUnavailable: boolean},
     *   primaryPollutant: string,
     *   scale: string
     * } | {metadata: {providerName: string, temporarilyUnavailable: boolean}}}
     * Normalized airQuality object. Returns a temporarilyUnavailable result when input is invalid.
     */
    static #PollutantsToAirQuality(pollutants, scale, options = {}) {
        Console.info("☑️ PollutantsToAirQuality");
        const stpConversionFactors = options?.stpConversionFactors;
        const allowOverRange = options?.allowOverRange ?? true;

        if (!Array.isArray(pollutants) || pollutants.length === 0) {
            Console.debug(`pollutants: ${JSON.stringify(pollutants)}`);
            Console.error("PollutantsToAirQuality", "Invalid pollutants");
            return { metadata: { providerName: "iRingo", temporarilyUnavailable: true } };
        }

        let newPollutants = [];
        if (stpConversionFactors) {
            newPollutants = AirQuality.ConvertUnits(pollutants, stpConversionFactors, scale.pollutants);
        }

        newPollutants = AirQuality.#PollutantsToIndexes(newPollutants, scale.pollutants);
        Console.debug("PollutantsToAirQuality", `convertedPollutants: ${JSON.stringify(newPollutants)}`);

        const primaryPollutant = AirQuality.PrimaryPollutant(newPollutants, scale.categories);
        const maxIndex = scale?.weatherKitScale?.maxIndex;
        const index = allowOverRange || !Number.isFinite(maxIndex) ? Math.round(primaryPollutant.index) : Math.min(Math.round(primaryPollutant.index), maxIndex);
        Console.info("✅ PollutantsToAirQuality");
        return {
            index,
            isSignificant: primaryPollutant.categoryIndex >= scale.categories.significantIndex,
            categoryIndex: primaryPollutant.categoryIndex,
            pollutants: newPollutants,
            metadata: { providerName: "iRingo", temporarilyUnavailable: false },
            primaryPollutant: primaryPollutant.pollutantType,
            scale: AirQuality.ToWeatherKitScale(scale.weatherKitScale),
        };
    }

    static Config = {
        Scales: {
            /**
             * LQI (DE) - Der Luftqualitätsindex (LQI) des Umweltbundesamtes
             * Germany Air Quality Index
             * [Der Luftqualitätsindex - LQI | Umweltbundesamt]{@link https://www.umweltbundesamt.de/themen/luft/luftqualitaet/der-luftqualitaetsindex-lqi}
             * [Überarbeitung des UBA LQI nach der Herausgabe der WHO AQG 2021]{@link https://www.umweltbundesamt.de/system/files/medien/11850/publikationen/08_2025_uug.pdf}
             */
            UBA: {
                weatherKitScale: {
                    name: "UBA",
                    version: "2414",
                },
                // Indexes below for calculation only, not for display
                categories: {
                    significantIndex: 4, // schlecht
                    ranges: [
                        { categoryIndex: 1, indexes: [0, 0.99] }, // sehr gut
                        { categoryIndex: 2, indexes: [1, 1.99] }, // gut
                        { categoryIndex: 3, indexes: [2, 2.99] }, // mäßig
                        { categoryIndex: 4, indexes: [3, 3.99] }, // schlecht
                        { categoryIndex: 5, indexes: [4, Number.POSITIVE_INFINITY] }, // sehr schlecht
                    ],
                },
                pollutants: {
                    NO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 0.99], amounts: [0, 10] },
                            max: { indexes: [3, 3.99], amounts: [61, 100] },
                            value: [
                                { indexes: [0, 0.99], amounts: [0, 10] }, // sehr gut
                                { indexes: [1, 1.99], amounts: [11, 30] }, // gut
                                { indexes: [2, 2.99], amounts: [31, 60] }, // mäßig
                                { indexes: [3, 3.99], amounts: [61, 100] }, // schlecht
                                { indexes: [4, Number.POSITIVE_INFINITY], amounts: [101, Number.POSITIVE_INFINITY] }, // sehr schlecht
                            ],
                        },
                    },
                    PM10: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 0.99], amounts: [0, 9] },
                            max: { indexes: [3, 3.99], amounts: [55, 90] },
                            value: [
                                { indexes: [0, 0.99], amounts: [0, 9] }, // sehr gut
                                { indexes: [1, 1.99], amounts: [10, 27] }, // gut
                                { indexes: [2, 2.99], amounts: [28, 54] }, // mäßig
                                { indexes: [3, 3.99], amounts: [55, 90] }, // schlecht
                                { indexes: [4, Number.POSITIVE_INFINITY], amounts: [91, Number.POSITIVE_INFINITY] }, // sehr schlecht
                            ],
                        },
                    },
                    PM2_5: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 0.99], amounts: [0, 5] },
                            max: { indexes: [3, 3.99], amounts: [31, 50] },
                            value: [
                                { indexes: [0, 0.99], amounts: [0, 5] }, // sehr gut
                                { indexes: [1, 1.99], amounts: [6, 15] }, // gut
                                { indexes: [2, 2.99], amounts: [16, 30] }, // mäßig
                                { indexes: [3, 3.99], amounts: [31, 50] }, // schlecht
                                { indexes: [4, Number.POSITIVE_INFINITY], amounts: [51, Number.POSITIVE_INFINITY] }, // sehr schlecht
                            ],
                        },
                    },
                    OZONE: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 0.99], amounts: [0, 24] },
                            max: { indexes: [3, 3.99], amounts: [145, 240] },
                            value: [
                                { indexes: [0, 0.99], amounts: [0, 24] }, // sehr gut
                                { indexes: [1, 1.99], amounts: [25, 72] }, // gut
                                { indexes: [2, 2.99], amounts: [73, 144] }, // mäßig
                                { indexes: [3, 3.99], amounts: [145, 240] }, // schlecht
                                { indexes: [4, Number.POSITIVE_INFINITY], amounts: [241, Number.POSITIVE_INFINITY] }, // sehr schlecht
                            ],
                        },
                    },
                    SO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 0.99], amounts: [0, 10] },
                            max: { indexes: [3, 3.99], amounts: [61, 100] },
                            value: [
                                { indexes: [0, 0.99], amounts: [0, 10] }, // sehr gut
                                { indexes: [1, 1.99], amounts: [11, 30] }, // gut
                                { indexes: [2, 2.99], amounts: [31, 60] }, // mäßig
                                { indexes: [3, 3.99], amounts: [61, 100] }, // schlecht
                                { indexes: [4, Number.POSITIVE_INFINITY], amounts: [101, Number.POSITIVE_INFINITY] }, // sehr schlecht
                            ],
                        },
                    },
                },
            },
            /**
             * EAQI (EU) - European Air Quality Index
             * [ETC HE Report 2024/17: EEA´s revision of the European air quality index bands]{@link https://www.eionet.europa.eu/etcs/etc-he/products/etc-he-products/etc-he-reports/etc-he-report-2024-17-eeas-revision-of-the-european-air-quality-index-bands}
             */
            EU_EAQI: {
                weatherKitScale: {
                    name: "EU.EAQI",
                    version: "2414",
                    maxIndex: 60,
                },
                // Indexes below for calculation only, not for display
                categories: {
                    significantIndex: 4, // Poor
                    ranges: [
                        { categoryIndex: 1, indexes: [0, 9] }, // Good
                        { categoryIndex: 2, indexes: [10, 19] }, // Fair
                        { categoryIndex: 3, indexes: [20, 29] }, // Moderate
                        { categoryIndex: 4, indexes: [30, 39] }, // Poor
                        { categoryIndex: 5, indexes: [40, 49] }, // Very Poor
                        { categoryIndex: 6, indexes: [50, Number.POSITIVE_INFINITY] }, // Extremely Poor
                    ],
                },
                pollutants: {
                    PM2_5: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 9], amounts: [0, 5] },
                            max: { indexes: [40, 49], amounts: [91, 140] },
                            value: [
                                { indexes: [0, 9], amounts: [0, 5] }, // Good
                                { indexes: [10, 19], amounts: [6, 15] }, // Fair
                                { indexes: [20, 29], amounts: [16, 50] }, // Moderate
                                { indexes: [30, 39], amounts: [51, 90] }, // Poor
                                { indexes: [40, 49], amounts: [91, 140] }, // Very Poor
                                { indexes: [50, Number.POSITIVE_INFINITY], amounts: [141, Number.POSITIVE_INFINITY] }, // Extremely Poor
                            ],
                        },
                    },
                    PM10: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 9], amounts: [0, 15] },
                            max: { indexes: [40, 49], amounts: [196, 270] },
                            value: [
                                { indexes: [0, 9], amounts: [0, 15] }, // Good
                                { indexes: [10, 19], amounts: [16, 45] }, // Fair
                                { indexes: [20, 29], amounts: [46, 120] }, // Moderate
                                { indexes: [30, 39], amounts: [121, 195] }, // Poor
                                { indexes: [40, 49], amounts: [196, 270] }, // Very Poor
                                { indexes: [50, Number.POSITIVE_INFINITY], amounts: [271, Number.POSITIVE_INFINITY] }, // Extremely Poor
                            ],
                        },
                    },
                    OZONE: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 9], amounts: [0, 60] },
                            max: { indexes: [40, 49], amounts: [161, 180] },
                            value: [
                                { indexes: [0, 9], amounts: [0, 60] }, // Good
                                { indexes: [10, 19], amounts: [61, 100] }, // Fair
                                { indexes: [20, 29], amounts: [101, 120] }, // Moderate
                                { indexes: [30, 39], amounts: [121, 160] }, // Poor
                                { indexes: [40, 49], amounts: [161, 180] }, // Very Poor
                                { indexes: [50, Number.POSITIVE_INFINITY], amounts: [181, Number.POSITIVE_INFINITY] }, // Extremely Poor
                            ],
                        },
                    },
                    NO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 9], amounts: [0, 10] },
                            max: { indexes: [40, 49], amounts: [101, 150] },
                            value: [
                                { indexes: [0, 9], amounts: [0, 10] }, // Good
                                { indexes: [10, 19], amounts: [11, 25] }, // Fair
                                { indexes: [20, 29], amounts: [26, 60] }, // Moderate
                                { indexes: [30, 39], amounts: [61, 100] }, // Poor
                                { indexes: [40, 49], amounts: [101, 150] }, // Very Poor
                                { indexes: [50, Number.POSITIVE_INFINITY], amounts: [151, Number.POSITIVE_INFINITY] }, // Extremely Poor
                            ],
                        },
                    },
                    SO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 9], amounts: [0, 20] },
                            max: { indexes: [40, 49], amounts: [191, 275] },
                            value: [
                                { indexes: [0, 9], amounts: [0, 20] }, // Good
                                { indexes: [10, 19], amounts: [21, 40] }, // Fair
                                { indexes: [20, 29], amounts: [41, 125] }, // Moderate
                                { indexes: [30, 39], amounts: [126, 190] }, // Poor
                                { indexes: [40, 49], amounts: [191, 275] }, // Very Poor
                                { indexes: [50, Number.POSITIVE_INFINITY], amounts: [276, Number.MAX_VALUE] }, // Extremely Poor
                            ],
                        },
                    },
                },
            },
            /**
             * China AQI standard.
             * Ambient Air Quality Index (AQI) Technical Regulation (Trial).
             * @link https://www.mee.gov.cn/ywgz/fgbz/bz/bzwb/jcffbz/201203/t20120302_224166.shtml
             */
            HJ6332012: {
                weatherKitScale: {
                    name: "HJ6332012",
                    version: "2414",
                },
                categories: {
                    significantIndex: 3, // Lightly polluted.
                    ranges: [
                        { categoryIndex: 1, indexes: [0, 50] }, // Excellent.
                        { categoryIndex: 2, indexes: [51, 100] }, // Good.
                        { categoryIndex: 3, indexes: [101, 150] }, // Lightly polluted.
                        { categoryIndex: 4, indexes: [151, 200] }, // Moderately polluted.
                        { categoryIndex: 5, indexes: [201, 300] }, // Heavily polluted.
                        { categoryIndex: 6, indexes: [301, 500] }, // Severely polluted.
                    ],
                },
                pollutants: {
                    SO2_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 50] },
                            max: { indexes: [401, 500], amounts: [2101, 2620] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 50] },
                                { indexes: [51, 100], amounts: [51, 150] },
                                { indexes: [101, 150], amounts: [151, 475] },
                                { indexes: [151, 200], amounts: [476, 800] },
                                { indexes: [201, 300], amounts: [801, 1600] },
                                { indexes: [301, 400], amounts: [1601, 2100] },
                                { indexes: [401, 500], amounts: [2101, 2620] },
                            ],
                        },
                    },
                    SO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 150] },
                            max: { indexes: [151, 200], amounts: [651, 800] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 150] },
                                { indexes: [51, 100], amounts: [151, 500] },
                                { indexes: [101, 150], amounts: [501, 650] },
                                { indexes: [151, 200], amounts: [651, 800] },
                                // When 1-hour SO2 exceeds 800 ug/m3, do not calculate its IAQI from 1-hour concentration; report SO2 IAQI from the 24-hour average instead.
                            ],
                        },
                    },
                    NO2_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 40] },
                            max: { indexes: [401, 500], amounts: [751, 940] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 40] },
                                { indexes: [51, 100], amounts: [41, 80] },
                                { indexes: [101, 150], amounts: [81, 180] },
                                { indexes: [151, 200], amounts: [181, 280] },
                                { indexes: [201, 300], amounts: [281, 565] },
                                { indexes: [301, 400], amounts: [566, 750] },
                                { indexes: [401, 500], amounts: [751, 940] },
                            ],
                        },
                    },
                    NO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 100] },
                            max: { indexes: [401, 500], amounts: [3091, 3840] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 100] },
                                { indexes: [51, 100], amounts: [101, 200] },
                                { indexes: [101, 150], amounts: [201, 700] },
                                { indexes: [151, 200], amounts: [701, 1200] },
                                { indexes: [201, 300], amounts: [1201, 2340] },
                                { indexes: [301, 400], amounts: [2341, 3090] },
                                { indexes: [401, 500], amounts: [3091, 3840] },
                            ],
                        },
                    },
                    PM10_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 50] },
                            max: { indexes: [401, 500], amounts: [501, 600] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 50] },
                                { indexes: [51, 100], amounts: [51, 150] },
                                { indexes: [101, 150], amounts: [151, 250] },
                                { indexes: [151, 200], amounts: [251, 350] },
                                { indexes: [201, 300], amounts: [351, 420] },
                                { indexes: [301, 400], amounts: [421, 500] },
                                { indexes: [401, 500], amounts: [501, 600] },
                            ],
                        },
                    },
                    CO_24H: {
                        units: "MILLIGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 2] },
                            max: { indexes: [401, 500], amounts: [49, 60] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 2] },
                                { indexes: [51, 100], amounts: [3, 4] },
                                { indexes: [101, 150], amounts: [5, 14] },
                                { indexes: [151, 200], amounts: [15, 24] },
                                { indexes: [201, 300], amounts: [25, 36] },
                                { indexes: [301, 400], amounts: [37, 48] },
                                { indexes: [401, 500], amounts: [49, 60] },
                            ],
                        },
                    },
                    CO: {
                        units: "MILLIGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 5] },
                            max: { indexes: [401, 500], amounts: [121, 150] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 5] },
                                { indexes: [51, 100], amounts: [6, 10] },
                                { indexes: [101, 150], amounts: [11, 35] },
                                { indexes: [151, 200], amounts: [36, 60] },
                                { indexes: [201, 300], amounts: [61, 90] },
                                { indexes: [301, 400], amounts: [91, 120] },
                                { indexes: [401, 500], amounts: [121, 150] },
                            ],
                        },
                    },
                    OZONE: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 160] },
                            max: { indexes: [401, 500], amounts: [1001, 1200] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 160] },
                                { indexes: [51, 100], amounts: [161, 200] },
                                { indexes: [101, 150], amounts: [201, 300] },
                                { indexes: [151, 200], amounts: [301, 400] },
                                { indexes: [201, 300], amounts: [401, 800] },
                                { indexes: [301, 400], amounts: [801, 1000] },
                                { indexes: [401, 500], amounts: [1001, 1200] },
                            ],
                        },
                    },
                    OZONE_8H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 100] },
                            max: { indexes: [201, 300], amounts: [266, 800] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 100] },
                                { indexes: [51, 100], amounts: [101, 160] },
                                { indexes: [101, 150], amounts: [161, 215] },
                                { indexes: [151, 200], amounts: [216, 265] },
                                { indexes: [201, 300], amounts: [266, 800] },
                                // When 8-hour O3 exceeds 800 ug/m3, do not calculate its IAQI from 8-hour concentration; report O3 IAQI from the 1-hour concentration instead.
                            ],
                        },
                    },
                    PM2_5_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 35] },
                            max: { indexes: [401, 500], amounts: [351, 500] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 35] },
                                { indexes: [51, 100], amounts: [36, 75] },
                                { indexes: [101, 150], amounts: [76, 115] },
                                { indexes: [151, 200], amounts: [116, 150] },
                                { indexes: [201, 300], amounts: [151, 250] },
                                { indexes: [301, 400], amounts: [251, 350] },
                                { indexes: [401, 500], amounts: [351, 500] },
                            ],
                        },
                    },
                },
            },
            /**
             * China AQI standard (2025 draft).
             * Notice requesting public comments on draft ambient air quality standards.
             * @link https://www.mee.gov.cn/xxgk2018/xxgk/xxgk06/202512/t20251215_1137858.html
             */
            HJ6332025_DRAFT: {
                weatherKitScale: {
                    name: "HJ6332012",
                    version: "2414",
                },
                categories: {
                    significantIndex: 3, // Lightly polluted.
                    ranges: [
                        { categoryIndex: 1, indexes: [1, 50] }, // Excellent.
                        { categoryIndex: 2, indexes: [51, 100] }, // Good.
                        { categoryIndex: 3, indexes: [101, 150] }, // Lightly polluted.
                        { categoryIndex: 4, indexes: [151, 200] }, // Moderately polluted.
                        { categoryIndex: 5, indexes: [201, 300] }, // Heavily polluted.
                        { categoryIndex: 6, indexes: [301, 500] }, // Severely polluted.
                    ],
                },
                pollutants: {
                    SO2_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 50] },
                            max: { indexes: [401, 500], amounts: [2101, 2620] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 50] },
                                { indexes: [51, 100], amounts: [51, 150] },
                                { indexes: [101, 150], amounts: [151, 475] },
                                { indexes: [151, 200], amounts: [476, 800] },
                                { indexes: [201, 300], amounts: [801, 1600] },
                                { indexes: [301, 400], amounts: [1601, 2100] },
                                { indexes: [401, 500], amounts: [2101, 2620] },
                            ],
                        },
                    },
                    // 1-hour SO2, NO2, CO, and O3 limits are only used for real-time reporting.
                    SO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 150] },
                            max: { indexes: [200, 200], amounts: [801, Number.POSITIVE_INFINITY] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 150] },
                                { indexes: [51, 100], amounts: [151, 500] },
                                { indexes: [101, 150], amounts: [501, 650] },
                                { indexes: [151, 200], amounts: [651, 800] },
                                // When 1-hour SO2 exceeds 800 ug/m3, report IAQI as 200.
                                { indexes: [200, 200], amounts: [801, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    NO2_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 40] },
                            max: { indexes: [401, 500], amounts: [751, 940] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 40] },
                                { indexes: [51, 100], amounts: [41, 80] },
                                { indexes: [101, 150], amounts: [81, 180] },
                                { indexes: [151, 200], amounts: [181, 280] },
                                { indexes: [201, 300], amounts: [281, 565] },
                                { indexes: [301, 400], amounts: [566, 750] },
                                { indexes: [401, 500], amounts: [751, 940] },
                            ],
                        },
                    },
                    // 1-hour SO2, NO2, CO, and O3 limits are only used for real-time reporting.
                    NO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 100] },
                            max: { indexes: [401, 500], amounts: [3091, 3840] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 100] },
                                { indexes: [51, 100], amounts: [101, 200] },
                                { indexes: [101, 150], amounts: [201, 700] },
                                { indexes: [151, 200], amounts: [701, 1200] },
                                { indexes: [201, 300], amounts: [1201, 2340] },
                                { indexes: [301, 400], amounts: [2341, 3090] },
                                { indexes: [401, 500], amounts: [3091, 3840] },
                            ],
                        },
                    },
                    CO_24H: {
                        units: "MILLIGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 2] },
                            max: { indexes: [401, 500], amounts: [49, 60] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 2] },
                                { indexes: [51, 100], amounts: [3, 4] },
                                { indexes: [101, 150], amounts: [5, 14] },
                                { indexes: [151, 200], amounts: [15, 24] },
                                { indexes: [201, 300], amounts: [25, 36] },
                                { indexes: [301, 400], amounts: [37, 48] },
                                { indexes: [401, 500], amounts: [49, 60] },
                            ],
                        },
                    },
                    // 1-hour SO2, NO2, CO, and O3 limits are only used for real-time reporting.
                    CO: {
                        units: "MILLIGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 5] },
                            max: { indexes: [401, 500], amounts: [121, 150] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 5] },
                                { indexes: [51, 100], amounts: [6, 10] },
                                { indexes: [101, 150], amounts: [11, 35] },
                                { indexes: [151, 200], amounts: [36, 60] },
                                { indexes: [201, 300], amounts: [61, 90] },
                                { indexes: [301, 400], amounts: [91, 120] },
                                { indexes: [401, 500], amounts: [121, 150] },
                            ],
                        },
                    },
                    OZONE_8H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 100] },
                            max: { indexes: [300, 300], amounts: [801, Number.POSITIVE_INFINITY] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 100] },
                                { indexes: [51, 100], amounts: [101, 160] },
                                { indexes: [101, 150], amounts: [161, 215] },
                                { indexes: [151, 200], amounts: [216, 265] },
                                { indexes: [201, 300], amounts: [266, 800] },
                                // When 8-hour O3 exceeds 800 ug/m3, report IAQI as 300.
                                { indexes: [300, 300], amounts: [801, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    // 1-hour SO2, NO2, CO, and O3 limits are only used for real-time reporting.
                    OZONE: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 160] },
                            max: { indexes: [401, 500], amounts: [1001, 1200] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 160] },
                                { indexes: [51, 100], amounts: [161, 200] },
                                { indexes: [101, 150], amounts: [201, 300] },
                                { indexes: [151, 200], amounts: [301, 400] },
                                { indexes: [201, 300], amounts: [401, 800] },
                                { indexes: [301, 400], amounts: [801, 1000] },
                                { indexes: [401, 500], amounts: [1001, 1200] },
                            ],
                        },
                    },
                    PM10_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 50] },
                            max: { indexes: [401, 500], amounts: [501, 600] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 50] },
                                { indexes: [51, 100], amounts: [51, 120] },
                                { indexes: [101, 150], amounts: [121, 250] },
                                { indexes: [151, 200], amounts: [251, 350] },
                                { indexes: [201, 300], amounts: [351, 420] },
                                { indexes: [301, 400], amounts: [421, 500] },
                                { indexes: [401, 500], amounts: [501, 600] },
                            ],
                        },
                    },
                    PM2_5_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 35] },
                            max: { indexes: [401, 500], amounts: [351, 500] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 30] },
                                { indexes: [51, 100], amounts: [31, 60] },
                                { indexes: [101, 150], amounts: [61, 115] },
                                { indexes: [151, 200], amounts: [116, 150] },
                                { indexes: [201, 300], amounts: [151, 250] },
                                { indexes: [301, 400], amounts: [251, 350] },
                                { indexes: [401, 500], amounts: [351, 500] },
                            ],
                        },
                    },
                },
            },
            /**
             * US AQI standard, not equal to NowCast.
             * [Technical Assistance Document for the Reporting of Daily Air Quality – the Air Quality Index (AQI) (EPA 454/B-24-002, May 2024)]{@link https://document.airnow.gov/technical-assistance-document-for-the-reporting-of-daily-air-quailty.pdf}
             */
            EPA_NowCast: {
                weatherKitScale: {
                    name: "EPA_NowCast",
                    version: "2414",
                },
                categories: {
                    significantIndex: 3, // Unhealthy for Sensitive Groups
                    ranges: [
                        { categoryIndex: 1, indexes: [0, 50] }, // Good
                        { categoryIndex: 2, indexes: [51, 100] }, // Moderate
                        { categoryIndex: 3, indexes: [101, 150] }, // Unhealthy for Sensitive Groups
                        { categoryIndex: 4, indexes: [151, 200] }, // Unhealthy
                        { categoryIndex: 5, indexes: [201, 300] }, // Very Unhealthy
                        { categoryIndex: 6, indexes: [301, Number.POSITIVE_INFINITY] }, // Hazardous
                    ],
                },
                pollutants: {
                    OZONE_8H: {
                        units: "PARTS_PER_MILLION",
                        stpConversionFactor: 1.96189649169881,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 0.054] },
                            max: { indexes: [201, 300], amounts: [0.106, 0.2] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 0.054] }, // Good
                                { indexes: [51, 100], amounts: [0.055, 0.07] }, // Moderate
                                { indexes: [101, 150], amounts: [0.071, 0.085] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [0.086, 0.105] }, // Unhealthy
                                { indexes: [201, 300], amounts: [0.106, 0.2] }, // Very Unhealthy
                                // Note 2:
                                // 8-hour O3 values do not define higher AQI values (≥ 301).
                                // AQI values of 301 or higher are calculated with 1-hour O3 concentrations.
                                { indexes: [301, Number.POSITIVE_INFINITY], amounts: [0.201, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    OZONE: {
                        units: "PARTS_PER_MILLION",
                        stpConversionFactor: 1.96189649169881,
                        ranges: {
                            min: { indexes: [101, 150], amounts: [0.125, 0.164] },
                            max: { indexes: [301, 500], amounts: [0.405, 0.604] },
                            value: [
                                // Note 1:
                                // Areas are generally required to report the AQI based on 8-hour O3 values. However,
                                // there are a small number of areas where an AQI based on 1-hour O3 values would be more precautionary.
                                // In these cases, in addition to calculating the 8-hour O3 index value,
                                // the 1-hour O3 value may be calculated, and the maximum of the two values reported.
                                { indexes: [101, 150], amounts: [0.125, 0.164] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [0.165, 0.204] }, // Unhealthy
                                { indexes: [201, 300], amounts: [0.205, 0.404] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [0.405, 0.604] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [0.605, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    PM2_5_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 9] },
                            max: { indexes: [301, 500], amounts: [225.5, 325.4] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 9] }, // Good
                                { indexes: [51, 100], amounts: [9.1, 35.4] }, // Moderate
                                { indexes: [101, 150], amounts: [35.5, 55.4] }, // Unhealthy for Sensitive Groups
                                // Note 3 of PM2.5 can be found in EPA 454/B-18-007:
                                // If a different SHL for PM2.5 is promulgated, these numbers will change accordingly.
                                //
                                // It is believed that they forgot to remove this note
                                { indexes: [151, 200], amounts: [55.5, 125.4] }, // Unhealthy
                                { indexes: [201, 300], amounts: [125.5, 225.4] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [225.5, 325.4] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [325.5, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    PM10_24H: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 54] },
                            max: { indexes: [301, 500], amounts: [425, 604] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 54] }, // Good
                                { indexes: [51, 100], amounts: [55, 154] }, // Moderate
                                { indexes: [101, 150], amounts: [155, 254] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [255, 354] }, // Unhealthy
                                { indexes: [201, 300], amounts: [355, 424] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [425, 604] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [605, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    CO_8H: {
                        units: "PARTS_PER_MILLION",
                        stpConversionFactor: 1.14491990608754,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 4.4] },
                            max: { indexes: [301, 500], amounts: [30.5, 50.4] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 4.4] }, // Good
                                { indexes: [51, 100], amounts: [4.5, 9.4] }, // Moderate
                                { indexes: [101, 150], amounts: [9.5, 12.4] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [12.5, 15.4] }, // Unhealthy
                                { indexes: [201, 300], amounts: [15.5, 30.4] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [30.5, 50.4] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [50.5, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    SO2: {
                        units: "PARTS_PER_BILLION",
                        stpConversionFactor: 2.618396263625692,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 35] },
                            max: { indexes: [301, 500], amounts: [605, 1004] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 35] }, // Good
                                { indexes: [51, 100], amounts: [36, 75] }, // Moderate
                                { indexes: [101, 150], amounts: [76, 185] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [186, 304] }, // Unhealthy
                                // Note 3 of SO2:
                                // 1-hour SO2 values do not define higher AQI values (≥ 200).
                                // AQI values of 200 or greater are calculated with 24-hour SO2 concentrations.
                                //
                                // It is believed that they forgot to remove this note
                                { indexes: [201, 300], amounts: [305, 604] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [605, 1004] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [1005, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    NO2: {
                        units: "PARTS_PER_BILLION",
                        stpConversionFactor: 1.880472698306222,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 53] },
                            max: { indexes: [301, 500], amounts: [1250, 2049] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 53] }, // Good
                                { indexes: [51, 100], amounts: [54, 100] }, // Moderate
                                { indexes: [101, 150], amounts: [101, 360] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [361, 649] }, // Unhealthy
                                { indexes: [201, 300], amounts: [650, 1249] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [1250, 2049] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [2050, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                },
            },
            /**
             * WAQI InstantCast in EPA_NowCast. Basically is a method to calculate indexes based on 1-hour pollutants.
             * [A Beginner's Guide to Air Quality Instant-Cast and Now-Cast.]{@link https://aqicn.org/faq/2015-03-15/air-quality-nowcast-a-beginners-guide/}
             * [Ozone AQI Scale update]{@link https://aqicn.org/faq/2016-08-10/ozone-aqi-scale-update/}
             */
            WAQI_InstantCast_US: {
                weatherKitScale: {
                    name: "EPA_NowCast",
                    version: "2414",
                    maxIndex: 500,
                },
                categories: {
                    significantIndex: 3, // Unhealthy for Sensitive Groups
                    ranges: [
                        { categoryIndex: 1, indexes: [0, 50] }, // Good
                        { categoryIndex: 2, indexes: [51, 100] }, // Moderate
                        { categoryIndex: 3, indexes: [101, 150] }, // Unhealthy for Sensitive Groups
                        { categoryIndex: 4, indexes: [151, 200] }, // Unhealthy
                        { categoryIndex: 5, indexes: [201, 300] }, // Very Unhealthy
                        { categoryIndex: 6, indexes: [301, Number.POSITIVE_INFINITY] }, // Hazardous
                    ],
                },
                // Eventually we will convert it to ppb
                pollutants: {
                    // [Ozone AQI Scale update](https://aqicn.org/faq/2016-08-10/ozone-aqi-scale-update/)
                    OZONE: {
                        units: "PARTS_PER_BILLION",
                        stpConversionFactor: 1.96189649169881,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 62.5] },
                            max: { indexes: [301, 500], amounts: [405.1, 605] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 62.5] }, // Good
                                { indexes: [51, 100], amounts: [62.6, 101.5] }, // Moderate
                                { indexes: [101, 150], amounts: [101.6, 152.5] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [152.6, 205] }, // Unhealthy
                                { indexes: [201, 300], amounts: [205.1, 405] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [405.1, 605] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [605.1, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    PM2_5: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 9] },
                            max: { indexes: [301, 500], amounts: [225.5, 325.4] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 9] }, // Good
                                { indexes: [51, 100], amounts: [9.1, 35.4] }, // Moderate
                                { indexes: [101, 150], amounts: [35.5, 55.4] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [55.5, 125.4] }, // Unhealthy
                                { indexes: [201, 300], amounts: [125.5, 225.4] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [225.5, 325.4] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [325.5, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    PM10: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 54] },
                            max: { indexes: [301, 500], amounts: [425, 604] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 54] }, // Good
                                { indexes: [51, 100], amounts: [55, 154] }, // Moderate
                                { indexes: [101, 150], amounts: [155, 254] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [255, 354] }, // Unhealthy
                                { indexes: [201, 300], amounts: [355, 424] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [425, 604] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [605, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    CO: {
                        units: "PARTS_PER_BILLION",
                        stpConversionFactor: 1.144511152104645,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 4400] },
                            max: { indexes: [301, 500], amounts: [30401, 50400] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 4400] }, // Good
                                { indexes: [51, 100], amounts: [4401, 9400] }, // Moderate
                                { indexes: [101, 150], amounts: [9401, 12400] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [12401, 15400] }, // Unhealthy
                                { indexes: [201, 300], amounts: [15401, 30400] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [30401, 50400] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [50401, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    SO2: {
                        units: "PARTS_PER_BILLION",
                        stpConversionFactor: 2.618396263625692,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 35] },
                            max: { indexes: [301, 500], amounts: [605, 1004] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 35] }, // Good
                                { indexes: [51, 100], amounts: [36, 75] }, // Moderate
                                { indexes: [101, 150], amounts: [76, 185] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [186, 304] }, // Unhealthy
                                { indexes: [201, 300], amounts: [305, 604] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [605, 1004] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [1005, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                    NO2: {
                        units: "PARTS_PER_BILLION",
                        stpConversionFactor: 1.880472698306222,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 53] },
                            max: { indexes: [301, 500], amounts: [1250, 2049] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 53] }, // Good
                                { indexes: [51, 100], amounts: [54, 100] }, // Moderate
                                { indexes: [101, 150], amounts: [101, 360] }, // Unhealthy for Sensitive Groups
                                { indexes: [151, 200], amounts: [361, 649] }, // Unhealthy
                                { indexes: [201, 300], amounts: [650, 1249] }, // Very Unhealthy
                                { indexes: [301, 500], amounts: [1250, 2049] }, // Hazardous
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [2050, Number.POSITIVE_INFINITY] }, // Hazardous
                            ],
                        },
                    },
                },
            },
            /**
             * WAQI InstantCast in HJ6332012.
             * Use 24-hour SO2 when > 800, 24-hour PM10 and PM2.5 as 1-hour.
             * 1-hour for others.
             */
            WAQI_InstantCast_CN: {
                weatherKitScale: {
                    name: "HJ6332012",
                    version: "2414",
                    maxIndex: 500,
                },
                categories: {
                    significantIndex: 3, // Lightly polluted.
                    ranges: [
                        { categoryIndex: 1, indexes: [0, 50] }, // Excellent.
                        { categoryIndex: 2, indexes: [51, 100] }, // Good.
                        { categoryIndex: 3, indexes: [101, 150] }, // Lightly polluted.
                        { categoryIndex: 4, indexes: [151, 200] }, // Moderately polluted.
                        { categoryIndex: 5, indexes: [201, 300] }, // Heavily polluted.
                        { categoryIndex: 6, indexes: [301, Number.POSITIVE_INFINITY] }, // Severely polluted.
                    ],
                },
                pollutants: {
                    SO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 150] },
                            max: { indexes: [401, 500], amounts: [2101, 2620] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 150] },
                                { indexes: [51, 100], amounts: [151, 500] },
                                { indexes: [101, 150], amounts: [501, 650] },
                                { indexes: [151, 200], amounts: [651, 800] },
                                { indexes: [201, 300], amounts: [801, 1600] },
                                { indexes: [301, 400], amounts: [1601, 2100] },
                                { indexes: [401, 500], amounts: [2101, 2620] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [2602, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    NO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 100] },
                            max: { indexes: [401, 500], amounts: [3091, 3840] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 100] },
                                { indexes: [51, 100], amounts: [101, 200] },
                                { indexes: [101, 150], amounts: [201, 700] },
                                { indexes: [151, 200], amounts: [701, 1200] },
                                { indexes: [201, 300], amounts: [1201, 2340] },
                                { indexes: [301, 400], amounts: [2341, 3090] },
                                { indexes: [401, 500], amounts: [3091, 3840] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [3841, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    PM10: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 50] },
                            max: { indexes: [401, 500], amounts: [501, 600] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 50] },
                                { indexes: [51, 100], amounts: [51, 150] },
                                { indexes: [101, 150], amounts: [151, 250] },
                                { indexes: [151, 200], amounts: [251, 350] },
                                { indexes: [201, 300], amounts: [351, 420] },
                                { indexes: [301, 400], amounts: [421, 500] },
                                { indexes: [401, 500], amounts: [501, 600] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [601, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    CO: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 5000] },
                            max: { indexes: [401, 500], amounts: [120001, 150000] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 5000] },
                                { indexes: [51, 100], amounts: [5001, 10000] },
                                { indexes: [101, 150], amounts: [10001, 35000] },
                                { indexes: [151, 200], amounts: [35001, 60000] },
                                { indexes: [201, 300], amounts: [60001, 90000] },
                                { indexes: [301, 400], amounts: [90001, 120000] },
                                { indexes: [401, 500], amounts: [120001, 150000] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [150001, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    OZONE: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 160] },
                            max: { indexes: [401, 500], amounts: [1001, 1200] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 160] },
                                { indexes: [51, 100], amounts: [161, 200] },
                                { indexes: [101, 150], amounts: [201, 300] },
                                { indexes: [151, 200], amounts: [301, 400] },
                                { indexes: [201, 300], amounts: [401, 800] },
                                { indexes: [301, 400], amounts: [801, 1000] },
                                { indexes: [401, 500], amounts: [1001, 1200] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [1201, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    PM2_5: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 35] },
                            max: { indexes: [401, 500], amounts: [351, 500] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 35] },
                                { indexes: [51, 100], amounts: [36, 75] },
                                { indexes: [101, 150], amounts: [76, 115] },
                                { indexes: [151, 200], amounts: [116, 150] },
                                { indexes: [201, 300], amounts: [151, 250] },
                                { indexes: [301, 400], amounts: [251, 350] },
                                { indexes: [401, 500], amounts: [351, 500] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [501, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                },
            },
            WAQI_InstantCast_CN_25_DRAFT: {
                weatherKitScale: {
                    name: "HJ6332012",
                    version: "2414",
                    maxIndex: 500,
                },
                categories: {
                    significantIndex: 3, // Lightly polluted.
                    ranges: [
                        { categoryIndex: 1, indexes: [1, 50] }, // Excellent.
                        { categoryIndex: 2, indexes: [51, 100] }, // Good.
                        { categoryIndex: 3, indexes: [101, 150] }, // Lightly polluted.
                        { categoryIndex: 4, indexes: [151, 200] }, // Moderately polluted.
                        { categoryIndex: 5, indexes: [201, 300] }, // Heavily polluted.
                        { categoryIndex: 6, indexes: [301, Number.POSITIVE_INFINITY] }, // Severely polluted.
                    ],
                },
                pollutants: {
                    // 1-hour SO2, NO2, CO, and O3 limits are only used for real-time reporting.
                    SO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 150] },
                            max: { indexes: [200, 200], amounts: [801, Number.POSITIVE_INFINITY] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 150] },
                                { indexes: [51, 100], amounts: [151, 500] },
                                { indexes: [101, 150], amounts: [501, 650] },
                                { indexes: [151, 200], amounts: [651, 800] },
                                // When 1-hour SO2 exceeds 800 ug/m3, report IAQI as 200.
                                { indexes: [200, 200], amounts: [801, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    // 1-hour SO2, NO2, CO, and O3 limits are only used for real-time reporting.
                    NO2: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 100] },
                            max: { indexes: [401, 500], amounts: [3091, 3840] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 100] },
                                { indexes: [51, 100], amounts: [101, 200] },
                                { indexes: [101, 150], amounts: [201, 700] },
                                { indexes: [151, 200], amounts: [701, 1200] },
                                { indexes: [201, 300], amounts: [1201, 2340] },
                                { indexes: [301, 400], amounts: [2341, 3090] },
                                { indexes: [401, 500], amounts: [3091, 3840] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [3841, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    // 1-hour SO2, NO2, CO, and O3 limits are only used for real-time reporting.
                    CO: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 5000] },
                            max: { indexes: [401, 500], amounts: [120001, 150000] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 5000] },
                                { indexes: [51, 100], amounts: [5001, 10000] },
                                { indexes: [101, 150], amounts: [10001, 35000] },
                                { indexes: [151, 200], amounts: [35001, 60000] },
                                { indexes: [201, 300], amounts: [60001, 90000] },
                                { indexes: [301, 400], amounts: [90001, 120000] },
                                { indexes: [401, 500], amounts: [120001, 150000] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [150001, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    // 1-hour SO2, NO2, CO, and O3 limits are only used for real-time reporting.
                    OZONE: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 160] },
                            max: { indexes: [401, 500], amounts: [1001, 1200] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 160] },
                                { indexes: [51, 100], amounts: [161, 200] },
                                { indexes: [101, 150], amounts: [201, 300] },
                                { indexes: [151, 200], amounts: [301, 400] },
                                { indexes: [201, 300], amounts: [401, 800] },
                                { indexes: [301, 400], amounts: [801, 1000] },
                                { indexes: [401, 500], amounts: [1001, 1200] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [1201, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    PM10: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 50] },
                            max: { indexes: [401, 500], amounts: [501, 600] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 50] },
                                { indexes: [51, 100], amounts: [51, 120] },
                                { indexes: [101, 150], amounts: [121, 250] },
                                { indexes: [151, 200], amounts: [251, 350] },
                                { indexes: [201, 300], amounts: [351, 420] },
                                { indexes: [301, 400], amounts: [421, 500] },
                                { indexes: [401, 500], amounts: [501, 600] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [601, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                    PM2_5: {
                        units: "MICROGRAMS_PER_CUBIC_METER",
                        stpConversionFactor: -1,
                        ranges: {
                            min: { indexes: [0, 50], amounts: [0, 35] },
                            max: { indexes: [401, 500], amounts: [351, 500] },
                            value: [
                                { indexes: [0, 50], amounts: [0, 30] },
                                { indexes: [51, 100], amounts: [31, 60] },
                                { indexes: [101, 150], amounts: [61, 115] },
                                { indexes: [151, 200], amounts: [116, 150] },
                                { indexes: [201, 300], amounts: [151, 250] },
                                { indexes: [301, 400], amounts: [251, 350] },
                                { indexes: [401, 500], amounts: [351, 500] },
                                { indexes: [501, Number.POSITIVE_INFINITY], amounts: [501, Number.POSITIVE_INFINITY] },
                            ],
                        },
                    },
                },
            },
        },
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
        CompareCategoryIndexes: {
            BETTER: "BETTER",
            SAME: "SAME",
            UNKNOWN: "UNKNOWN",
            WORSE: "WORSE",
        },
        Units: {
            WeatherKit: {
                ugm3: "MICROGRAMS_PER_CUBIC_METER",
                mgm3: "MILLIGRAMS_PER_CUBIC_METER",
                ppb: "PARTS_PER_BILLION",
                ppm: "PARTS_PER_MILLION",
            },
            Friendly: {
                MICROGRAMS_PER_CUBIC_METER: "μg/m3",
                MILLIGRAMS_PER_CUBIC_METER: "mg/m3",
                PARTS_PER_BILLION: "ppb",
                PARTS_PER_MILLION: "ppm",
            },
        },
        /**
         * Standard Conditions for Temperature and Pressure
         * [Ozone AQI: Using concentrations in milligrams or ppb?]{@link https://aqicn.org/faq/2015-09-06/ozone-aqi-using-concentrations-in-milligrams-or-ppb/}
         * [Understanding Units of Measurement - Terrie K. Boguski, P.E. (CHSR)]{@link https://cfpub.epa.gov/ncer_abstracts/index.cfm/fuseaction/display.files/fileid/14285}
         *
         * (amount * 12.187 * molecularWeight) / (temperatureInCelsius + 273.15)
         *
         * - 12.187 is the inverse of gas constant.
         * - 273.15 is the 0 celsius in kelvin.
         * - temperatureInCelsius is 25 in US, 20 in EU.
         */
        STP_ConversionFactors: {
            US: {
                OZONE: 1.96189649169881, // 47.997 g/mol
                SO2: 2.618396263625692, // 64.058 g/mol
                NO2: 1.880472698306222, // 46.005 g/mol
                CO: 1.14491990608754, // 28.01 g/mol
                C6H6: 3.192940861982224, // 78.114 g/mol
                NH3: 0.696148908267651, // 17.031 g/mol
                NO: 1.226507201073285, // 30.006 g/mol
            },
            EU: {
                OZONE: 1.995358823128092, // 47.997 g/mol
                SO2: 2.663055930411053, // 64.058 g/mol
                NO2: 1.912546256182842, // 46.005 g/mol
                CO: 1.164447791233157, // 28.01 g/mol
                C6H6: 3.247400027289784, // 78.114 g/mol
                NH3: 0.708022503837626, // 17.031 g/mol
                NO: 1.247426648473478, // 30.006 g/mol
            },
        },
    };

    static ConvertUnit(amount, from, to, fromStpConversionFactor = -1, toStpConversionFactor = -1) {
        Console.info("☑️ ConvertUnit");
        const friendlyUnits = AirQuality.Config.Units.Friendly;
        Console.info(`Convert ${amount} from ${friendlyUnits[from]} with ${fromStpConversionFactor} to ${friendlyUnits[to]} with ${toStpConversionFactor}`);
        if (amount < 0) {
            Console.error("ConvertUnit", `Amount ${amount} < 0`);
            return -1;
        }

        const numAmount = Number(amount.toFixed(15));

        const { ugm3, mgm3, ppb, ppm } = AirQuality.Config.Units.WeatherKit;
        const ppx = [ppb, ppm];
        const units = [...ppx, ugm3, mgm3];
        if (!units.includes(from) || !units.includes(to)) {
            Console.error("ConvertUnit", "Unsupported units", `from: ${from}`, `to: ${to}`);
            return -1;
        }

        const isPpxFrom = ppx.includes(from);
        const isPpxTo = ppx.includes(to);
        const isBothPpx = isPpxFrom && isPpxTo;
        if (isBothPpx && fromStpConversionFactor !== toStpConversionFactor) {
            if (fromStpConversionFactor <= 0 || toStpConversionFactor <= 0) {
                Console.error("ConvertUnit", "Invalid STP conversion factor", `fromStpConversionFactor: ${fromStpConversionFactor}`, `toStpConversionFactor: ${toStpConversionFactor}`);
                return -1;
            }

            const intermediate = AirQuality.ConvertUnit(numAmount, from, ugm3, fromStpConversionFactor);
            return AirQuality.ConvertUnit(intermediate, ugm3, to, -1, toStpConversionFactor);
        }

        if (!isBothPpx && isPpxFrom && fromStpConversionFactor <= 0) {
            Console.error("ConvertUnit", `fromStpConversionFactor ${fromStpConversionFactor} <= 0`);
            return -1;
        }

        if (!isBothPpx && isPpxTo && toStpConversionFactor <= 0) {
            Console.error("ConvertUnit", `toStpConversionFactor ${toStpConversionFactor} <= 0`);
            return -1;
        }

        const { multiply, divide } = SimplePrecisionMath;
        switch (from) {
            case ppm:
                switch (to) {
                    case ppm:
                        Console.info("✅ ConvertUnit");
                        return numAmount;
                    case ppb:
                        Console.info("✅ ConvertUnit");
                        return multiply(numAmount, 1000);
                    case mgm3:
                        Console.info("✅ ConvertUnit");
                        return multiply(numAmount, fromStpConversionFactor);
                    case ugm3: {
                        const inPpb = AirQuality.ConvertUnit(numAmount, from, ppb);
                        Console.info("✅ ConvertUnit");
                        return multiply(inPpb, fromStpConversionFactor);
                    }
                    default:
                        return -1;
                }
            case ppb:
                switch (to) {
                    case ppb:
                        Console.info("✅ ConvertUnit");
                        return numAmount;
                    case ppm:
                        Console.info("✅ ConvertUnit");
                        return multiply(numAmount, 0.001);
                    case mgm3: {
                        const inPpm = AirQuality.ConvertUnit(numAmount, from, ppm);
                        Console.info("✅ ConvertUnit");
                        return multiply(inPpm, fromStpConversionFactor);
                    }
                    case ugm3:
                        Console.info("✅ ConvertUnit");
                        return multiply(numAmount, fromStpConversionFactor);
                    default:
                        return -1;
                }
            case mgm3:
                switch (to) {
                    case mgm3:
                        Console.info("✅ ConvertUnit");
                        return numAmount;
                    case ugm3:
                        Console.info("✅ ConvertUnit");
                        return multiply(numAmount, 1000);
                    case ppm:
                        Console.info("✅ ConvertUnit");
                        return divide(numAmount, toStpConversionFactor);
                    case ppb: {
                        const inUgM3 = AirQuality.ConvertUnit(numAmount, from, ugm3);
                        Console.info("✅ ConvertUnit");
                        return divide(inUgM3, toStpConversionFactor);
                    }
                    default:
                        return -1;
                }
            case ugm3:
                switch (to) {
                    case ugm3:
                        Console.info("✅ ConvertUnit");
                        return numAmount;
                    case mgm3:
                        Console.info("✅ ConvertUnit");
                        return multiply(numAmount, 0.001);
                    case ppm: {
                        const inMgM3 = AirQuality.ConvertUnit(numAmount, from, mgm3);
                        Console.info("✅ ConvertUnit");
                        return divide(inMgM3, toStpConversionFactor);
                    }
                    case ppb:
                        Console.info("✅ ConvertUnit");
                        return divide(numAmount, toStpConversionFactor);
                    default:
                        return -1;
                }
            default:
                return -1;
        }
    }
}
