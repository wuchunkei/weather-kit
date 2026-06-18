// Generated from NSRingo/WeatherKit v3.1.0 response bundle.
// This vendors the WeatherKit FlatBuffer bindings because the upstream src/proto submodule is private.

let e, i, a, s, n, r, o, d, c, l, u, p, b, h, m, _, y, f, g, N, C, x, A, I, T, v, S, O, F, w, P, E, M, R, U, W, L, D, B, $, H, K, V, k, G;

    (I = e || (e = {}))[I.UNKNOWN = 0] = "UNKNOWN", I[I.MUCH_WORSE = 1] = "MUCH_WORSE", 
    I[I.WORSE = 2] = "WORSE", I[I.SAME = 3] = "SAME", I[I.BETTER = 4] = "BETTER", I[I.MUCH_BETTER = 5] = "MUCH_BETTER", 
    (T = i || (i = {}))[T.APPLE_INTERNAL = 0] = "APPLE_INTERNAL", T[T.MODELED = 1] = "MODELED", 
    T[T.STATION = 2] = "STATION", T[T.UNKNOWN3 = 3] = "UNKNOWN3", T[T.UNKNOWN4 = 4] = "UNKNOWN4";
    class to {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsMetadata(t, e) {
            return (e || new to).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsMetadata(t, e) {
            return t.setPosition(t.position() + 4), (e || new to).__init(t.readInt32(t.position()) + t.position(), t);
        }
        attributionUrl(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        expireTime() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        language(t) {
            let e = this.bb.__offset(this.bb_pos, 8);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        latitude() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        longitude() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        providerLogo(t) {
            let e = this.bb.__offset(this.bb_pos, 14);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        providerName(t) {
            let e = this.bb.__offset(this.bb_pos, 16);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        readTime() {
            let t = this.bb.__offset(this.bb_pos, 18);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        reportedTime() {
            let t = this.bb.__offset(this.bb_pos, 20);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        temporarilyUnavailable() {
            let t = this.bb.__offset(this.bb_pos, 22);
            return !!t && !!this.bb.readInt8(this.bb_pos + t);
        }
        sourceType() {
            let t = this.bb.__offset(this.bb_pos, 24);
            return t ? this.bb.readInt8(this.bb_pos + t) : i.APPLE_INTERNAL;
        }
        static startMetadata(t) {
            t.startObject(11);
        }
        static addAttributionUrl(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addExpireTime(t, e) {
            t.addFieldInt32(1, e, 0);
        }
        static addLanguage(t, e) {
            t.addFieldOffset(2, e, 0);
        }
        static addLatitude(t, e) {
            t.addFieldFloat32(3, e, 0);
        }
        static addLongitude(t, e) {
            t.addFieldFloat32(4, e, 0);
        }
        static addProviderLogo(t, e) {
            t.addFieldOffset(5, e, 0);
        }
        static addProviderName(t, e) {
            t.addFieldOffset(6, e, 0);
        }
        static addReadTime(t, e) {
            t.addFieldInt32(7, e, 0);
        }
        static addReportedTime(t, e) {
            t.addFieldInt32(8, e, 0);
        }
        static addTemporarilyUnavailable(t, e) {
            t.addFieldInt8(9, +e, 0);
        }
        static addSourceType(t, e) {
            t.addFieldInt8(10, e, i.APPLE_INTERNAL);
        }
        static endMetadata(t) {
            return t.endObject();
        }
        static createMetadata(t, e, i, a, s, n, r, o, d, c, l, u) {
            return to.startMetadata(t), to.addAttributionUrl(t, e), to.addExpireTime(t, i), 
            to.addLanguage(t, a), to.addLatitude(t, s), to.addLongitude(t, n), to.addProviderLogo(t, r), 
            to.addProviderName(t, o), to.addReadTime(t, d), to.addReportedTime(t, c), to.addTemporarilyUnavailable(t, l), 
            to.addSourceType(t, u), to.endMetadata(t);
        }
    }
    (v = a || (a = {}))[v.NOT_AVAILABLE = 0] = "NOT_AVAILABLE", v[v.C6H6 = 1] = "C6H6", 
    v[v.NH3 = 2] = "NH3", v[v.NMHC = 3] = "NMHC", v[v.NO = 4] = "NO", v[v.NO2 = 5] = "NO2", 
    v[v.NOX = 6] = "NOX", v[v.OZONE = 7] = "OZONE", v[v.PM2_5 = 8] = "PM2_5", v[v.SO2 = 9] = "SO2", 
    v[v.PM10 = 10] = "PM10", v[v.CO = 11] = "CO", v[v.UNKNOWN12 = 12] = "UNKNOWN12", 
    v[v.UNKNOWN13 = 13] = "UNKNOWN13", (S = s || (s = {}))[S.PARTS_PER_BILLION = 0] = "PARTS_PER_BILLION", 
    S[S.MICROGRAMS_PER_CUBIC_METER = 1] = "MICROGRAMS_PER_CUBIC_METER", S[S.UNKNOWN2 = 2] = "UNKNOWN2", 
    S[S.UNKNOWN3 = 3] = "UNKNOWN3";
    class td {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsPollutant(t, e) {
            return (e || new td).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsPollutant(t, e) {
            return t.setPosition(t.position() + 4), (e || new td).__init(t.readInt32(t.position()) + t.position(), t);
        }
        pollutantType() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readInt8(this.bb_pos + t) : a.NOT_AVAILABLE;
        }
        amount() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        units() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt8(this.bb_pos + t) : s.PARTS_PER_BILLION;
        }
        static startPollutant(t) {
            t.startObject(3);
        }
        static addPollutantType(t, e) {
            t.addFieldInt8(0, e, a.NOT_AVAILABLE);
        }
        static addAmount(t, e) {
            t.addFieldFloat32(1, e, 0);
        }
        static addUnits(t, e) {
            t.addFieldInt8(2, e, s.PARTS_PER_BILLION);
        }
        static endPollutant(t) {
            return t.endObject();
        }
        static createPollutant(t, e, i, a) {
            return td.startPollutant(t), td.addPollutantType(t, e), td.addAmount(t, i), td.addUnits(t, a), 
            td.endPollutant(t);
        }
    }
    class tc {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsAirQuality(t, e) {
            return (e || new tc).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsAirQuality(t, e) {
            return t.setPosition(t.position() + 4), (e || new tc).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        categoryIndex() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        index() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt16(this.bb_pos + t) : 0;
        }
        isSignificant() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return !!t && !!this.bb.readInt8(this.bb_pos + t);
        }
        pollutants(t, e) {
            let i = this.bb.__offset(this.bb_pos, 12);
            return i ? (e || new td).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        pollutantsLength() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        previousDayComparison() {
            let t = this.bb.__offset(this.bb_pos, 14);
            return t ? this.bb.readInt8(this.bb_pos + t) : e.UNKNOWN;
        }
        primaryPollutant() {
            let t = this.bb.__offset(this.bb_pos, 16);
            return t ? this.bb.readInt8(this.bb_pos + t) : a.NOT_AVAILABLE;
        }
        scale(t) {
            let e = this.bb.__offset(this.bb_pos, 18);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        static startAirQuality(t) {
            t.startObject(8);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addCategoryIndex(t, e) {
            t.addFieldInt8(1, e, 0);
        }
        static addIndex(t, e) {
            t.addFieldInt16(2, e, 0);
        }
        static addIsSignificant(t, e) {
            t.addFieldInt8(3, +e, 0);
        }
        static addPollutants(t, e) {
            t.addFieldOffset(4, e, 0);
        }
        static createPollutantsVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPollutantsVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPreviousDayComparison(t, i) {
            t.addFieldInt8(5, i, e.UNKNOWN);
        }
        static addPrimaryPollutant(t, e) {
            t.addFieldInt8(6, e, a.NOT_AVAILABLE);
        }
        static addScale(t, e) {
            t.addFieldOffset(7, e, 0);
        }
        static endAirQuality(t) {
            return t.endObject();
        }
        static createAirQuality(t, e, i, a, s, n, r, o, d) {
            return tc.startAirQuality(t), tc.addMetadata(t, e), tc.addCategoryIndex(t, i), tc.addIndex(t, a), 
            tc.addIsSignificant(t, s), tc.addPollutants(t, n), tc.addPreviousDayComparison(t, r), 
            tc.addPrimaryPollutant(t, o), tc.addScale(t, d), tc.endAirQuality(t);
        }
    }
    class tl {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsUUID(t, e) {
            return (e || new tl).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsUUID(t, e) {
            return t.setPosition(t.position() + 4), (e || new tl).__init(t.readInt32(t.position()) + t.position(), t);
        }
        bytes(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? this.bb.readUint8(this.bb.__vector(this.bb_pos + e) + t) : 0;
        }
        bytesLength() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        bytesArray() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
        }
        static startUUID(t) {
            t.startObject(1);
        }
        static addBytes(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static createBytesVector(t, e) {
            t.startVector(1, e.length, 1);
            for (let i = e.length - 1; i >= 0; i--) t.addInt8(e[i]);
            return t.endVector();
        }
        static startBytesVector(t, e) {
            t.startVector(1, e, 1);
        }
        static endUUID(t) {
            return t.endObject();
        }
        static createUUID(t, e) {
            return tl.startUUID(t), tl.addBytes(t, e), tl.endUUID(t);
        }
    }
    class tu {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsArticles(t, e) {
            return (e || new tu).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsArticles(t, e) {
            return t.setPosition(t.position() + 4), (e || new tu).__init(t.readInt32(t.position()) + t.position(), t);
        }
        id(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        supportedStorefronts(t, e) {
            let i = this.bb.__offset(this.bb_pos, 6);
            return i ? this.bb.__string(this.bb.__vector(this.bb_pos + i) + 4 * t, e) : null;
        }
        supportedStorefrontsLength() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        alertIds(t, e) {
            let i = this.bb.__offset(this.bb_pos, 8);
            return i ? (e || new tl).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        alertIdsLength() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        phenomena(t, e) {
            let i = this.bb.__offset(this.bb_pos, 10);
            return i ? this.bb.__string(this.bb.__vector(this.bb_pos + i) + 4 * t, e) : null;
        }
        phenomenaLength() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        headlineOverride(t) {
            let e = this.bb.__offset(this.bb_pos, 12);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        locale(t) {
            let e = this.bb.__offset(this.bb_pos, 14);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        static startArticles(t) {
            t.startObject(6);
        }
        static addId(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addSupportedStorefronts(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static createSupportedStorefrontsVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startSupportedStorefrontsVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addAlertIds(t, e) {
            t.addFieldOffset(2, e, 0);
        }
        static createAlertIdsVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startAlertIdsVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPhenomena(t, e) {
            t.addFieldOffset(3, e, 0);
        }
        static createPhenomenaVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPhenomenaVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addHeadlineOverride(t, e) {
            t.addFieldOffset(4, e, 0);
        }
        static addLocale(t, e) {
            t.addFieldOffset(5, e, 0);
        }
        static endArticles(t) {
            return t.endObject();
        }
        static createArticles(t, e, i, a, s, n, r) {
            return tu.startArticles(t), tu.addId(t, e), tu.addSupportedStorefronts(t, i), tu.addAlertIds(t, a), 
            tu.addPhenomena(t, s), tu.addHeadlineOverride(t, n), tu.addLocale(t, r), tu.endArticles(t);
        }
    }
    (O = n || (n = {}))[O.MEAN = 0] = "MEAN", O[O.UNKNOWN1 = 1] = "UNKNOWN1", O[O.UNKNOWN2 = 2] = "UNKNOWN2", 
    O[O.UNKNOWN3 = 3] = "UNKNOWN3", O[O.UNKNOWN4 = 4] = "UNKNOWN4", O[O.UNKNOWN5 = 5] = "UNKNOWN5", 
    (F = r || (r = {}))[F.UNKNOWN = 0] = "UNKNOWN", F[F.OBSERVED = 1] = "OBSERVED", 
    F[F.LIKELY = 2] = "LIKELY", F[F.POSSIBLE = 3] = "POSSIBLE", F[F.UNLIKELY = 4] = "UNLIKELY", 
    F[F.UNKNOWN5 = 5] = "UNKNOWN5", (w = o || (o = {}))[w.STEADY = 0] = "STEADY", w[w.INC = 1] = "INC", 
    w[w.DEC = 2] = "DEC", w[w.UNKNOWN3 = 3] = "UNKNOWN3";
    class tp {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsChange(t, e) {
            return (e || new tp).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsChange(t, e) {
            return t.setPosition(t.position() + 4), (e || new tp).__init(t.readInt32(t.position()) + t.position(), t);
        }
        forecastStart() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        forecastEnd() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        maxTemperatureChange() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt8(this.bb_pos + t) : o.STEADY;
        }
        minTemperatureChange() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readInt8(this.bb_pos + t) : o.STEADY;
        }
        dayPrecipitationChange() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readInt8(this.bb_pos + t) : o.STEADY;
        }
        nightPrecipitationChange() {
            let t = this.bb.__offset(this.bb_pos, 14);
            return t ? this.bb.readInt8(this.bb_pos + t) : o.STEADY;
        }
        static startChange(t) {
            t.startObject(6);
        }
        static addForecastStart(t, e) {
            t.addFieldInt32(0, e, 0);
        }
        static addForecastEnd(t, e) {
            t.addFieldInt32(1, e, 0);
        }
        static addMaxTemperatureChange(t, e) {
            t.addFieldInt8(2, e, o.STEADY);
        }
        static addMinTemperatureChange(t, e) {
            t.addFieldInt8(3, e, o.STEADY);
        }
        static addDayPrecipitationChange(t, e) {
            t.addFieldInt8(4, e, o.STEADY);
        }
        static addNightPrecipitationChange(t, e) {
            t.addFieldInt8(5, e, o.STEADY);
        }
        static endChange(t) {
            return t.endObject();
        }
        static createChange(t, e, i, a, s, n, r) {
            return tp.startChange(t), tp.addForecastStart(t, e), tp.addForecastEnd(t, i), tp.addMaxTemperatureChange(t, a), 
            tp.addMinTemperatureChange(t, s), tp.addDayPrecipitationChange(t, n), tp.addNightPrecipitationChange(t, r), 
            tp.endChange(t);
        }
    }
    (P = d || (d = {}))[P.UNKNOWN0 = 0] = "UNKNOWN0", P[P.TEMPERATURE_MAX = 1] = "TEMPERATURE_MAX", 
    P[P.PRECIPITATION = 2] = "PRECIPITATION", P[P.UNKNOWN3 = 3] = "UNKNOWN3", (E = c || (c = {}))[E.MUCHHIGHER = 0] = "MUCHHIGHER", 
    E[E.HIGHER = 1] = "HIGHER", E[E.NORMAL = 2] = "NORMAL", E[E.LOWER = 3] = "LOWER", 
    E[E.MUCHLOWER = 4] = "MUCHLOWER", E[E.UNKNOWN5 = 5] = "UNKNOWN5";
    class tb {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsComparison(t, e) {
            return (e || new tb).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsComparison(t, e) {
            return t.setPosition(t.position() + 4), (e || new tb).__init(t.readInt32(t.position()) + t.position(), t);
        }
        condition() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readInt8(this.bb_pos + t) : d.UNKNOWN0;
        }
        currentValue() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        baselineValue() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        deviation() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readInt8(this.bb_pos + t) : c.MUCHHIGHER;
        }
        baselineType() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        baselineStartDate() {
            let t = this.bb.__offset(this.bb_pos, 14);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        static startComparison(t) {
            t.startObject(6);
        }
        static addCondition(t, e) {
            t.addFieldInt8(0, e, d.UNKNOWN0);
        }
        static addCurrentValue(t, e) {
            t.addFieldFloat32(1, e, 0);
        }
        static addBaselineValue(t, e) {
            t.addFieldFloat32(2, e, 0);
        }
        static addDeviation(t, e) {
            t.addFieldInt8(3, e, c.MUCHHIGHER);
        }
        static addBaselineType(t, e) {
            t.addFieldInt32(4, e, 0);
        }
        static addBaselineStartDate(t, e) {
            t.addFieldInt32(5, e, 0);
        }
        static endComparison(t) {
            return t.endObject();
        }
        static createComparison(t, e, i, a, s, n, r) {
            return tb.startComparison(t), tb.addCondition(t, e), tb.addCurrentValue(t, i), tb.addBaselineValue(t, a), 
            tb.addDeviation(t, s), tb.addBaselineType(t, n), tb.addBaselineStartDate(t, r), 
            tb.endComparison(t);
        }
    }
    (M = l || (l = {}))[M.CLEAR = 0] = "CLEAR", M[M.UNKNOWN1 = 1] = "UNKNOWN1", M[M.UNKNOWN2 = 2] = "UNKNOWN2", 
    M[M.SLEET = 3] = "SLEET", M[M.POSSIBLE_SLEET = 4] = "POSSIBLE_SLEET", M[M.HEAVY_RAIN = 5] = "HEAVY_RAIN", 
    M[M.RAIN = 6] = "RAIN", M[M.DRIZZLE = 7] = "DRIZZLE", M[M.POSSIBLE_DRIZZLE = 8] = "POSSIBLE_DRIZZLE", 
    M[M.HEAVY_SNOW = 9] = "HEAVY_SNOW", M[M.SNOW = 10] = "SNOW", M[M.UNKNOWN11 = 11] = "UNKNOWN11", 
    M[M.UNKNOWN12 = 12] = "UNKNOWN12", M[M.UNKNOWN13 = 13] = "UNKNOWN13", M[M.UNKNOWN14 = 14] = "UNKNOWN14", 
    M[M.UNKNOWN15 = 15] = "UNKNOWN15", M[M.UNKNOWN16 = 16] = "UNKNOWN16", M[M.UNKNOWN17 = 17] = "UNKNOWN17", 
    M[M.UNKNOWN18 = 18] = "UNKNOWN18", (R = u || (u = {}))[R.CLEAR = 0] = "CLEAR", R[R.START = 1] = "START", 
    R[R.STOP = 2] = "STOP", R[R.START_STOP = 3] = "START_STOP", R[R.STOP_START = 4] = "STOP_START", 
    R[R.CONSTANT = 5] = "CONSTANT", R[R.UNKNOWN6 = 6] = "UNKNOWN6", R[R.UNKNOWN7 = 7] = "UNKNOWN7", 
    (U = p || (p = {}))[U.FIRST_AT = 0] = "FIRST_AT", U[U.SECOND_AT = 1] = "SECOND_AT", 
    U[U.UNKNOWN2 = 2] = "UNKNOWN2";
    class th {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsParameter(t, e) {
            return (e || new th).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsParameter(t, e) {
            return t.setPosition(t.position() + 4), (e || new th).__init(t.readInt32(t.position()) + t.position(), t);
        }
        type() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readInt8(this.bb_pos + t) : p.FIRST_AT;
        }
        date() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        static startParameter(t) {
            t.startObject(2);
        }
        static addType(t, e) {
            t.addFieldInt8(0, e, p.FIRST_AT);
        }
        static addDate(t, e) {
            t.addFieldInt32(1, e, 0);
        }
        static endParameter(t) {
            return t.endObject();
        }
        static createParameter(t, e, i) {
            return th.startParameter(t), th.addType(t, e), th.addDate(t, i), th.endParameter(t);
        }
    }
    class tm {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsCondition(t, e) {
            return (e || new tm).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsCondition(t, e) {
            return t.setPosition(t.position() + 4), (e || new tm).__init(t.readInt32(t.position()) + t.position(), t);
        }
        startTime() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        endTime() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        forecastToken() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt8(this.bb_pos + t) : u.CLEAR;
        }
        beginCondition() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readInt8(this.bb_pos + t) : l.CLEAR;
        }
        endCondition() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readInt8(this.bb_pos + t) : l.CLEAR;
        }
        parameters(t, e) {
            let i = this.bb.__offset(this.bb_pos, 14);
            return i ? (e || new th).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        parametersLength() {
            let t = this.bb.__offset(this.bb_pos, 14);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        static startCondition(t) {
            t.startObject(6);
        }
        static addStartTime(t, e) {
            t.addFieldInt32(0, e, 0);
        }
        static addEndTime(t, e) {
            t.addFieldInt32(1, e, 0);
        }
        static addForecastToken(t, e) {
            t.addFieldInt8(2, e, u.CLEAR);
        }
        static addBeginCondition(t, e) {
            t.addFieldInt8(3, e, l.CLEAR);
        }
        static addEndCondition(t, e) {
            t.addFieldInt8(4, e, l.CLEAR);
        }
        static addParameters(t, e) {
            t.addFieldOffset(5, e, 0);
        }
        static createParametersVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startParametersVector(t, e) {
            t.startVector(4, e, 4);
        }
        static endCondition(t) {
            return t.endObject();
        }
        static createCondition(t, e, i, a, s, n, r) {
            return tm.startCondition(t), tm.addStartTime(t, e), tm.addEndTime(t, i), tm.addForecastToken(t, a), 
            tm.addBeginCondition(t, s), tm.addEndCondition(t, n), tm.addParameters(t, r), tm.endCondition(t);
        }
    }
    (W = b || (b = {}))[W.CLEAR = 0] = "CLEAR", W[W.RAIN = 1] = "RAIN", W[W.SNOW = 2] = "SNOW", 
    W[W.SLEET = 3] = "SLEET", W[W.HAIL = 4] = "HAIL", W[W.MIXED = 5] = "MIXED", W[W.UNKNOWN6 = 6] = "UNKNOWN6";
    class t_ {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsPrecipitationAmountByType(t, e) {
            return (e || new t_).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsPrecipitationAmountByType(t, e) {
            return t.setPosition(t.position() + 4), (e || new t_).__init(t.readInt32(t.position()) + t.position(), t);
        }
        precipitationType() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readInt8(this.bb_pos + t) : b.CLEAR;
        }
        expected() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        minimumSnow() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        maximumSnow() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        expectedSnow() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        static startPrecipitationAmountByType(t) {
            t.startObject(5);
        }
        static addPrecipitationType(t, e) {
            t.addFieldInt8(0, e, b.CLEAR);
        }
        static addExpected(t, e) {
            t.addFieldFloat32(1, e, 0);
        }
        static addMinimumSnow(t, e) {
            t.addFieldFloat32(2, e, 0);
        }
        static addMaximumSnow(t, e) {
            t.addFieldFloat32(3, e, 0);
        }
        static addExpectedSnow(t, e) {
            t.addFieldFloat32(4, e, 0);
        }
        static endPrecipitationAmountByType(t) {
            return t.endObject();
        }
        static createPrecipitationAmountByType(t, e, i, a, s, n) {
            return t_.startPrecipitationAmountByType(t), t_.addPrecipitationType(t, e), t_.addExpected(t, i), 
            t_.addMinimumSnow(t, a), t_.addMaximumSnow(t, s), t_.addExpectedSnow(t, n), t_.endPrecipitationAmountByType(t);
        }
    }
    (L = h || (h = {}))[L.RISING = 0] = "RISING", L[L.FALLING = 1] = "FALLING", L[L.STEADY = 2] = "STEADY", 
    L[L.UNKNOWN3 = 3] = "UNKNOWN3", (D = m || (m = {}))[D.CLEAR = 0] = "CLEAR", D[D.BLIZZARD = 1] = "BLIZZARD", 
    D[D.PRECIPITATION = 2] = "PRECIPITATION", D[D.UNKNOWN3 = 3] = "UNKNOWN3", D[D.UNKNOWN4 = 4] = "UNKNOWN4", 
    D[D.CLOUDY = 5] = "CLOUDY", D[D.DRIZZLE = 6] = "DRIZZLE", D[D.FLURRIES = 7] = "FLURRIES", 
    D[D.FOGGY = 8] = "FOGGY", D[D.UNKNOWN9 = 9] = "UNKNOWN9", D[D.UNKNOWN10 = 10] = "UNKNOWN10", 
    D[D.UNKNOWN11 = 11] = "UNKNOWN11", D[D.UNKNOWN12 = 12] = "UNKNOWN12", D[D.HAZE = 13] = "HAZE", 
    D[D.HEAVY_RAIN = 14] = "HEAVY_RAIN", D[D.HEAVY_SNOW = 15] = "HEAVY_SNOW", D[D.UNKNOWN16 = 16] = "UNKNOWN16", 
    D[D.UNKNOWN17 = 17] = "UNKNOWN17", D[D.ISOLATED_THUNDERSTORMS = 18] = "ISOLATED_THUNDERSTORMS", 
    D[D.MOSTLY_CLEAR = 19] = "MOSTLY_CLEAR", D[D.MOSTLY_CLOUDY = 20] = "MOSTLY_CLOUDY", 
    D[D.PARTLY_CLOUDY = 21] = "PARTLY_CLOUDY", D[D.RAIN = 22] = "RAIN", D[D.UNKNOWN23 = 23] = "UNKNOWN23", 
    D[D.UNKNOWN24 = 24] = "UNKNOWN24", D[D.UNKNOWN25 = 25] = "UNKNOWN25", D[D.SNOW = 26] = "SNOW", 
    D[D.UNKNOWN27 = 27] = "UNKNOWN27", D[D.UNKNOWN28 = 28] = "UNKNOWN28", D[D.FREEZING_DRIZZLE = 29] = "FREEZING_DRIZZLE", 
    D[D.THUNDERSTORMS = 30] = "THUNDERSTORMS", D[D.UNKNOWN31 = 31] = "UNKNOWN31", D[D.WINDY = 32] = "WINDY", 
    D[D.WINTRY_MIX = 33] = "WINTRY_MIX", D[D.UNKNOWN34 = 34] = "UNKNOWN34", D[D.UNKNOWN35 = 35] = "UNKNOWN35", 
    D[D.UNKNOWN36 = 36] = "UNKNOWN36", D[D.UNKNOWN37 = 37] = "UNKNOWN37", D[D.UNKNOWN38 = 38] = "UNKNOWN38", 
    D[D.UNKNOWN39 = 39] = "UNKNOWN39", D[D.UNKNOWN40 = 40] = "UNKNOWN40", D[D.UNKNOWN41 = 41] = "UNKNOWN41", 
    D[D.UNKNOWN42 = 42] = "UNKNOWN42", D[D.UNKNOWN43 = 43] = "UNKNOWN43", D[D.UNKNOWN44 = 44] = "UNKNOWN44";
    class ty {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsCurrentWeatherData(t, e) {
            return (e || new ty).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsCurrentWeatherData(t, e) {
            return t.setPosition(t.position() + 4), (e || new ty).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        asOf() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        cloudCover() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        cloudCoverLowAltPct() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        cloudCoverMidAltPct() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        cloudCoverHighAltPct() {
            let t = this.bb.__offset(this.bb_pos, 14);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        conditionCode() {
            let t = this.bb.__offset(this.bb_pos, 16);
            return t ? this.bb.readInt8(this.bb_pos + t) : m.CLEAR;
        }
        daylight() {
            let t = this.bb.__offset(this.bb_pos, 18);
            return !!t && !!this.bb.readInt8(this.bb_pos + t);
        }
        humidity() {
            let t = this.bb.__offset(this.bb_pos, 20);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        perceivedPrecipitationIntensity() {
            let t = this.bb.__offset(this.bb_pos, 22);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmount1h() {
            let t = this.bb.__offset(this.bb_pos, 24);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmount6h() {
            let t = this.bb.__offset(this.bb_pos, 26);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmount24h() {
            let t = this.bb.__offset(this.bb_pos, 28);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmountNext1h() {
            let t = this.bb.__offset(this.bb_pos, 30);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmountNext6h() {
            let t = this.bb.__offset(this.bb_pos, 32);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmountNext24h() {
            let t = this.bb.__offset(this.bb_pos, 34);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmountNext1hByType(t, e) {
            let i = this.bb.__offset(this.bb_pos, 36);
            return i ? (e || new t_).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        precipitationAmountNext1hByTypeLength() {
            let t = this.bb.__offset(this.bb_pos, 36);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        precipitationAmountNext6hByType(t, e) {
            let i = this.bb.__offset(this.bb_pos, 38);
            return i ? (e || new t_).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        precipitationAmountNext6hByTypeLength() {
            let t = this.bb.__offset(this.bb_pos, 38);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        precipitationAmountNext24hByType(t, e) {
            let i = this.bb.__offset(this.bb_pos, 40);
            return i ? (e || new t_).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        precipitationAmountNext24hByTypeLength() {
            let t = this.bb.__offset(this.bb_pos, 40);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        precipitationAmountPrevious1hByType(t, e) {
            let i = this.bb.__offset(this.bb_pos, 42);
            return i ? (e || new t_).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        precipitationAmountPrevious1hByTypeLength() {
            let t = this.bb.__offset(this.bb_pos, 42);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        precipitationAmountPrevious6hByType(t, e) {
            let i = this.bb.__offset(this.bb_pos, 44);
            return i ? (e || new t_).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        precipitationAmountPrevious6hByTypeLength() {
            let t = this.bb.__offset(this.bb_pos, 44);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        precipitationAmountPrevious24hByType(t, e) {
            let i = this.bb.__offset(this.bb_pos, 46);
            return i ? (e || new t_).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        precipitationAmountPrevious24hByTypeLength() {
            let t = this.bb.__offset(this.bb_pos, 46);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        precipitationIntensity() {
            let t = this.bb.__offset(this.bb_pos, 48);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        pressure() {
            let t = this.bb.__offset(this.bb_pos, 50);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        pressureTrend() {
            let t = this.bb.__offset(this.bb_pos, 52);
            return t ? this.bb.readInt8(this.bb_pos + t) : h.RISING;
        }
        snowfallAmount1h() {
            let t = this.bb.__offset(this.bb_pos, 54);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        snowfallAmount6h() {
            let t = this.bb.__offset(this.bb_pos, 56);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        snowfallAmount24h() {
            let t = this.bb.__offset(this.bb_pos, 58);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        snowfallAmountNext1h() {
            let t = this.bb.__offset(this.bb_pos, 60);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        snowfallAmountNext6h() {
            let t = this.bb.__offset(this.bb_pos, 62);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        snowfallAmountNext24h() {
            let t = this.bb.__offset(this.bb_pos, 64);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperature() {
            let t = this.bb.__offset(this.bb_pos, 66);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperatureApparent() {
            let t = this.bb.__offset(this.bb_pos, 68);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        unknown34() {
            let t = this.bb.__offset(this.bb_pos, 70);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperatureDewPoint() {
            let t = this.bb.__offset(this.bb_pos, 72);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        uvIndex() {
            let t = this.bb.__offset(this.bb_pos, 74);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        visibility() {
            let t = this.bb.__offset(this.bb_pos, 76);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        windDirection() {
            let t = this.bb.__offset(this.bb_pos, 78);
            return t ? this.bb.readInt16(this.bb_pos + t) : 0;
        }
        windGust() {
            let t = this.bb.__offset(this.bb_pos, 80);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        windSpeed() {
            let t = this.bb.__offset(this.bb_pos, 82);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        static startCurrentWeatherData(t) {
            t.startObject(40);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addAsOf(t, e) {
            t.addFieldInt32(1, e, 0);
        }
        static addCloudCover(t, e) {
            t.addFieldInt8(2, e, 0);
        }
        static addCloudCoverLowAltPct(t, e) {
            t.addFieldInt8(3, e, 0);
        }
        static addCloudCoverMidAltPct(t, e) {
            t.addFieldInt8(4, e, 0);
        }
        static addCloudCoverHighAltPct(t, e) {
            t.addFieldInt8(5, e, 0);
        }
        static addConditionCode(t, e) {
            t.addFieldInt8(6, e, m.CLEAR);
        }
        static addDaylight(t, e) {
            t.addFieldInt8(7, +e, 0);
        }
        static addHumidity(t, e) {
            t.addFieldInt8(8, e, 0);
        }
        static addPerceivedPrecipitationIntensity(t, e) {
            t.addFieldFloat32(9, e, 0);
        }
        static addPrecipitationAmount1h(t, e) {
            t.addFieldFloat32(10, e, 0);
        }
        static addPrecipitationAmount6h(t, e) {
            t.addFieldFloat32(11, e, 0);
        }
        static addPrecipitationAmount24h(t, e) {
            t.addFieldFloat32(12, e, 0);
        }
        static addPrecipitationAmountNext1h(t, e) {
            t.addFieldFloat32(13, e, 0);
        }
        static addPrecipitationAmountNext6h(t, e) {
            t.addFieldFloat32(14, e, 0);
        }
        static addPrecipitationAmountNext24h(t, e) {
            t.addFieldFloat32(15, e, 0);
        }
        static addPrecipitationAmountNext1hByType(t, e) {
            t.addFieldOffset(16, e, 0);
        }
        static createPrecipitationAmountNext1hByTypeVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPrecipitationAmountNext1hByTypeVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPrecipitationAmountNext6hByType(t, e) {
            t.addFieldOffset(17, e, 0);
        }
        static createPrecipitationAmountNext6hByTypeVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPrecipitationAmountNext6hByTypeVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPrecipitationAmountNext24hByType(t, e) {
            t.addFieldOffset(18, e, 0);
        }
        static createPrecipitationAmountNext24hByTypeVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPrecipitationAmountNext24hByTypeVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPrecipitationAmountPrevious1hByType(t, e) {
            t.addFieldOffset(19, e, 0);
        }
        static createPrecipitationAmountPrevious1hByTypeVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPrecipitationAmountPrevious1hByTypeVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPrecipitationAmountPrevious6hByType(t, e) {
            t.addFieldOffset(20, e, 0);
        }
        static createPrecipitationAmountPrevious6hByTypeVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPrecipitationAmountPrevious6hByTypeVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPrecipitationAmountPrevious24hByType(t, e) {
            t.addFieldOffset(21, e, 0);
        }
        static createPrecipitationAmountPrevious24hByTypeVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPrecipitationAmountPrevious24hByTypeVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPrecipitationIntensity(t, e) {
            t.addFieldFloat32(22, e, 0);
        }
        static addPressure(t, e) {
            t.addFieldFloat32(23, e, 0);
        }
        static addPressureTrend(t, e) {
            t.addFieldInt8(24, e, h.RISING);
        }
        static addSnowfallAmount1h(t, e) {
            t.addFieldFloat32(25, e, 0);
        }
        static addSnowfallAmount6h(t, e) {
            t.addFieldFloat32(26, e, 0);
        }
        static addSnowfallAmount24h(t, e) {
            t.addFieldFloat32(27, e, 0);
        }
        static addSnowfallAmountNext1h(t, e) {
            t.addFieldFloat32(28, e, 0);
        }
        static addSnowfallAmountNext6h(t, e) {
            t.addFieldFloat32(29, e, 0);
        }
        static addSnowfallAmountNext24h(t, e) {
            t.addFieldFloat32(30, e, 0);
        }
        static addTemperature(t, e) {
            t.addFieldFloat32(31, e, 0);
        }
        static addTemperatureApparent(t, e) {
            t.addFieldFloat32(32, e, 0);
        }
        static addUnknown34(t, e) {
            t.addFieldFloat32(33, e, 0);
        }
        static addTemperatureDewPoint(t, e) {
            t.addFieldFloat32(34, e, 0);
        }
        static addUvIndex(t, e) {
            t.addFieldInt8(35, e, 0);
        }
        static addVisibility(t, e) {
            t.addFieldFloat32(36, e, 0);
        }
        static addWindDirection(t, e) {
            t.addFieldInt16(37, e, 0);
        }
        static addWindGust(t, e) {
            t.addFieldFloat32(38, e, 0);
        }
        static addWindSpeed(t, e) {
            t.addFieldFloat32(39, e, 0);
        }
        static endCurrentWeatherData(t) {
            return t.endObject();
        }
        static createCurrentWeatherData(t, e, i, a, s, n, r, o, d, c, l, u, p, b, h, m, _, y, f, g, N, C, x, A, I, T, v, S, O, F, w, P, E, M, R, U, W, L, D, B, $) {
            return ty.startCurrentWeatherData(t), ty.addMetadata(t, e), ty.addAsOf(t, i), ty.addCloudCover(t, a), 
            ty.addCloudCoverLowAltPct(t, s), ty.addCloudCoverMidAltPct(t, n), ty.addCloudCoverHighAltPct(t, r), 
            ty.addConditionCode(t, o), ty.addDaylight(t, d), ty.addHumidity(t, c), ty.addPerceivedPrecipitationIntensity(t, l), 
            ty.addPrecipitationAmount1h(t, u), ty.addPrecipitationAmount6h(t, p), ty.addPrecipitationAmount24h(t, b), 
            ty.addPrecipitationAmountNext1h(t, h), ty.addPrecipitationAmountNext6h(t, m), ty.addPrecipitationAmountNext24h(t, _), 
            ty.addPrecipitationAmountNext1hByType(t, y), ty.addPrecipitationAmountNext6hByType(t, f), 
            ty.addPrecipitationAmountNext24hByType(t, g), ty.addPrecipitationAmountPrevious1hByType(t, N), 
            ty.addPrecipitationAmountPrevious6hByType(t, C), ty.addPrecipitationAmountPrevious24hByType(t, x), 
            ty.addPrecipitationIntensity(t, A), ty.addPressure(t, I), ty.addPressureTrend(t, T), 
            ty.addSnowfallAmount1h(t, v), ty.addSnowfallAmount6h(t, S), ty.addSnowfallAmount24h(t, O), 
            ty.addSnowfallAmountNext1h(t, F), ty.addSnowfallAmountNext6h(t, w), ty.addSnowfallAmountNext24h(t, P), 
            ty.addTemperature(t, E), ty.addTemperatureApparent(t, M), ty.addUnknown34(t, R), 
            ty.addTemperatureDewPoint(t, U), ty.addUvIndex(t, W), ty.addVisibility(t, L), ty.addWindDirection(t, D), 
            ty.addWindGust(t, B), ty.addWindSpeed(t, $), ty.endCurrentWeatherData(t);
        }
    }
    class tf {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsDayPartForecast(t, e) {
            return (e || new tf).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsDayPartForecast(t, e) {
            return t.setPosition(t.position() + 4), (e || new tf).__init(t.readInt32(t.position()) + t.position(), t);
        }
        forecastStart() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        forecastEnd() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        cloudCover() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        cloudCoverLowAltPct() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        cloudCoverMidAltPct() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        cloudCoverHighAltPct() {
            let t = this.bb.__offset(this.bb_pos, 14);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        conditionCode() {
            let t = this.bb.__offset(this.bb_pos, 16);
            return t ? this.bb.readInt8(this.bb_pos + t) : m.CLEAR;
        }
        humidity() {
            let t = this.bb.__offset(this.bb_pos, 18);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        humidityMax() {
            let t = this.bb.__offset(this.bb_pos, 20);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        humidityMin() {
            let t = this.bb.__offset(this.bb_pos, 22);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        precipitationAmount() {
            let t = this.bb.__offset(this.bb_pos, 24);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmountByType(t, e) {
            let i = this.bb.__offset(this.bb_pos, 26);
            return i ? (e || new t_).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        precipitationAmountByTypeLength() {
            let t = this.bb.__offset(this.bb_pos, 26);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        precipitationChance() {
            let t = this.bb.__offset(this.bb_pos, 28);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        precipitationType() {
            let t = this.bb.__offset(this.bb_pos, 30);
            return t ? this.bb.readInt8(this.bb_pos + t) : b.CLEAR;
        }
        snowfallAmount() {
            let t = this.bb.__offset(this.bb_pos, 32);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperatureMax() {
            let t = this.bb.__offset(this.bb_pos, 34);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperatureMin() {
            let t = this.bb.__offset(this.bb_pos, 36);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        visibilityMax() {
            let t = this.bb.__offset(this.bb_pos, 38);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        visibilityMin() {
            let t = this.bb.__offset(this.bb_pos, 40);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        windDirection() {
            let t = this.bb.__offset(this.bb_pos, 42);
            return t ? this.bb.readInt16(this.bb_pos + t) : 0;
        }
        windGustSpeedMax() {
            let t = this.bb.__offset(this.bb_pos, 44);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        windSpeed() {
            let t = this.bb.__offset(this.bb_pos, 46);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        windSpeedMax() {
            let t = this.bb.__offset(this.bb_pos, 48);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationIntensityMax() {
            let t = this.bb.__offset(this.bb_pos, 50);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        perceivedPrecipitationIntensityMax() {
            let t = this.bb.__offset(this.bb_pos, 52);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        uvIndexMin() {
            let t = this.bb.__offset(this.bb_pos, 54);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        uvIndexMax() {
            let t = this.bb.__offset(this.bb_pos, 56);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        temperatureApparentMin() {
            let t = this.bb.__offset(this.bb_pos, 58);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperatureApparentMax() {
            let t = this.bb.__offset(this.bb_pos, 60);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        daylight() {
            let t = this.bb.__offset(this.bb_pos, 62);
            return !!t && !!this.bb.readInt8(this.bb_pos + t);
        }
        static startDayPartForecast(t) {
            t.startObject(30);
        }
        static addForecastStart(t, e) {
            t.addFieldInt32(0, e, 0);
        }
        static addForecastEnd(t, e) {
            t.addFieldInt32(1, e, 0);
        }
        static addCloudCover(t, e) {
            t.addFieldInt8(2, e, 0);
        }
        static addCloudCoverLowAltPct(t, e) {
            t.addFieldInt8(3, e, 0);
        }
        static addCloudCoverMidAltPct(t, e) {
            t.addFieldInt8(4, e, 0);
        }
        static addCloudCoverHighAltPct(t, e) {
            t.addFieldInt8(5, e, 0);
        }
        static addConditionCode(t, e) {
            t.addFieldInt8(6, e, m.CLEAR);
        }
        static addHumidity(t, e) {
            t.addFieldInt8(7, e, 0);
        }
        static addHumidityMax(t, e) {
            t.addFieldInt8(8, e, 0);
        }
        static addHumidityMin(t, e) {
            t.addFieldInt8(9, e, 0);
        }
        static addPrecipitationAmount(t, e) {
            t.addFieldFloat32(10, e, 0);
        }
        static addPrecipitationAmountByType(t, e) {
            t.addFieldOffset(11, e, 0);
        }
        static createPrecipitationAmountByTypeVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPrecipitationAmountByTypeVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPrecipitationChance(t, e) {
            t.addFieldInt8(12, e, 0);
        }
        static addPrecipitationType(t, e) {
            t.addFieldInt8(13, e, b.CLEAR);
        }
        static addSnowfallAmount(t, e) {
            t.addFieldFloat32(14, e, 0);
        }
        static addTemperatureMax(t, e) {
            t.addFieldFloat32(15, e, 0);
        }
        static addTemperatureMin(t, e) {
            t.addFieldFloat32(16, e, 0);
        }
        static addVisibilityMax(t, e) {
            t.addFieldFloat32(17, e, 0);
        }
        static addVisibilityMin(t, e) {
            t.addFieldFloat32(18, e, 0);
        }
        static addWindDirection(t, e) {
            t.addFieldInt16(19, e, 0);
        }
        static addWindGustSpeedMax(t, e) {
            t.addFieldFloat32(20, e, 0);
        }
        static addWindSpeed(t, e) {
            t.addFieldFloat32(21, e, 0);
        }
        static addWindSpeedMax(t, e) {
            t.addFieldFloat32(22, e, 0);
        }
        static addPrecipitationIntensityMax(t, e) {
            t.addFieldFloat32(23, e, 0);
        }
        static addPerceivedPrecipitationIntensityMax(t, e) {
            t.addFieldFloat32(24, e, 0);
        }
        static addUvIndexMin(t, e) {
            t.addFieldInt8(25, e, 0);
        }
        static addUvIndexMax(t, e) {
            t.addFieldInt8(26, e, 0);
        }
        static addTemperatureApparentMin(t, e) {
            t.addFieldFloat32(27, e, 0);
        }
        static addTemperatureApparentMax(t, e) {
            t.addFieldFloat32(28, e, 0);
        }
        static addDaylight(t, e) {
            t.addFieldInt8(29, +e, 0);
        }
        static endDayPartForecast(t) {
            return t.endObject();
        }
        static createDayPartForecast(t, e, i, a, s, n, r, o, d, c, l, u, p, b, h, m, _, y, f, g, N, C, x, A, I, T, v, S, O, F, w) {
            return tf.startDayPartForecast(t), tf.addForecastStart(t, e), tf.addForecastEnd(t, i), 
            tf.addCloudCover(t, a), tf.addCloudCoverLowAltPct(t, s), tf.addCloudCoverMidAltPct(t, n), 
            tf.addCloudCoverHighAltPct(t, r), tf.addConditionCode(t, o), tf.addHumidity(t, d), 
            tf.addHumidityMax(t, c), tf.addHumidityMin(t, l), tf.addPrecipitationAmount(t, u), 
            tf.addPrecipitationAmountByType(t, p), tf.addPrecipitationChance(t, b), tf.addPrecipitationType(t, h), 
            tf.addSnowfallAmount(t, m), tf.addTemperatureMax(t, _), tf.addTemperatureMin(t, y), 
            tf.addVisibilityMax(t, f), tf.addVisibilityMin(t, g), tf.addWindDirection(t, N), 
            tf.addWindGustSpeedMax(t, C), tf.addWindSpeed(t, x), tf.addWindSpeedMax(t, A), tf.addPrecipitationIntensityMax(t, I), 
            tf.addPerceivedPrecipitationIntensityMax(t, T), tf.addUvIndexMin(t, v), tf.addUvIndexMax(t, S), 
            tf.addTemperatureApparentMin(t, O), tf.addTemperatureApparentMax(t, F), tf.addDaylight(t, w), 
            tf.endDayPartForecast(t);
        }
    }
    (B = _ || (_ = {}))[B.NEW = 0] = "NEW", B[B.WAXING_CRESCENT = 1] = "WAXING_CRESCENT", 
    B[B.FIRST_QUARTER = 2] = "FIRST_QUARTER", B[B.WAXING_GIBBOUS = 3] = "WAXING_GIBBOUS", 
    B[B.FULL = 4] = "FULL", B[B.WANING_GIBBOUS = 5] = "WANING_GIBBOUS", B[B.THIRD_QUARTER = 6] = "THIRD_QUARTER", 
    B[B.WANING_CRESCENT = 7] = "WANING_CRESCENT", B[B.UNKNOWN8 = 8] = "UNKNOWN8";
    class tg {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsDayWeatherConditions(t, e) {
            return (e || new tg).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsDayWeatherConditions(t, e) {
            return t.setPosition(t.position() + 4), (e || new tg).__init(t.readInt32(t.position()) + t.position(), t);
        }
        forecastStart() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        forecastEnd() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        conditionCode() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt8(this.bb_pos + t) : m.CLEAR;
        }
        humidityMax() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        humidityMin() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        maxUvIndex() {
            let t = this.bb.__offset(this.bb_pos, 14);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        moonPhase() {
            let t = this.bb.__offset(this.bb_pos, 16);
            return t ? this.bb.readInt8(this.bb_pos + t) : _.NEW;
        }
        moonrise() {
            let t = this.bb.__offset(this.bb_pos, 18);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        moonset() {
            let t = this.bb.__offset(this.bb_pos, 20);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        precipitationAmount() {
            let t = this.bb.__offset(this.bb_pos, 22);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmountByType(t, e) {
            let i = this.bb.__offset(this.bb_pos, 24);
            return i ? (e || new t_).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        precipitationAmountByTypeLength() {
            let t = this.bb.__offset(this.bb_pos, 24);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        precipitationChance() {
            let t = this.bb.__offset(this.bb_pos, 26);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        precipitationType() {
            let t = this.bb.__offset(this.bb_pos, 28);
            return t ? this.bb.readInt8(this.bb_pos + t) : b.CLEAR;
        }
        snowfallAmount() {
            let t = this.bb.__offset(this.bb_pos, 30);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        solarMidnight() {
            let t = this.bb.__offset(this.bb_pos, 32);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        solarNoon() {
            let t = this.bb.__offset(this.bb_pos, 34);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        sunrise() {
            let t = this.bb.__offset(this.bb_pos, 36);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        sunriseCivil() {
            let t = this.bb.__offset(this.bb_pos, 38);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        sunriseNautical() {
            let t = this.bb.__offset(this.bb_pos, 40);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        sunriseAstronomical() {
            let t = this.bb.__offset(this.bb_pos, 42);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        sunset() {
            let t = this.bb.__offset(this.bb_pos, 44);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        sunsetCivil() {
            let t = this.bb.__offset(this.bb_pos, 46);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        sunsetNautical() {
            let t = this.bb.__offset(this.bb_pos, 48);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        sunsetAstronomical() {
            let t = this.bb.__offset(this.bb_pos, 50);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        temperatureMax() {
            let t = this.bb.__offset(this.bb_pos, 52);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperatureMaxTime() {
            let t = this.bb.__offset(this.bb_pos, 54);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        temperatureMin() {
            let t = this.bb.__offset(this.bb_pos, 56);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperatureMinTime() {
            let t = this.bb.__offset(this.bb_pos, 58);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        windGustSpeedMax() {
            let t = this.bb.__offset(this.bb_pos, 60);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        windSpeedAvg() {
            let t = this.bb.__offset(this.bb_pos, 62);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        windSpeedMax() {
            let t = this.bb.__offset(this.bb_pos, 64);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        visibilityMax() {
            let t = this.bb.__offset(this.bb_pos, 66);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        visibilityMin() {
            let t = this.bb.__offset(this.bb_pos, 68);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        overnightForecast(t) {
            let e = this.bb.__offset(this.bb_pos, 70);
            return e ? (t || new tf).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        daytimeForecast(t) {
            let e = this.bb.__offset(this.bb_pos, 72);
            return e ? (t || new tf).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        restOfDayForecast(t) {
            let e = this.bb.__offset(this.bb_pos, 74);
            return e ? (t || new tf).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        static startDayWeatherConditions(t) {
            t.startObject(36);
        }
        static addForecastStart(t, e) {
            t.addFieldInt32(0, e, 0);
        }
        static addForecastEnd(t, e) {
            t.addFieldInt32(1, e, 0);
        }
        static addConditionCode(t, e) {
            t.addFieldInt8(2, e, m.CLEAR);
        }
        static addHumidityMax(t, e) {
            t.addFieldInt8(3, e, 0);
        }
        static addHumidityMin(t, e) {
            t.addFieldInt8(4, e, 0);
        }
        static addMaxUvIndex(t, e) {
            t.addFieldInt8(5, e, 0);
        }
        static addMoonPhase(t, e) {
            t.addFieldInt8(6, e, _.NEW);
        }
        static addMoonrise(t, e) {
            t.addFieldInt32(7, e, 0);
        }
        static addMoonset(t, e) {
            t.addFieldInt32(8, e, 0);
        }
        static addPrecipitationAmount(t, e) {
            t.addFieldFloat32(9, e, 0);
        }
        static addPrecipitationAmountByType(t, e) {
            t.addFieldOffset(10, e, 0);
        }
        static createPrecipitationAmountByTypeVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPrecipitationAmountByTypeVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPrecipitationChance(t, e) {
            t.addFieldInt8(11, e, 0);
        }
        static addPrecipitationType(t, e) {
            t.addFieldInt8(12, e, b.CLEAR);
        }
        static addSnowfallAmount(t, e) {
            t.addFieldFloat32(13, e, 0);
        }
        static addSolarMidnight(t, e) {
            t.addFieldInt32(14, e, 0);
        }
        static addSolarNoon(t, e) {
            t.addFieldInt32(15, e, 0);
        }
        static addSunrise(t, e) {
            t.addFieldInt32(16, e, 0);
        }
        static addSunriseCivil(t, e) {
            t.addFieldInt32(17, e, 0);
        }
        static addSunriseNautical(t, e) {
            t.addFieldInt32(18, e, 0);
        }
        static addSunriseAstronomical(t, e) {
            t.addFieldInt32(19, e, 0);
        }
        static addSunset(t, e) {
            t.addFieldInt32(20, e, 0);
        }
        static addSunsetCivil(t, e) {
            t.addFieldInt32(21, e, 0);
        }
        static addSunsetNautical(t, e) {
            t.addFieldInt32(22, e, 0);
        }
        static addSunsetAstronomical(t, e) {
            t.addFieldInt32(23, e, 0);
        }
        static addTemperatureMax(t, e) {
            t.addFieldFloat32(24, e, 0);
        }
        static addTemperatureMaxTime(t, e) {
            t.addFieldInt32(25, e, 0);
        }
        static addTemperatureMin(t, e) {
            t.addFieldFloat32(26, e, 0);
        }
        static addTemperatureMinTime(t, e) {
            t.addFieldInt32(27, e, 0);
        }
        static addWindGustSpeedMax(t, e) {
            t.addFieldFloat32(28, e, 0);
        }
        static addWindSpeedAvg(t, e) {
            t.addFieldFloat32(29, e, 0);
        }
        static addWindSpeedMax(t, e) {
            t.addFieldFloat32(30, e, 0);
        }
        static addVisibilityMax(t, e) {
            t.addFieldFloat32(31, e, 0);
        }
        static addVisibilityMin(t, e) {
            t.addFieldFloat32(32, e, 0);
        }
        static addOvernightForecast(t, e) {
            t.addFieldOffset(33, e, 0);
        }
        static addDaytimeForecast(t, e) {
            t.addFieldOffset(34, e, 0);
        }
        static addRestOfDayForecast(t, e) {
            t.addFieldOffset(35, e, 0);
        }
        static endDayWeatherConditions(t) {
            return t.endObject();
        }
    }
    class tN {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsDailyForecastData(t, e) {
            return (e || new tN).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsDailyForecastData(t, e) {
            return t.setPosition(t.position() + 4), (e || new tN).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        days(t, e) {
            let i = this.bb.__offset(this.bb_pos, 6);
            return i ? (e || new tg).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        daysLength() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        static startDailyForecastData(t) {
            t.startObject(2);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addDays(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static createDaysVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startDaysVector(t, e) {
            t.startVector(4, e, 4);
        }
        static endDailyForecastData(t) {
            return t.endObject();
        }
        static createDailyForecastData(t, e, i) {
            return tN.startDailyForecastData(t), tN.addMetadata(t, e), tN.addDays(t, i), tN.endDailyForecastData(t);
        }
    }
    class tC {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsForecastMinute(t, e) {
            return (e || new tC).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsForecastMinute(t, e) {
            return t.setPosition(t.position() + 4), (e || new tC).__init(t.readInt32(t.position()) + t.position(), t);
        }
        startTime() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        precipitationChance() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        precipitationIntensity() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        perceivedPrecipitationIntensity() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        static startForecastMinute(t) {
            t.startObject(4);
        }
        static addStartTime(t, e) {
            t.addFieldInt32(0, e, 0);
        }
        static addPrecipitationChance(t, e) {
            t.addFieldInt8(1, e, 0);
        }
        static addPrecipitationIntensity(t, e) {
            t.addFieldFloat32(2, e, 0);
        }
        static addPerceivedPrecipitationIntensity(t, e) {
            t.addFieldFloat32(3, e, 0);
        }
        static endForecastMinute(t) {
            return t.endObject();
        }
        static createForecastMinute(t, e, i, a, s) {
            return tC.startForecastMinute(t), tC.addStartTime(t, e), tC.addPrecipitationChance(t, i), 
            tC.addPrecipitationIntensity(t, a), tC.addPerceivedPrecipitationIntensity(t, s), 
            tC.endForecastMinute(t);
        }
    }
    class tx {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsForecastPeriodSummary(t, e) {
            return (e || new tx).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsForecastPeriodSummary(t, e) {
            return t.setPosition(t.position() + 4), (e || new tx).__init(t.readInt32(t.position()) + t.position(), t);
        }
        startTime() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        endTime() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        condition() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt8(this.bb_pos + t) : b.CLEAR;
        }
        precipitationChance() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        precipitationIntensity() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        static startForecastPeriodSummary(t) {
            t.startObject(5);
        }
        static addStartTime(t, e) {
            t.addFieldInt32(0, e, 0);
        }
        static addEndTime(t, e) {
            t.addFieldInt32(1, e, 0);
        }
        static addCondition(t, e) {
            t.addFieldInt8(2, e, b.CLEAR);
        }
        static addPrecipitationChance(t, e) {
            t.addFieldInt8(3, e, 0);
        }
        static addPrecipitationIntensity(t, e) {
            t.addFieldFloat32(4, e, 0);
        }
        static endForecastPeriodSummary(t) {
            return t.endObject();
        }
        static createForecastPeriodSummary(t, e, i, a, s, n) {
            return tx.startForecastPeriodSummary(t), tx.addStartTime(t, e), tx.addEndTime(t, i), 
            tx.addCondition(t, a), tx.addPrecipitationChance(t, s), tx.addPrecipitationIntensity(t, n), 
            tx.endForecastPeriodSummary(t);
        }
    }
    class tA {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsHistoricalComparison(t, e) {
            return (e || new tA).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsHistoricalComparison(t, e) {
            return t.setPosition(t.position() + 4), (e || new tA).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        comparisons(t, e) {
            let i = this.bb.__offset(this.bb_pos, 6);
            return i ? (e || new tb).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        comparisonsLength() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        static startHistoricalComparison(t) {
            t.startObject(2);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addComparisons(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static createComparisonsVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startComparisonsVector(t, e) {
            t.startVector(4, e, 4);
        }
        static endHistoricalComparison(t) {
            return t.endObject();
        }
        static createHistoricalComparison(t, e, i) {
            return tA.startHistoricalComparison(t), tA.addMetadata(t, e), tA.addComparisons(t, i), 
            tA.endHistoricalComparison(t);
        }
    }
    class tI {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsHourWeatherConditions(t, e) {
            return (e || new tI).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsHourWeatherConditions(t, e) {
            return t.setPosition(t.position() + 4), (e || new tI).__init(t.readInt32(t.position()) + t.position(), t);
        }
        forecastStart() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        cloudCover() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        cloudCoverLowAltPct() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        cloudCoverMidAltPct() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        cloudCoverHighAltPct() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        conditionCode() {
            let t = this.bb.__offset(this.bb_pos, 14);
            return t ? this.bb.readInt8(this.bb_pos + t) : m.CLEAR;
        }
        daylight() {
            let t = this.bb.__offset(this.bb_pos, 16);
            return !!t && !!this.bb.readInt8(this.bb_pos + t);
        }
        humidity() {
            let t = this.bb.__offset(this.bb_pos, 18);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        perceivedPrecipitationIntensity() {
            let t = this.bb.__offset(this.bb_pos, 20);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationAmount() {
            let t = this.bb.__offset(this.bb_pos, 22);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationIntensity() {
            let t = this.bb.__offset(this.bb_pos, 24);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        precipitationChance() {
            let t = this.bb.__offset(this.bb_pos, 26);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        precipitationType() {
            let t = this.bb.__offset(this.bb_pos, 28);
            return t ? this.bb.readInt8(this.bb_pos + t) : b.CLEAR;
        }
        pressure() {
            let t = this.bb.__offset(this.bb_pos, 30);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        pressureTrend() {
            let t = this.bb.__offset(this.bb_pos, 32);
            return t ? this.bb.readInt8(this.bb_pos + t) : h.RISING;
        }
        snowfallAmount() {
            let t = this.bb.__offset(this.bb_pos, 34);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        snowfallIntensity() {
            let t = this.bb.__offset(this.bb_pos, 36);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperature() {
            let t = this.bb.__offset(this.bb_pos, 38);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperatureApparent() {
            let t = this.bb.__offset(this.bb_pos, 40);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        unknown20() {
            let t = this.bb.__offset(this.bb_pos, 42);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        temperatureDewPoint() {
            let t = this.bb.__offset(this.bb_pos, 44);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        uvIndex() {
            let t = this.bb.__offset(this.bb_pos, 46);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        visibility() {
            let t = this.bb.__offset(this.bb_pos, 48);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        windDirection() {
            let t = this.bb.__offset(this.bb_pos, 50);
            return t ? this.bb.readInt16(this.bb_pos + t) : 0;
        }
        windGust() {
            let t = this.bb.__offset(this.bb_pos, 52);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        windSpeed() {
            let t = this.bb.__offset(this.bb_pos, 54);
            return t ? this.bb.readFloat32(this.bb_pos + t) : 0;
        }
        static startHourWeatherConditions(t) {
            t.startObject(26);
        }
        static addForecastStart(t, e) {
            t.addFieldInt32(0, e, 0);
        }
        static addCloudCover(t, e) {
            t.addFieldInt8(1, e, 0);
        }
        static addCloudCoverLowAltPct(t, e) {
            t.addFieldInt8(2, e, 0);
        }
        static addCloudCoverMidAltPct(t, e) {
            t.addFieldInt8(3, e, 0);
        }
        static addCloudCoverHighAltPct(t, e) {
            t.addFieldInt8(4, e, 0);
        }
        static addConditionCode(t, e) {
            t.addFieldInt8(5, e, m.CLEAR);
        }
        static addDaylight(t, e) {
            t.addFieldInt8(6, +e, 0);
        }
        static addHumidity(t, e) {
            t.addFieldInt8(7, e, 0);
        }
        static addPerceivedPrecipitationIntensity(t, e) {
            t.addFieldFloat32(8, e, 0);
        }
        static addPrecipitationAmount(t, e) {
            t.addFieldFloat32(9, e, 0);
        }
        static addPrecipitationIntensity(t, e) {
            t.addFieldFloat32(10, e, 0);
        }
        static addPrecipitationChance(t, e) {
            t.addFieldInt8(11, e, 0);
        }
        static addPrecipitationType(t, e) {
            t.addFieldInt8(12, e, b.CLEAR);
        }
        static addPressure(t, e) {
            t.addFieldFloat32(13, e, 0);
        }
        static addPressureTrend(t, e) {
            t.addFieldInt8(14, e, h.RISING);
        }
        static addSnowfallAmount(t, e) {
            t.addFieldFloat32(15, e, 0);
        }
        static addSnowfallIntensity(t, e) {
            t.addFieldFloat32(16, e, 0);
        }
        static addTemperature(t, e) {
            t.addFieldFloat32(17, e, 0);
        }
        static addTemperatureApparent(t, e) {
            t.addFieldFloat32(18, e, 0);
        }
        static addUnknown20(t, e) {
            t.addFieldFloat32(19, e, 0);
        }
        static addTemperatureDewPoint(t, e) {
            t.addFieldFloat32(20, e, 0);
        }
        static addUvIndex(t, e) {
            t.addFieldInt8(21, e, 0);
        }
        static addVisibility(t, e) {
            t.addFieldFloat32(22, e, 0);
        }
        static addWindDirection(t, e) {
            t.addFieldInt16(23, e, 0);
        }
        static addWindGust(t, e) {
            t.addFieldFloat32(24, e, 0);
        }
        static addWindSpeed(t, e) {
            t.addFieldFloat32(25, e, 0);
        }
        static endHourWeatherConditions(t) {
            return t.endObject();
        }
        static createHourWeatherConditions(t, e, i, a, s, n, r, o, d, c, l, u, p, b, h, m, _, y, f, g, N, C, x, A, I, T, v) {
            return tI.startHourWeatherConditions(t), tI.addForecastStart(t, e), tI.addCloudCover(t, i), 
            tI.addCloudCoverLowAltPct(t, a), tI.addCloudCoverMidAltPct(t, s), tI.addCloudCoverHighAltPct(t, n), 
            tI.addConditionCode(t, r), tI.addDaylight(t, o), tI.addHumidity(t, d), tI.addPerceivedPrecipitationIntensity(t, c), 
            tI.addPrecipitationAmount(t, l), tI.addPrecipitationIntensity(t, u), tI.addPrecipitationChance(t, p), 
            tI.addPrecipitationType(t, b), tI.addPressure(t, h), tI.addPressureTrend(t, m), 
            tI.addSnowfallAmount(t, _), tI.addSnowfallIntensity(t, y), tI.addTemperature(t, f), 
            tI.addTemperatureApparent(t, g), tI.addUnknown20(t, N), tI.addTemperatureDewPoint(t, C), 
            tI.addUvIndex(t, x), tI.addVisibility(t, A), tI.addWindDirection(t, I), tI.addWindGust(t, T), 
            tI.addWindSpeed(t, v), tI.endHourWeatherConditions(t);
        }
    }
    class tT {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsHourlyForecastData(t, e) {
            return (e || new tT).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsHourlyForecastData(t, e) {
            return t.setPosition(t.position() + 4), (e || new tT).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        hours(t, e) {
            let i = this.bb.__offset(this.bb_pos, 6);
            return i ? (e || new tI).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        hoursLength() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        static startHourlyForecastData(t) {
            t.startObject(2);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addHours(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static createHoursVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startHoursVector(t, e) {
            t.startVector(4, e, 4);
        }
        static endHourlyForecastData(t) {
            return t.endObject();
        }
        static createHourlyForecastData(t, e, i) {
            return tT.startHourlyForecastData(t), tT.addMetadata(t, e), tT.addHours(t, i), tT.endHourlyForecastData(t);
        }
    }
    ($ = y || (y = {}))[$.NORMAL = 0] = "NORMAL", $[$.LOW = 1] = "LOW", $[$.HIGH = 2] = "HIGH", 
    $[$.UNKNOWN3 = 3] = "UNKNOWN3", $[$.UNKNOWN4 = 4] = "UNKNOWN4", $[$.UNKNOWN5 = 5] = "UNKNOWN5";
    class tv {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsLocationInfo(t, e) {
            return (e || new tv).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsLocationInfo(t, e) {
            return t.setPosition(t.position() + 4), (e || new tv).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        preciseName(t) {
            let e = this.bb.__offset(this.bb_pos, 6);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        countryCode(t) {
            let e = this.bb.__offset(this.bb_pos, 8);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        timeZone(t) {
            let e = this.bb.__offset(this.bb_pos, 10);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        primaryName(t) {
            let e = this.bb.__offset(this.bb_pos, 12);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        static startLocationInfo(t) {
            t.startObject(5);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addPreciseName(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static addCountryCode(t, e) {
            t.addFieldOffset(2, e, 0);
        }
        static addTimeZone(t, e) {
            t.addFieldOffset(3, e, 0);
        }
        static addPrimaryName(t, e) {
            t.addFieldOffset(4, e, 0);
        }
        static endLocationInfo(t) {
            return t.endObject();
        }
        static createLocationInfo(t, e, i, a, s, n) {
            return tv.startLocationInfo(t), tv.addMetadata(t, e), tv.addPreciseName(t, i), tv.addCountryCode(t, a), 
            tv.addTimeZone(t, s), tv.addPrimaryName(t, n), tv.endLocationInfo(t);
        }
    }
    (H = f || (f = {}))[H.UNKNOWN0 = 0] = "UNKNOWN0", H[H.AIR_QUALITY_DETAILS = 1] = "AIR_QUALITY_DETAILS", 
    H[H.UNKNOWN2 = 2] = "UNKNOWN2", H[H.UNKNOWN3 = 3] = "UNKNOWN3", H[H.UNKNOWN4 = 4] = "UNKNOWN4", 
    H[H.UNKNOWN5 = 5] = "UNKNOWN5", H[H.UNKNOWN6 = 6] = "UNKNOWN6", H[H.UNKNOWN7 = 7] = "UNKNOWN7", 
    H[H.UNKNOWN8 = 8] = "UNKNOWN8", H[H.TEMPERATURE_FEELS_LIKE_DETAILS = 9] = "TEMPERATURE_FEELS_LIKE_DETAILS", 
    H[H.UNKNOWN10 = 10] = "UNKNOWN10", H[H.TRENDS = 11] = "TRENDS", H[H.UV_DETAILS = 12] = "UV_DETAILS", 
    H[H.UNKNOWN13 = 13] = "UNKNOWN13", H[H.WIND_DETAILS = 14] = "WIND_DETAILS", H[H.UNKNOWN15 = 15] = "UNKNOWN15", 
    H[H.UNKNOWN16 = 16] = "UNKNOWN16", H[H.UNKNOWN17 = 17] = "UNKNOWN17", H[H.UNKNOWN18 = 18] = "UNKNOWN18";
    class tS {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsPlacement(t, e) {
            return (e || new tS).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsPlacement(t, e) {
            return t.setPosition(t.position() + 4), (e || new tS).__init(t.readInt32(t.position()) + t.position(), t);
        }
        priority() {
            let t = this.bb.__offset(this.bb_pos, 4);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        articles(t, e) {
            let i = this.bb.__offset(this.bb_pos, 6);
            return i ? (e || new tu).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        articlesLength() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        placement() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readInt8(this.bb_pos + t) : f.UNKNOWN0;
        }
        static startPlacement(t) {
            t.startObject(3);
        }
        static addPriority(t, e) {
            t.addFieldInt8(0, e, 0);
        }
        static addArticles(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static createArticlesVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startArticlesVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addPlacement(t, e) {
            t.addFieldInt8(2, e, f.UNKNOWN0);
        }
        static endPlacement(t) {
            return t.endObject();
        }
        static createPlacement(t, e, i, a) {
            return tS.startPlacement(t), tS.addPriority(t, e), tS.addArticles(t, i), tS.addPlacement(t, a), 
            tS.endPlacement(t);
        }
    }
    class tO {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsNews(t, e) {
            return (e || new tO).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsNews(t, e) {
            return t.setPosition(t.position() + 4), (e || new tO).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        placements(t, e) {
            let i = this.bb.__offset(this.bb_pos, 6);
            return i ? (e || new tS).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        placementsLength() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        static startNews(t) {
            t.startObject(2);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addPlacements(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static createPlacementsVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startPlacementsVector(t, e) {
            t.startVector(4, e, 4);
        }
        static endNews(t) {
            return t.endObject();
        }
        static createNews(t, e, i) {
            return tO.startNews(t), tO.addMetadata(t, e), tO.addPlacements(t, i), tO.endNews(t);
        }
    }
    class tF {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsNextHourForecastData(t, e) {
            return (e || new tF).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsNextHourForecastData(t, e) {
            return t.setPosition(t.position() + 4), (e || new tF).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        condition(t, e) {
            let i = this.bb.__offset(this.bb_pos, 6);
            return i ? (e || new tm).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        conditionLength() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        summary(t, e) {
            let i = this.bb.__offset(this.bb_pos, 8);
            return i ? (e || new tx).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        summaryLength() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        forecastStart() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        forecastEnd() {
            let t = this.bb.__offset(this.bb_pos, 12);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        minutes(t, e) {
            let i = this.bb.__offset(this.bb_pos, 14);
            return i ? (e || new tC).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        minutesLength() {
            let t = this.bb.__offset(this.bb_pos, 14);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        static startNextHourForecastData(t) {
            t.startObject(6);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addCondition(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static createConditionVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startConditionVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addSummary(t, e) {
            t.addFieldOffset(2, e, 0);
        }
        static createSummaryVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startSummaryVector(t, e) {
            t.startVector(4, e, 4);
        }
        static addForecastStart(t, e) {
            t.addFieldInt32(3, e, 0);
        }
        static addForecastEnd(t, e) {
            t.addFieldInt32(4, e, 0);
        }
        static addMinutes(t, e) {
            t.addFieldOffset(5, e, 0);
        }
        static createMinutesVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startMinutesVector(t, e) {
            t.startVector(4, e, 4);
        }
        static endNextHourForecastData(t) {
            return t.endObject();
        }
        static createNextHourForecastData(t, e, i, a, s, n, r) {
            return tF.startNextHourForecastData(t), tF.addMetadata(t, e), tF.addCondition(t, i), 
            tF.addSummary(t, a), tF.addForecastStart(t, s), tF.addForecastEnd(t, n), tF.addMinutes(t, r), 
            tF.endNextHourForecastData(t);
        }
    }
    (K = g || (g = {}))[K.UNKNOWN0 = 0] = "UNKNOWN0", K[K.SHELTER = 1] = "SHELTER", 
    K[K.EVACUATE = 2] = "EVACUATE", K[K.PREPARE = 3] = "PREPARE", K[K.EXECUTE = 4] = "EXECUTE", 
    K[K.AVOID = 5] = "AVOID", K[K.MONITOR = 6] = "MONITOR", K[K.ACCESS = 7] = "ACCESS", 
    K[K.ALLCLEAR = 8] = "ALLCLEAR", K[K.NONE = 9] = "NONE", K[K.UNKNOWN10 = 10] = "UNKNOWN10", 
    (V = N || (N = {}))[V.UNKNOWN = 0] = "UNKNOWN", V[V.EXTREME = 1] = "EXTREME", V[V.SEVERE = 2] = "SEVERE", 
    V[V.MODERATE = 3] = "MODERATE", V[V.MINOR = 4] = "MINOR", V[V.UNKNOWN5 = 5] = "UNKNOWN5", 
    (k = C || (C = {}))[k.UNKNOWN = 0] = "UNKNOWN", k[k.UNKNOWN1 = 1] = "UNKNOWN1", 
    k[k.UNKNOWN2 = 2] = "UNKNOWN2", k[k.UNKNOWN3 = 3] = "UNKNOWN3", k[k.UNKNOWN4 = 4] = "UNKNOWN4", 
    k[k.UNKNOWN5 = 5] = "UNKNOWN5", k[k.UNKNOWN6 = 6] = "UNKNOWN6", k[k.UNKNOWN7 = 7] = "UNKNOWN7", 
    k[k.UNKNOWN8 = 8] = "UNKNOWN8", k[k.UNKNOWN9 = 9] = "UNKNOWN9", k[k.STATEMENT = 10] = "STATEMENT", 
    k[k.WARNING = 11] = "WARNING", k[k.ADVISORY = 12] = "ADVISORY", k[k.UNKNOWN13 = 13] = "UNKNOWN13", 
    (G = x || (x = {}))[G.UNKNOWN = 0] = "UNKNOWN", G[G.IMMEDIATE = 1] = "IMMEDIATE", 
    G[G.EXPECTED = 2] = "EXPECTED", G[G.FUTURE = 3] = "FUTURE", G[G.PAST = 4] = "PAST", 
    G[G.UNKNOWN5 = 5] = "UNKNOWN5";
    class tw {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsWeatherAlertSummary(t, e) {
            return (e || new tw).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsWeatherAlertSummary(t, e) {
            return t.setPosition(t.position() + 4), (e || new tw).__init(t.readInt32(t.position()) + t.position(), t);
        }
        id(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new tl).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        areaId(t) {
            let e = this.bb.__offset(this.bb_pos, 6);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        areaName(t) {
            let e = this.bb.__offset(this.bb_pos, 8);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        attributionUrl(t) {
            let e = this.bb.__offset(this.bb_pos, 10);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        countryCode(t) {
            let e = this.bb.__offset(this.bb_pos, 12);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        description(t) {
            let e = this.bb.__offset(this.bb_pos, 14);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        token(t) {
            let e = this.bb.__offset(this.bb_pos, 16);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        effectiveTime() {
            let t = this.bb.__offset(this.bb_pos, 18);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        expireTime() {
            let t = this.bb.__offset(this.bb_pos, 20);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        issuedTime() {
            let t = this.bb.__offset(this.bb_pos, 22);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        eventOnsetTime() {
            let t = this.bb.__offset(this.bb_pos, 24);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        eventEndTime() {
            let t = this.bb.__offset(this.bb_pos, 26);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        detailsUrl(t) {
            let e = this.bb.__offset(this.bb_pos, 28);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        phenomenon(t) {
            let e = this.bb.__offset(this.bb_pos, 30);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        severity() {
            let t = this.bb.__offset(this.bb_pos, 32);
            return t ? this.bb.readInt8(this.bb_pos + t) : N.UNKNOWN;
        }
        significance() {
            let t = this.bb.__offset(this.bb_pos, 34);
            return t ? this.bb.readInt8(this.bb_pos + t) : C.UNKNOWN;
        }
        source(t) {
            let e = this.bb.__offset(this.bb_pos, 36);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        eventSource(t) {
            let e = this.bb.__offset(this.bb_pos, 38);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        urgency() {
            let t = this.bb.__offset(this.bb_pos, 40);
            return t ? this.bb.readInt8(this.bb_pos + t) : x.UNKNOWN;
        }
        certainty() {
            let t = this.bb.__offset(this.bb_pos, 42);
            return t ? this.bb.readInt8(this.bb_pos + t) : r.UNKNOWN;
        }
        importance() {
            let t = this.bb.__offset(this.bb_pos, 44);
            return t ? this.bb.readInt8(this.bb_pos + t) : y.NORMAL;
        }
        responses(t) {
            let e = this.bb.__offset(this.bb_pos, 46);
            return e ? this.bb.readInt8(this.bb.__vector(this.bb_pos + e) + t) : 0;
        }
        responsesLength() {
            let t = this.bb.__offset(this.bb_pos, 46);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        responsesArray() {
            let t = this.bb.__offset(this.bb_pos, 46);
            return t ? new Int8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
        }
        unknown23() {
            let t = this.bb.__offset(this.bb_pos, 48);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        unknown24() {
            let t = this.bb.__offset(this.bb_pos, 50);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        unknown25() {
            let t = this.bb.__offset(this.bb_pos, 52);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        unknown26() {
            let t = this.bb.__offset(this.bb_pos, 54);
            return t ? this.bb.readInt8(this.bb_pos + t) : 0;
        }
        static startWeatherAlertSummary(t) {
            t.startObject(26);
        }
        static addId(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addAreaId(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static addAreaName(t, e) {
            t.addFieldOffset(2, e, 0);
        }
        static addAttributionUrl(t, e) {
            t.addFieldOffset(3, e, 0);
        }
        static addCountryCode(t, e) {
            t.addFieldOffset(4, e, 0);
        }
        static addDescription(t, e) {
            t.addFieldOffset(5, e, 0);
        }
        static addToken(t, e) {
            t.addFieldOffset(6, e, 0);
        }
        static addEffectiveTime(t, e) {
            t.addFieldInt32(7, e, 0);
        }
        static addExpireTime(t, e) {
            t.addFieldInt32(8, e, 0);
        }
        static addIssuedTime(t, e) {
            t.addFieldInt32(9, e, 0);
        }
        static addEventOnsetTime(t, e) {
            t.addFieldInt32(10, e, 0);
        }
        static addEventEndTime(t, e) {
            t.addFieldInt32(11, e, 0);
        }
        static addDetailsUrl(t, e) {
            t.addFieldOffset(12, e, 0);
        }
        static addPhenomenon(t, e) {
            t.addFieldOffset(13, e, 0);
        }
        static addSeverity(t, e) {
            t.addFieldInt8(14, e, N.UNKNOWN);
        }
        static addSignificance(t, e) {
            t.addFieldInt8(15, e, C.UNKNOWN);
        }
        static addSource(t, e) {
            t.addFieldOffset(16, e, 0);
        }
        static addEventSource(t, e) {
            t.addFieldOffset(17, e, 0);
        }
        static addUrgency(t, e) {
            t.addFieldInt8(18, e, x.UNKNOWN);
        }
        static addCertainty(t, e) {
            t.addFieldInt8(19, e, r.UNKNOWN);
        }
        static addImportance(t, e) {
            t.addFieldInt8(20, e, y.NORMAL);
        }
        static addResponses(t, e) {
            t.addFieldOffset(21, e, 0);
        }
        static createResponsesVector(t, e) {
            t.startVector(1, e.length, 1);
            for (let i = e.length - 1; i >= 0; i--) t.addInt8(e[i]);
            return t.endVector();
        }
        static startResponsesVector(t, e) {
            t.startVector(1, e, 1);
        }
        static addUnknown23(t, e) {
            t.addFieldInt8(22, e, 0);
        }
        static addUnknown24(t, e) {
            t.addFieldInt8(23, e, 0);
        }
        static addUnknown25(t, e) {
            t.addFieldInt8(24, e, 0);
        }
        static addUnknown26(t, e) {
            t.addFieldInt8(25, e, 0);
        }
        static endWeatherAlertSummary(t) {
            return t.endObject();
        }
        static createWeatherAlertSummary(t, e, i, a, s, n, r, o, d, c, l, u, p, b, h, m, _, y, f, g, N, C, x, A, I, T, v) {
            return tw.startWeatherAlertSummary(t), tw.addId(t, e), tw.addAreaId(t, i), tw.addAreaName(t, a), 
            tw.addAttributionUrl(t, s), tw.addCountryCode(t, n), tw.addDescription(t, r), tw.addToken(t, o), 
            tw.addEffectiveTime(t, d), tw.addExpireTime(t, c), tw.addIssuedTime(t, l), tw.addEventOnsetTime(t, u), 
            tw.addEventEndTime(t, p), tw.addDetailsUrl(t, b), tw.addPhenomenon(t, h), tw.addSeverity(t, m), 
            tw.addSignificance(t, _), tw.addSource(t, y), tw.addEventSource(t, f), tw.addUrgency(t, g), 
            tw.addCertainty(t, N), tw.addImportance(t, C), tw.addResponses(t, x), tw.addUnknown23(t, A), 
            tw.addUnknown24(t, I), tw.addUnknown25(t, T), tw.addUnknown26(t, v), tw.endWeatherAlertSummary(t);
        }
    }
    class tP {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsWeatherAlertCollectionData(t, e) {
            return (e || new tP).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsWeatherAlertCollectionData(t, e) {
            return t.setPosition(t.position() + 4), (e || new tP).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        detailsUrl(t) {
            let e = this.bb.__offset(this.bb_pos, 6);
            return e ? this.bb.__string(this.bb_pos + e, t) : null;
        }
        alerts(t, e) {
            let i = this.bb.__offset(this.bb_pos, 8);
            return i ? (e || new tw).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        alertsLength() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        static startWeatherAlertCollectionData(t) {
            t.startObject(3);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addDetailsUrl(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static addAlerts(t, e) {
            t.addFieldOffset(2, e, 0);
        }
        static createAlertsVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startAlertsVector(t, e) {
            t.startVector(4, e, 4);
        }
        static endWeatherAlertCollectionData(t) {
            return t.endObject();
        }
        static createWeatherAlertCollectionData(t, e, i, a) {
            return tP.startWeatherAlertCollectionData(t), tP.addMetadata(t, e), tP.addDetailsUrl(t, i), 
            tP.addAlerts(t, a), tP.endWeatherAlertCollectionData(t);
        }
    }
    class tE {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsWeatherChanges(t, e) {
            return (e || new tE).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsWeatherChanges(t, e) {
            return t.setPosition(t.position() + 4), (e || new tE).__init(t.readInt32(t.position()) + t.position(), t);
        }
        metadata(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new to).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        forecastStart() {
            let t = this.bb.__offset(this.bb_pos, 6);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        forecastEnd() {
            let t = this.bb.__offset(this.bb_pos, 8);
            return t ? this.bb.readUint32(this.bb_pos + t) : 0;
        }
        changes(t, e) {
            let i = this.bb.__offset(this.bb_pos, 10);
            return i ? (e || new tp).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + i) + 4 * t), this.bb) : null;
        }
        changesLength() {
            let t = this.bb.__offset(this.bb_pos, 10);
            return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
        }
        static startWeatherChanges(t) {
            t.startObject(4);
        }
        static addMetadata(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addForecastStart(t, e) {
            t.addFieldInt32(1, e, 0);
        }
        static addForecastEnd(t, e) {
            t.addFieldInt32(2, e, 0);
        }
        static addChanges(t, e) {
            t.addFieldOffset(3, e, 0);
        }
        static createChangesVector(t, e) {
            t.startVector(4, e.length, 4);
            for (let i = e.length - 1; i >= 0; i--) t.addOffset(e[i]);
            return t.endVector();
        }
        static startChangesVector(t, e) {
            t.startVector(4, e, 4);
        }
        static endWeatherChanges(t) {
            return t.endObject();
        }
        static createWeatherChanges(t, e, i, a, s) {
            return tE.startWeatherChanges(t), tE.addMetadata(t, e), tE.addForecastStart(t, i), 
            tE.addForecastEnd(t, a), tE.addChanges(t, s), tE.endWeatherChanges(t);
        }
    }
    class tM {
        bb=null;
        bb_pos=0;
        __init(t, e) {
            return this.bb_pos = t, this.bb = e, this;
        }
        static getRootAsWeather(t, e) {
            return (e || new tM).__init(t.readInt32(t.position()) + t.position(), t);
        }
        static getSizePrefixedRootAsWeather(t, e) {
            return t.setPosition(t.position() + 4), (e || new tM).__init(t.readInt32(t.position()) + t.position(), t);
        }
        airQuality(t) {
            let e = this.bb.__offset(this.bb_pos, 4);
            return e ? (t || new tc).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        currentWeather(t) {
            let e = this.bb.__offset(this.bb_pos, 6);
            return e ? (t || new ty).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        forecastDaily(t) {
            let e = this.bb.__offset(this.bb_pos, 8);
            return e ? (t || new tN).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        forecastHourly(t) {
            let e = this.bb.__offset(this.bb_pos, 10);
            return e ? (t || new tT).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        forecastNextHour(t) {
            let e = this.bb.__offset(this.bb_pos, 12);
            return e ? (t || new tF).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        news(t) {
            let e = this.bb.__offset(this.bb_pos, 14);
            return e ? (t || new tO).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        weatherAlerts(t) {
            let e = this.bb.__offset(this.bb_pos, 16);
            return e ? (t || new tP).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        weatherChanges(t) {
            let e = this.bb.__offset(this.bb_pos, 18);
            return e ? (t || new tE).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        historicalComparisons(t) {
            let e = this.bb.__offset(this.bb_pos, 20);
            return e ? (t || new tA).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        locationInfo(t) {
            let e = this.bb.__offset(this.bb_pos, 22);
            return e ? (t || new tv).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
        }
        static startWeather(t) {
            t.startObject(10);
        }
        static addAirQuality(t, e) {
            t.addFieldOffset(0, e, 0);
        }
        static addCurrentWeather(t, e) {
            t.addFieldOffset(1, e, 0);
        }
        static addForecastDaily(t, e) {
            t.addFieldOffset(2, e, 0);
        }
        static addForecastHourly(t, e) {
            t.addFieldOffset(3, e, 0);
        }
        static addForecastNextHour(t, e) {
            t.addFieldOffset(4, e, 0);
        }
        static addNews(t, e) {
            t.addFieldOffset(5, e, 0);
        }
        static addWeatherAlerts(t, e) {
            t.addFieldOffset(6, e, 0);
        }
        static addWeatherChanges(t, e) {
            t.addFieldOffset(7, e, 0);
        }
        static addHistoricalComparisons(t, e) {
            t.addFieldOffset(8, e, 0);
        }
        static addLocationInfo(t, e) {
            t.addFieldOffset(9, e, 0);
        }
        static endWeather(t) {
            return t.endObject();
        }
        static finishWeatherBuffer(t, e) {
            t.finish(e);
        }
        static finishSizePrefixedWeatherBuffer(t, e) {
            t.finish(e, void 0, !0);
        }
    }
export {
    tc as AirQuality,
    tu as Articles,
    r as Certainty,
    tp as Change,
    tb as Comparison,
    e as ComparisonTrend,
    d as ComparisonType,
    tm as Condition,
    l as ConditionType,
    ty as CurrentWeatherData,
    tN as DailyForecastData,
    tf as DayPartForecast,
    tg as DayWeatherConditions,
    c as Deviation,
    o as Direction,
    tC as ForecastMinute,
    tx as ForecastPeriodSummary,
    u as ForecastToken,
    tA as HistoricalComparison,
    tI as HourWeatherConditions,
    tT as HourlyForecastData,
    y as ImportanceType,
    tv as LocationInfo,
    to as Metadata,
    _ as MoonPhase,
    tO as News,
    tF as NextHourForecastData,
    th as Parameter,
    p as ParameterType,
    tS as Placement,
    f as PlacementType,
    td as Pollutant,
    a as PollutantType,
    t_ as PrecipitationAmountByType,
    b as PrecipitationType,
    h as PressureTrend,
    g as ResponseType,
    N as Severity,
    C as SignificanceType,
    i as SourceType,
    s as UnitType,
    x as Urgency,
    tl as UUID,
    tM as Weather,
    tP as WeatherAlertCollectionData,
    tw as WeatherAlertSummary,
    tE as WeatherChanges,
    m as WeatherCondition,
};
