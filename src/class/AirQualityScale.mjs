const DISPLAY_LABELS = {
    "zh-Hans-CN": "\u7a7a\u6c14\u8d28\u91cf",
    "zh-Hant-HK": "\u7a7a\u6c23\u8cea\u7d20",
    "zh-Hant-TW": "\u7a7a\u6c23\u54c1\u8cea",
    "en-US": "Air Quality",
};

const SCALE_DEFINITIONS = {
    EPA_NowCast: {
        displayName: {
            "zh-Hans-CN": "\u7f8e\u56fd AQI",
            "zh-Hant-HK": "\u7f8e\u570b AQI",
            "zh-Hant-TW": "\u7f8e\u570b AQI",
            "en-US": "US AQI",
        },
        shortDisplayName: {
            "zh-Hans-CN": "AQI",
            "zh-Hant-HK": "AQI",
            "zh-Hant-TW": "AQI",
            "en-US": "AQI",
        },
        longDisplayName: {
            "zh-Hans-CN": "\u7f8e\u56fd EPA NowCast",
            "zh-Hant-HK": "\u7f8e\u570b EPA NowCast",
            "zh-Hant-TW": "\u7f8e\u570b EPA NowCast",
            "en-US": "United States (EPA NowCast)",
        },
        range: [0, 500],
        categories: [
            { range: [0, 50], color: "#04DE71", glyph: "aqi.low", categoryName: { "zh-Hans-CN": "\u4f18", "zh-Hant-HK": "\u826f\u597d", "zh-Hant-TW": "\u826f\u597d", "en-US": "Good" } },
            { range: [51, 100], color: "#FFE620", glyph: "aqi.medium", categoryName: { "zh-Hans-CN": "\u826f", "zh-Hant-HK": "\u4e2d\u7b49", "zh-Hant-TW": "\u666e\u901a", "en-US": "Moderate" } },
            { range: [101, 150], color: "#FF9500", glyph: "aqi.medium", categoryName: { "zh-Hans-CN": "\u8f7b\u5ea6\u6c61\u67d3", "zh-Hant-HK": "\u5c0d\u654f\u611f\u4eba\u58eb\u4e0d\u5065\u5eb7", "zh-Hant-TW": "\u5c0d\u654f\u611f\u65cf\u7fa4\u4e0d\u5065\u5eb7", "en-US": "Unhealthy for Sensitive Groups" } },
            { range: [151, 200], color: "#FA114F", glyph: "aqi.high", categoryName: { "zh-Hans-CN": "\u4e2d\u5ea6\u6c61\u67d3", "zh-Hant-HK": "\u4e0d\u5065\u5eb7", "zh-Hant-TW": "\u5c0d\u6240\u6709\u65cf\u7fa4\u4e0d\u5065\u5eb7", "en-US": "Unhealthy" } },
            { range: [201, 300], color: "#9C1DF2", glyph: "aqi.high", categoryName: { "zh-Hans-CN": "\u91cd\u5ea6\u6c61\u67d3", "zh-Hant-HK": "\u975e\u5e38\u4e0d\u5065\u5eb7", "zh-Hant-TW": "\u975e\u5e38\u4e0d\u5065\u5eb7", "en-US": "Very Unhealthy" } },
            { range: [301, 500], color: "#80172B", glyph: "aqi.high", categoryName: { "zh-Hans-CN": "\u4e25\u91cd\u6c61\u67d3", "zh-Hant-HK": "\u5371\u5bb3", "zh-Hant-TW": "\u5371\u5bb3", "en-US": "Hazardous" } },
        ],
    },
    HJ6332012: {
        displayName: {
            "zh-Hans-CN": "\u4e2d\u56fd AQI",
            "zh-Hant-HK": "\u4e2d\u570b AQI",
            "zh-Hant-TW": "\u4e2d\u570b AQI",
            "en-US": "China AQI",
        },
        shortDisplayName: {
            "zh-Hans-CN": "AQI",
            "zh-Hant-HK": "AQI",
            "zh-Hant-TW": "AQI",
            "en-US": "AQI",
        },
        longDisplayName: {
            "zh-Hans-CN": "\u4e2d\u56fd AQI (HJ 633-2012)",
            "zh-Hant-HK": "\u4e2d\u570b AQI (HJ 633-2012)",
            "zh-Hant-TW": "\u4e2d\u570b AQI (HJ 633-2012)",
            "en-US": "China AQI (HJ 633-2012)",
        },
        range: [0, 500],
        categories: [
            { range: [0, 50], color: "#04DE71", glyph: "aqi.low", categoryName: { "zh-Hans-CN": "\u4f18", "zh-Hant-HK": "\u512a", "zh-Hant-TW": "\u826f\u597d", "en-US": "Excellent" } },
            { range: [51, 100], color: "#FFE620", glyph: "aqi.medium", categoryName: { "zh-Hans-CN": "\u826f", "zh-Hant-HK": "\u826f", "zh-Hant-TW": "\u666e\u901a", "en-US": "Good" } },
            { range: [101, 150], color: "#FF9500", glyph: "aqi.medium", categoryName: { "zh-Hans-CN": "\u8f7b\u5ea6\u6c61\u67d3", "zh-Hant-HK": "\u8f15\u5ea6\u6c61\u67d3", "zh-Hant-TW": "\u5c0d\u654f\u611f\u65cf\u7fa4\u4e0d\u5065\u5eb7", "en-US": "Lightly Polluted" } },
            { range: [151, 200], color: "#FA114F", glyph: "aqi.high", categoryName: { "zh-Hans-CN": "\u4e2d\u5ea6\u6c61\u67d3", "zh-Hant-HK": "\u4e2d\u5ea6\u6c61\u67d3", "zh-Hant-TW": "\u5c0d\u6240\u6709\u65cf\u7fa4\u4e0d\u5065\u5eb7", "en-US": "Moderately Polluted" } },
            { range: [201, 300], color: "#9C1DF2", glyph: "aqi.high", categoryName: { "zh-Hans-CN": "\u91cd\u5ea6\u6c61\u67d3", "zh-Hant-HK": "\u91cd\u5ea6\u6c61\u67d3", "zh-Hant-TW": "\u975e\u5e38\u4e0d\u5065\u5eb7", "en-US": "Heavily Polluted" } },
            { range: [301, 500], color: "#80172B", glyph: "aqi.high", categoryName: { "zh-Hans-CN": "\u4e25\u91cd\u6c61\u67d3", "zh-Hant-HK": "\u56b4\u91cd\u6c61\u67d3", "zh-Hant-TW": "\u5371\u5bb3", "en-US": "Severely Polluted" } },
        ],
    },
    EU_EAQI: {
        displayName: {
            "zh-Hans-CN": "\u6b27\u6d32 AQI",
            "zh-Hant-HK": "\u6b50\u6d32 AQI",
            "zh-Hant-TW": "\u6b50\u6d32 AQI",
            "en-US": "European AQI",
        },
        shortDisplayName: {
            "zh-Hans-CN": "EAQI",
            "zh-Hant-HK": "EAQI",
            "zh-Hant-TW": "EAQI",
            "en-US": "EAQI",
        },
        longDisplayName: {
            "zh-Hans-CN": "\u6b27\u6d32\u7a7a\u6c14\u8d28\u91cf\u6307\u6570",
            "zh-Hant-HK": "\u6b50\u6d32\u7a7a\u6c23\u8cea\u7d20\u6307\u6578",
            "zh-Hant-TW": "\u6b50\u6d32\u7a7a\u6c23\u54c1\u8cea\u6307\u6578",
            "en-US": "European Air Quality Index",
        },
        range: [1, 5],
        categories: [
            { range: [1, 1], color: "#04DE71", glyph: "aqi.low", categoryName: { "zh-Hans-CN": "\u597d", "zh-Hant-HK": "\u597d", "zh-Hant-TW": "\u826f\u597d", "en-US": "Good" } },
            { range: [2, 2], color: "#CCFF66", glyph: "aqi.low", categoryName: { "zh-Hans-CN": "\u5c1a\u53ef", "zh-Hant-HK": "\u5c1a\u53ef", "zh-Hant-TW": "\u5c1a\u53ef", "en-US": "Fair" } },
            { range: [3, 3], color: "#FFE620", glyph: "aqi.medium", categoryName: { "zh-Hans-CN": "\u4e2d\u7b49", "zh-Hant-HK": "\u4e2d\u7b49", "zh-Hant-TW": "\u666e\u901a", "en-US": "Moderate" } },
            { range: [4, 4], color: "#FF9500", glyph: "aqi.high", categoryName: { "zh-Hans-CN": "\u5dee", "zh-Hant-HK": "\u5dee", "zh-Hant-TW": "\u5dee", "en-US": "Poor" } },
            { range: [5, 5], color: "#FA114F", glyph: "aqi.high", categoryName: { "zh-Hans-CN": "\u5f88\u5dee", "zh-Hant-HK": "\u5f88\u5dee", "zh-Hant-TW": "\u5f88\u5dee", "en-US": "Very Poor" } },
        ],
    },
};

