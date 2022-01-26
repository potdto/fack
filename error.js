const sanitize = require("./sanitize");

const errors = {
    type: (value, type, f) => {
        value = sanitize(value);
        console.log(`ERROR: value \`${value}\` is not of type ${type} in ${f}`);
    },
    read: (file) =>
        console.log(`ERROR: unable to read file ${file}`),
    string: str => console.log(`ERROR: string ${str} is not a valid string`),
    nil: val => console.log(`ERROR: identifier ${val} not defined`),
}

module.exports = errors;