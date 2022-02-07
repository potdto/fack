import sanitize from "./sanitize";

export default {
    type: (value: any, type: string, f: string) => {
        value = sanitize(value);
        console.log(`ERROR: value \`${value}\` is not of type ${type} in ${f}`);
    },
    read: (file: string) =>
        console.log(`ERROR: unable to read file ${file}`),
    string: (str: string) => console.log(`ERROR: string ${str} is not a valid string`),
    nil: (val: any) => console.log(`ERROR: identifier ${val} not defined`),
}