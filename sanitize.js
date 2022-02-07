"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sanitize(x) {
    if (typeof x == "function") {
        return "(function)";
    }
    else if (x && x.map) {
        return `[${x.map(sanitize)}]`;
    }
    else if (typeof x == "string") {
        return `"${x}"`;
    }
    else {
        return x;
    }
}
exports.default = sanitize;
