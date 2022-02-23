"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitize_1 = require("./sanitize");
exports.default = {
    type: (value, type, f) => {
        value = (0, sanitize_1.default)(value);
        console.log(`ERROR: value \`${value}\` is not of type ${type} in ${f}`);
    },
    read: (file) => console.log(`ERROR: unable to read file ${file}`),
    string: (str) => console.log(`ERROR: string ${str} is not a valid string`),
    nil: (val) => console.log(`ERROR: identifier ${val} not defined`),
    return: () => console.log("WARNING: the remainder of a lambda stack had more than one element in it. Only the first element will be used."),
};
