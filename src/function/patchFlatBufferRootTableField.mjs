function asUint8Array(bytes) {
    return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

function align(value, alignment) {
    return value + ((alignment - (value % alignment)) % alignment);
}

function isPlausibleOffset(fieldLocation, value, length) {
    return value > 0 && fieldLocation + value > fieldLocation && fieldLocation + value < length;
}

export default function patchFlatBufferRootTableField(rootBytes, fieldId, replacementRootBytes) {
    const original = asUint8Array(rootBytes);
    const replacement = asUint8Array(replacementRootBytes);
    if (original.byteLength < 8 || replacement.byteLength < 8) throw new Error("FlatBuffer is too small");

    const originalView = new DataView(original.buffer, original.byteOffset, original.byteLength);
    const replacementView = new DataView(replacement.buffer, replacement.byteOffset, replacement.byteLength);
    const originalRootTable = originalView.getUint32(0, true);
    const replacementRootTable = replacementView.getUint32(0, true);
    if (originalRootTable >= original.byteLength || replacementRootTable >= replacement.byteLength) throw new Error("Invalid FlatBuffer root table");

    const originalVTable = originalRootTable - originalView.getInt32(originalRootTable, true);
    if (originalVTable < 0 || originalVTable + 4 > original.byteLength) throw new Error("Invalid FlatBuffer vtable");

    const originalVTableLength = originalView.getUint16(originalVTable, true);
    const originalFieldCount = Math.max(0, (originalVTableLength - 4) / 2);
    const maxFieldId = Math.max(originalFieldCount - 1, fieldId);
    const newVTableLength = 4 + (maxFieldId + 1) * 2;
    const newObjectSize = 4 + (maxFieldId + 1) * 4;
    const newVTable = 4;
    const newTable = align(newVTable + newVTableLength, 4);
    const originalStart = align(newTable + newObjectSize, 8);
    const replacementStart = align(originalStart + original.byteLength, 8);
    const output = new Uint8Array(replacementStart + replacement.byteLength);
    const outputView = new DataView(output.buffer);

    output.set(original, originalStart);
    output.set(replacement, replacementStart);

    outputView.setUint32(0, newTable, true);
    outputView.setUint16(newVTable, newVTableLength, true);
    outputView.setUint16(newVTable + 2, newObjectSize, true);
    outputView.setInt32(newTable, newTable - newVTable, true);

    for (let index = 0; index < originalFieldCount; index++) {
        const originalVTableField = originalVTable + 4 + index * 2;
        if (originalVTableField + 2 > originalVTable + originalVTableLength) continue;

        const originalFieldOffset = originalView.getUint16(originalVTableField, true);
        if (!originalFieldOffset) continue;

        const newFieldOffset = 4 + index * 4;
        const originalFieldLocation = originalRootTable + originalFieldOffset;
        const newFieldLocation = newTable + newFieldOffset;
        outputView.setUint16(newVTable + 4 + index * 2, newFieldOffset, true);

        const originalValue = originalView.getUint32(originalFieldLocation, true);
        if (isPlausibleOffset(originalFieldLocation, originalValue, original.byteLength)) {
            const originalTarget = originalStart + originalFieldLocation + originalValue;
            outputView.setUint32(newFieldLocation, originalTarget - newFieldLocation, true);
        } else {
            output.set(original.subarray(originalFieldLocation, Math.min(originalFieldLocation + 4, original.byteLength)), newFieldLocation);
        }
    }

    const replacementFieldOffset = 4 + fieldId * 4;
    const replacementFieldLocation = newTable + replacementFieldOffset;
    const replacementTarget = replacementStart + replacementRootTable;
    outputView.setUint16(newVTable + 4 + fieldId * 2, replacementFieldOffset, true);
    outputView.setUint32(replacementFieldLocation, replacementTarget - replacementFieldLocation, true);

    return output;
}