const HEALTH_RECOMMENDATIONS = {
    EPA_NowCast: [
        { "en-US": "Air quality is satisfactory. Enjoy normal outdoor activities." },
        { "en-US": "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged or heavy outdoor exertion." },
        { "en-US": "Members of sensitive groups may be affected. Reduce prolonged or heavy outdoor exertion." },
        { "en-US": "Everyone may begin to experience effects. Sensitive groups should avoid prolonged or heavy outdoor exertion." },
        { "en-US": "Health risk is increased. Limit outdoor activity; sensitive groups should stay indoors where possible." },
        { "en-US": "Health alert. Avoid outdoor activity and keep windows closed or use air filtration where possible." },
    ],
    HJ6332012: [
        { "en-US": "Air quality is excellent. Normal outdoor activity is suitable for everyone." },
        { "en-US": "Air quality is good. A few unusually sensitive people may consider reducing outdoor activity." },
        { "en-US": "Sensitive groups should reduce prolonged or heavy outdoor exertion." },
        { "en-US": "Children, older adults, and people with heart or lung disease should avoid prolonged outdoor activity; everyone else should reduce outdoor exertion." },
        { "en-US": "Children, older adults, and people with heart or lung disease should stay indoors; everyone else should reduce outdoor activity." },
        { "en-US": "Everyone should avoid outdoor activity. Sensitive groups should stay indoors and minimize physical exertion." },
    ],
    EU_EAQI: [
        { "en-US": "Air quality is good. Enjoy normal outdoor activities." },
        { "en-US": "Air quality is fair. Sensitive people may consider reducing prolonged outdoor exertion." },
        { "en-US": "Sensitive people should reduce prolonged or heavy outdoor exertion." },
        { "en-US": "Reduce outdoor exertion. Sensitive people should avoid prolonged outdoor activity." },
        { "en-US": "Avoid outdoor exertion. Sensitive people should stay indoors where possible." },
    ],
};

