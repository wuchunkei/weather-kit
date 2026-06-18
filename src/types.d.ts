export interface Settings {
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
