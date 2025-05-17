function serializeBigInt(obj) {
    if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
    } else if (obj && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v])
        );
    }
    return obj;
}

module.exports = { serializeBigInt };