export interface Settings {
    /**
     * [Data Sets]
     *
     * Selected data sets will be included in WeatherKit requests.
     *
     * @remarks
     *
     * Possible values:
     * - `'airQuality'` - Air Quality
     * - `'currentWeather'` - Current Weather
     * - `'forecastDaily'` - Daily Forecast
     * - `'forecastHourly'` - Hourly Forecast
     * - `'forecastNextHour'` - Next-Hour Precipitation Intensity
     * - `'locationInfo'` - Location Info
     * - `'news'` - News
     * - `'historicalComparisons'` - Historical Comparisons
     * - `'weatherAlerts'` - Weather Alerts
     * - `'weatherChanges'` - Weather Changes
     *
     * @defaultValue ["airQuality","currentWeather","forecastDaily","forecastHourly","forecastNextHour","locationInfo","news","historicalComparisons","weatherAlerts","weatherChanges"]
     */
    DataSets?: ('airQuality' | 'currentWeather' | 'forecastDaily' | 'forecastHourly' | 'forecastNextHour' | 'locationInfo' | 'news' | 'historicalComparisons' | 'weatherAlerts' | 'weatherChanges')[];
    Weather?: {
    /**
         * [Weather] Replacement Scope
         *
         * Replace weather data only for matching regions.
         *
         * @remarks
         *
         * Possible values:
         * - `'CN'` - Mainland China
         * - `'CN|HK|MO|TW'` - Mainland China, Hong Kong, Macau, and Taiwan
         * - `'.*'` - All Regions
         *
         * @defaultValue "CN"
         */
        Replace?: 'CN' | 'CN|HK|MO|TW' | '.*';
    /**
         * [Weather] Data Source
         *
         * Use the selected provider to replace weather data.
         *
         * @remarks
         *
         * Possible values:
         * - `'WeatherKit'` - WeatherKit (No replacement)
         * - `'OpenWeather'` - OpenWeather
         * - `'QWeather'` - QWeather
         *
         * @defaultValue "WeatherKit"
         */
        Provider?: 'WeatherKit' | 'OpenWeather' | 'QWeather';
};
    NextHour?: {
    /**
         * [Next-Hour Precipitation Intensity] Data Source
         *
         * Use the selected provider to replace or fill next-hour precipitation intensity data.
         *
         * @remarks
         *
         * Possible values:
         * - `'WeatherKit'` - WeatherKit (Do not add)
         * - `'OpenWeather'` - OpenWeather
         * - `'QWeather'` - QWeather
         *
         * @defaultValue "WeatherKit"
         */
        Provider?: 'WeatherKit' | 'OpenWeather' | 'QWeather';
};
    AirQuality?: {
    Current?: {
            Pollutants?: {
            /**
                 * [Current Pollutants] Data Source
                 *
                 * Use the selected provider to fill pollutant data. IQAir free plans usually return AQI only; pollutant concentrations require a matching API plan.
                 *
                 * @remarks
                 *
                 * Possible values:
                 * - `'WeatherKit'` - WeatherKit (No replacement)
                 * - `'WAQI'` - WAQI
                 * - `'IQAir'` - IQAir
                 * - `'QWeather'` - QWeather
                 *
                 * @defaultValue "WeatherKit"
                 */
                Provider?: 'WeatherKit' | 'WAQI' | 'IQAir' | 'QWeather';
            Units?: {
                /**
                 * [Current Pollutants - Unit Conversion] Targets
                 *
                 * Convert pollutant units for comparison with air-quality standards. Unit conversion can introduce decimals, minor precision loss, and omitted decimal parts.
                 *
                 * @remarks
                 *
                 * Possible values:
                 * - `'EPA_NowCast'` - US AQI (EPA_NowCast)
                 * - `'EU.EAQI'` - EU EAQI (EU.EAQI)
                 * - `'HJ6332012'` - China AQI (HJ6332012)
                 * - `'UBA'` - Germany LQI (UBA)
                 *
                 * @defaultValue []
                 */
                Replace?: ('EPA_NowCast' | 'EU.EAQI' | 'HJ6332012' | 'UBA')[];
                /**
                 * [Current Pollutants - Unit Conversion] Mode
                 *
                 * Target unit conversion mode for pollutants.
                 *
                 * @remarks
                 *
                 * Possible values:
                 * - `'Scale'` - Match the air-quality standard
                 * - `'ugm3'` - Convert to ug/m3 unless the standard requires another unit
                 * - `'EU_ppb'` - Convert to EU ppb unless the standard requires another unit
                 * - `'US_ppb'` - Convert to US ppb unless the standard requires another unit
                 * - `'Force_ugm3'` - ug/m3
                 * - `'Force_EU_ppb'` - EU ppb
                 * - `'Force_US_ppb'` - US ppb
                 *
                 * @defaultValue "Scale"
                 */
                Mode?: 'Scale' | 'ugm3' | 'EU_ppb' | 'US_ppb' | 'Force_ugm3' | 'Force_EU_ppb' | 'Force_US_ppb';
};
};
            Index?: {
                /**
                 * [Current AQI] Replacement Targets
                 *
                 * Replace air-quality indexes for the selected standards.
                 *
                 * @remarks
                 *
                 * Possible values:
                 * - `'HJ6332012'` - China AQI (HJ6332012)
                 * - `'IE.AQIH'` - Ireland AQIH (IE.AQIH)
                 * - `'AT.AQI'` - Austria AQI (AT.AQI)
                 * - `'BE.BelAQI'` - Belgium BelAQI (BE.BelAQI)
                 * - `'UBA'` - Germany LQI (UBA)
                 * - `'FR.ATMO'` - France IQA (FR.ATMO)
                 * - `'KR.CAI'` - Korea CAI (KR.CAI)
                 * - `'CA.AQHI'` - Canada AQHI (CA.AQHI)
                 * - `'CZ.AQI'` - Czech AQI (CZ.AQI)
                 * - `'NL.LKI'` - Netherlands LKI (NL.LKI)
                 * - `'EPA_NowCast'` - US AQI (EPA_NowCast)
                 * - `'ICARS'` - Mexico ICARS (ICARS)
                 * - `'EU.EAQI'` - EU EAQI (EU.EAQI)
                 * - `'CH.KBI'` - Switzerland KBI (CH.KBI)
                 * - `'ES.MITECO'` - Spain ICA (ES.MITECO)
                 * - `'SG.NEA'` - Singapore PSI (SG.NEA)
                 * - `'NAQI'` - India NAQI (NAQI)
                 * - `'DAQI'` - UK DAQI (DAQI)
                 *
                 * @defaultValue ["HJ6332012"]
                 */
                Replace?: ('HJ6332012' | 'IE.AQIH' | 'AT.AQI' | 'BE.BelAQI' | 'UBA' | 'FR.ATMO' | 'KR.CAI' | 'CA.AQHI' | 'CZ.AQI' | 'NL.LKI' | 'EPA_NowCast' | 'ICARS' | 'EU.EAQI' | 'CH.KBI' | 'ES.MITECO' | 'SG.NEA' | 'NAQI' | 'DAQI')[];
                /**
                 * [Current AQI] Data Source
                 *
                 * Use the selected provider to fill and replace AQI data. WeatherKit (US AQI) uses Apple WeatherKit pollutants and converts only the AQI scale to EPA/US. Keep China AQI selected in Replacement Targets to convert CN responses.
                 *
                 * @remarks
                 *
                 * Possible values:
                 * - `'WeatherKit'` - WeatherKit (No replacement)
                 * - `'WeatherKit_US'` - WeatherKit (US AQI)
                 * - `'Calculate'` - iRingo Built-in Algorithm
                 * - `'WAQI'` - WAQI
                 * - `'IQAir'` - IQAir (US EPA)
                 * - `'QWeather'` - QWeather (China AQI, 2012-02 edition)
                 *
                 * @defaultValue "WeatherKit_US"
                 */
                Provider?: 'WeatherKit' | 'WeatherKit_US' | 'Calculate' | 'WAQI' | 'IQAir' | 'QWeather';
                /**
                 * [Current AQI] Force Primary Pollutant
                 *
                 * Ignore the HJ 633-2012 AQI > 50 rule and always use the pollutant with the highest IAQI as the primary pollutant.
                 *
                 * @defaultValue true
                 */
                ForceCNPrimaryPollutants?: boolean;
};
};
    Comparison?: {
        /**
         * [Air Quality - Yesterday Comparison] Replace on Current Change
         *
         * Replace yesterday comparison data when today's AQI changes, even if comparison data already exists.
         *
         * @defaultValue false
         */
        ReplaceWhenCurrentChange?: boolean;
        Yesterday?: {
            /**
             * [Yesterday Pollutants] Data Source
             *
             * Provide pollutant data for the iRingo built-in algorithm to calculate yesterday's AQI.
             *
             * @remarks
             *
             * Possible values:
             * - `'WeatherKit'` - WeatherKit (No replacement)
             * - `'QWeather'` - QWeather
             *
             * @defaultValue "WeatherKit"
             */
            PollutantsProvider?: 'WeatherKit' | 'QWeather';
            /**
             * [Yesterday AQI] Data Source
             *
             * Data source used to compare with today's AQI.
             *
             * @remarks
             *
             * Possible values:
             * - `'WeatherKit'` - WeatherKit (No replacement)
             * - `'Calculate'` - iRingo Built-in Algorithm
             * - `'QWeather'` - QWeather (China AQI, 2012-02 edition)
             *
             * @defaultValue "WeatherKit"
             */
            IndexProvider?: 'WeatherKit' | 'Calculate' | 'QWeather';
};
};
    Calculate?: {
        /**
         * [iRingo Built-in Algorithm] Algorithm
         *
         * Use the built-in algorithm to calculate AQI locally from pollutant data. InstantCast is based on WAQI, and the US version uses WAQI's ozone standard.
         *
         * @remarks
         *
         * Possible values:
         * - `'None'` - No Conversion
         * - `'UBA'` - Germany LQI (FB001846)
         * - `'EU_EAQI'` - EU EAQI (ETC HE Report 2024/17)
         * - `'WAQI_InstantCast_US'` - US InstantCast (EPA-454/B-24-002)
         * - `'WAQI_InstantCast_CN'` - China InstantCast (HJ 633-2012)
         * - `'WAQI_InstantCast_CN_25_DRAFT'` - China InstantCast (HJ 633 2025 Draft)
         *
         * @defaultValue "EU_EAQI"
         */
        Algorithm?: 'None' | 'UBA' | 'EU_EAQI' | 'WAQI_InstantCast_US' | 'WAQI_InstantCast_CN' | 'WAQI_InstantCast_CN_25_DRAFT';
        /**
         * [iRingo Built-in Algorithm] Allow Over-Range Index
         *
         * Allow US and China AQI indexes to exceed 500. When the value exceeds 500, the small indicator color dot may disappear.
         *
         * @defaultValue true
         */
        AllowOverRange?: boolean;
};
};
    API?: {
    OpenWeather?: {
            /**
         * [API] OpenWeather Request URL
         *
         * OpenWeather One Call API 4.0 request URL
         *
         * @defaultValue "https://api.openweathermap.org/data/4.0/onecall"
         */
        URL?: string;
            /**
         * [API] OpenWeather Token
         *
         * OpenWeather API token
         *
         * @defaultValue ""
         */
        Token?: string;
};
    QWeather?: {
        /**
         * [API] QWeather Host
         *
         * Hostname used by the QWeather API
         *
         * @defaultValue "devapi.qweather.com"
         */
        Host?: string;
        /**
         * [API] QWeather Token
         *
         * QWeather API token
         *
         * @defaultValue ""
         */
        Token?: string;
};
    WAQI?: {
        /**
         * [API] WAQI Token
         *
         * WAQI API token. Filling this field automatically enables the WAQI advanced API.
         *
         * @defaultValue ""
         */
        Token?: string;
};
    IQAir?: {
        /**
         * [API] IQAir Request URL
         *
         * IQAir AirVisual API request URL
         *
         * @defaultValue "https://api.airvisual.com/v2/nearest_city"
         */
        URL?: string;
        /**
         * [API] IQAir Token
         *
         * IQAir AirVisual API token
         *
         * @defaultValue ""
         */
        Token?: string;
};
};
    /**
     * [Storage] Configuration Type
     *
     * Choose the configuration source. For legacy setups without this option, the order remains $persistentStore (BoxJs) > $argument > database.
     *
     * @remarks
     *
     * Possible values:
     * - `'Argument'` - Prefer configuration passed by $argument, such as plugin options and module arguments. Missing $argument values are provided by PersistentStore (BoxJs).
     * - `'PersistentStore'` - Only use configuration from $persistentStore, such as BoxJs.
     * - `'database'` - Only use defaults from the author's database.mjs file. Other custom configuration will no longer take effect.
     *
     * @defaultValue "Argument"
     */
    Storage?: 'Argument' | 'PersistentStore' | 'database';
    /**
     * [Debug] Log Level
     *
     * Choose the script log level. Logs below the selected level will be suppressed.
     *
     * @remarks
     *
     * Possible values:
     * - `'OFF'` - Off
     * - `'ERROR'` - Error
     * - `'WARN'` - Warning
     * - `'INFO'` - Info
     * - `'DEBUG'` - Debug
     * - `'ALL'` - All
     *
     * @defaultValue "WARN"
     */
    LogLevel?: 'OFF' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'ALL';
}