for (const [name, definition] of Object.entries(SCALE_DEFINITIONS)) {
    definition.categories = definition.categories.map((category, index) => ({
        ...category,
        recommendation: category.recommendation ?? HEALTH_RECOMMENDATIONS[name]?.[index] ?? HEALTH_RECOMMENDATIONS.EPA_NowCast[index],
    }));
    definition.gradient ??= { stops: definition.categories.map(category => ({ location: category.range[0], color: category.color })) };
}

function normalizeTextLanguage(language = "") {
    if (/zh-Hans|zh-CN/i.test(language)) return "zh-Hans-CN";
    if (/zh-Hant-HK|zh-HK/i.test(language)) return "zh-Hant-HK";
    if (/^zh/i.test(language)) return "zh-Hant-TW";
    return "en-US";
}

function normalizeScaleLanguage(language = "") {
    if (/zh-Hans|zh-CN/i.test(language)) return "zh-CN";
    if (/zh-Hant-HK|zh-HK/i.test(language)) return "zh-HK";
    if (/^zh/i.test(language)) return "zh-TW";
    return "en";
}

function localize(map, language) {
    return map?.[language] ?? map?.["en-US"] ?? "";
}

function getBaseScaleName(scaleName = "") {
    const lastDotIndex = scaleName.lastIndexOf(".");
    return lastDotIndex >= 0 ? scaleName.slice(0, lastDotIndex) : scaleName;
}

function getVersion(scaleName = "") {
    const lastDotIndex = scaleName.lastIndexOf(".");
    return lastDotIndex >= 0 ? scaleName.slice(lastDotIndex + 1) : "1";
}

export default class AirQualityScale {
    static Build(language, scaleName) {
        const baseScaleName = getBaseScaleName(scaleName);
        const definition = SCALE_DEFINITIONS[baseScaleName];
        if (!definition) return undefined;

        const textLanguage = normalizeTextLanguage(language);
        const categories = definition.categories.map((category, index) => ({
            categoryNumber: index + 1,
            range: category.range,
            color: category.color,
            categoryName: localize(category.categoryName, textLanguage),
            glyph: category.glyph,
            recommendation: localize(category.recommendation, textLanguage),
        }));

        return {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, max-age=0",
            },
            body: JSON.stringify({
                name: scaleName,
                displayName: localize(definition.displayName, textLanguage),
                shortDisplayName: localize(definition.shortDisplayName, textLanguage),
                longDisplayName: localize(definition.longDisplayName, textLanguage),
                displayLabel: localize(DISPLAY_LABELS, textLanguage),
                language: normalizeScaleLanguage(language),
                version: Number.parseInt(getVersion(scaleName), 10) || 1,
                aqi: {
                    numerical: true,
                    ascending: true,
                    range: definition.range,
                    categories,
                    gradient: definition.gradient,
                },
            }),
        };
    }
}
