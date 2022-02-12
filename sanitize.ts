export default function sanitize(x: any): string | typeof x {
    if (typeof x == "function") {
        return "(function)";
    } else if (x && x.map) {
        return `[${x.map(sanitize)}]`;
    } else if (typeof x == "string") {
        return `"${x}"`;
    } else if (x?.name == "codeBlock") {
        return "(codeBlock)";
    } else {
        return x;
    }
}