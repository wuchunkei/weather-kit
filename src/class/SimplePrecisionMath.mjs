export default class SimplePrecisionMath {
    /**
     * Get the number of decimal places.
     */
    static getDecimalLength(num) {
        const str = String(num);
        const decimalIndex = str.indexOf(".");
        return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
    }

    /**
     * Multiply two numbers while reducing floating-point precision noise.
     */
    static multiply(a, b, decimals = 15) {
        const numA = Number(a.toFixed(decimals));
        const numB = Number(b.toFixed(decimals));

        const lenA = SimplePrecisionMath.getDecimalLength(numA);
        const lenB = SimplePrecisionMath.getDecimalLength(numB);

        const factorA = 10 ** lenA;
        const factorB = 10 ** lenB;

        const intA = Math.round(numA * factorA);
        const intB = Math.round(numB * factorB);

        const result = (intA * intB) / (factorA * factorB);

        return Number(result.toFixed(decimals));
    }

    /**
     * Divide two numbers while reducing floating-point precision noise.
     */
    static divide(a, b, decimals = 15) {
        if (b === 0) {
            throw new Error("Division by zero is not allowed");
        }

        const numA = Number(a.toFixed(decimals));
        const numB = Number(b.toFixed(decimals));

        const lenA = SimplePrecisionMath.getDecimalLength(numA);
        const lenB = SimplePrecisionMath.getDecimalLength(numB);

        const factorA = 10 ** lenA;
        const factorB = 10 ** lenB;

        const intA = Math.round(numA * factorA);
        const intB = Math.round(numB * factorB);

        const result = (intA / intB) * (factorB / factorA);

        return Number(result.toFixed(decimals));
    }

    /**
     * Add two numbers while reducing floating-point precision noise.
     */
    static add(a, b, decimals = 15) {
        const numA = Number(a.toFixed(decimals));
        const numB = Number(b.toFixed(decimals));

        const lenA = SimplePrecisionMath.getDecimalLength(numA);
        const lenB = SimplePrecisionMath.getDecimalLength(numB);
        const maxLen = Math.max(lenA, lenB);
        const factor = 10 ** maxLen;

        const intA = Math.round(numA * factor);
        const intB = Math.round(numB * factor);

        return Number(((intA + intB) / factor).toFixed(decimals));
    }

    /**
     * Subtract two numbers while reducing floating-point precision noise.
     */
    static subtract(a, b, decimals = 15) {
        const numA = Number(a.toFixed(decimals));
        const numB = Number(b.toFixed(decimals));

        const lenA = SimplePrecisionMath.getDecimalLength(numA);
        const lenB = SimplePrecisionMath.getDecimalLength(numB);
        const maxLen = Math.max(lenA, lenB);
        const factor = 10 ** maxLen;

        const intA = Math.round(numA * factor);
        const intB = Math.round(numB * factor);

        return Number(((intA - intB) / factor).toFixed(decimals));
    }
}
