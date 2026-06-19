export interface Settings {
    Weather?: {
    /**
         * [Weather] Replacement Scope
         *
         * Replace weather data only for matching regions. Keep Disabled when you only need AQI replacement.
         *
         * @remarks
         *
         * Possible values:
         * - `'OFF'` - Disabled
         * - `'CN'` - Mainland China
         * - `'CN|HK|MO|TW'` - Mainland China, Hong Kong, Macau, and Taiwan
         * - `'.*'` - All Regions
         *
         * @defaultValue "OFF"
         */
        Replace?: 'OFF' | 'CN' | 'CN|HK|MO|TW' | '.*';
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
    Fallback?: {
        /**
         * [Weather] OpenWeather Fallback
         *
         * Fallback provider used when OpenWeather weather data is unavailable or rate-limited.
         *
         * @remarks
         *
         * Possible values:
         * - `'WeatherKit'` - WeatherKit
         * - `'QWeather'` - QWeather
         *
         * @defaultValue "WeatherKit"
         */
        Provider?: 'WeatherKit' | 'QWeather';
};
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
    Fallback?: {
        /**
         * [Next-Hour Precipitation Intensity] OpenWeather Fallback
         *
         * Fallback provider used when OpenWeather next-hour precipitation data is unavailable or rate-limited.
         *
         * @remarks
         *
         * Possible values:
         * - `'WeatherKit'` - WeatherKit
         * - `'QWeather'` - QWeather
         *
         * @defaultValue "WeatherKit"
         */
        Provider?: 'WeatherKit' | 'QWeather';
};
};
    AirQuality?: {
    /**
         * [Air Quality] Replacement Scope
         *
         * Replace air-quality data only for matching regions.
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
         * [Air Quality] Data Source
         *
         * Use the selected provider to replace AQI. IQAir results can be supplemented by the configured fallback providers when pollutant details are missing.
         *
         * @remarks
         *
         * Possible values:
         * - `'WeatherKit'` - WeatherKit (No replacement)
         * - `'IQAir'` - IQAir
         * - `'QWeather'` - QWeather
         * - `'WAQI'` - WAQI
         *
         * @defaultValue "WeatherKit"
         */
        Provider?: 'WeatherKit' | 'IQAir' | 'QWeather' | 'WAQI';
    /**
         * [Air Quality] AQI Standard
         *
         * Choose the AQI standard used for display. Provider Default keeps the selected provider's own AQI; US or China recalculates AQI from pollutant concentrations when available.
         *
         * @remarks
         *
         * Possible values:
         * - `'Provider'` - Provider Default
         * - `'US'` - US AQI (EPA NowCast)
         * - `'CN'` - China AQI (HJ 633-2012)
         *
         * @defaultValue "Provider"
         */
        Standard?: 'Provider' | 'US' | 'CN';
    Fallback?: {
        /**
         * [Air Quality] Fallback Sources
         *
         * Fallback order used when the primary AQI provider is unavailable or lacks pollutant concentration details.
         *
         * @remarks
         *
         * Possible values:
         * - `'QWeather'` - QWeather
         * - `'WAQI'` - WAQI
         *
         * @defaultValue ["QWeather","WAQI"]
         */
        Provider?: ('QWeather' | 'WAQI')[];
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
    WAQI?: {
        /**
         * [API] WAQI Token
         *
         * WAQI API token. Leave empty to let the script try the public nearest-station flow.
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
