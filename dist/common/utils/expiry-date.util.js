"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateExpiryDate = calculateExpiryDate;
const ms = require("ms");
function calculateExpiryDate(expiration) {
    const now = new Date();
    try {
        const durationMs = ms(expiration);
        if (!durationMs || typeof durationMs !== 'number') {
            return new Date(now.getTime() + ms('7d'));
        }
        return new Date(now.getTime() + durationMs);
    }
    catch (error) {
        return new Date(now.getTime() + ms('7d'));
    }
}
//# sourceMappingURL=expiry-date.util.js.map