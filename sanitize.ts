export default function sanitize(x: any): any {
    if (typeof x == "function") {
        return "(function)";
    } else if (x && x.map) {
        return `[${x.map(sanitize)}]`;
    } else if (typeof x == "string") {
        return `"${x}"`;
    } else {
        return x;
    }
}