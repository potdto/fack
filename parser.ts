import fs = require("fs");
import {identifiers, prelude, helpSymbol} from "./prelude";
import errors from "./error";

identifiers.import = (s: string|Symbol) =>
    s == helpSymbol? console.log("{codeblock} <- s <- import\nImports tokens from another file using the file's location passed as a string."):
    runFromFile(s as string);

function append(f: any, stack: any[]): void {
    if (typeof f != "function") return void stack.push(f);
    if (f.length == 0) return void stack.push(f());
    let a = stack.pop();
    while (typeof f == "function" && a != "|" && a != undefined) {
        f = f(a);
        if (typeof f != "function") break;
        a = stack.pop();
    }
    if (f != null && f != undefined) stack.push(f);
}

export function run(file: string, scope = identifiers) {
    const tokens = [];
    let n = 1000;
    while (file.length > 0 && n-- > 0) {
        for (let key in prelude) {
            let variable = prelude[key];
            variable.name = key;
            if (variable.regex.test(file)) {
                tokens.push([variable, file.match(variable.regex)[0]]);
                file = file.replace(variable.regex, "");
                break;
            }
        }
    }
    if (n <= 0) console.log("ERROR: weird character detected, command failed");
    const stack = [];
    tokens.forEach(token => {
        let value = token[1];
        switch (token[0].name) {
            case "js":
                append(
                    eval(value.slice(1, value.length - 1))
                    , stack)
                break;
            case "lambda":
                value = value.replace(/(^\()|(\)$)/g, "").split("<-"); // crude removing ()
                while (value.length > 2) {
                    value[1] = value[0] + " <- " + value[1];
                    value.shift();
                }
                let argName = value[1].trim();
                let fbody = value[0];
                append(a => {
                    if (argName.split(" ").length > 1) {
                        let type = argName.split(" ")[1];
                        argName = argName.split(" ")[0];
                        if (typeof a != type) {
                            return errors.type(a, type, "(lambda)")
                        }
                    }
                    const lambdaObj = Object.create(scope);
                    lambdaObj[argName] = a;
                    run(fbody, lambdaObj).forEach(x => append(x, stack));
                }, stack);
                break;
            case "string":
                let val: string;
                try {
                    val = eval(value);
                    append(
                        val,
                        stack);
                } catch (e) {
                    errors.string(value);
                }
                break;
            case "number":
                append(Number(value), stack);
                break;
            case "identifier":
                if (scope[value] == undefined) errors.nil(value);
                append(scope[value], stack);
                break;
            case "pipe":
                append("|", stack);
                break;
            case "define":
                append(token[0].func(scope), stack);
                break;
            default:
                if (token[0].func) {
                    append(token[0].func, stack);
                    return;
                } else {
                    append(value, stack);
                }
            case "whitespace":
            case "comment":
                break;
        }
    });
    return stack;
}
export const runFromFile = (path: string) => {
    try {
        return run(
            fs.readFileSync(path, { encoding: "utf-8" })
            , identifiers);
    } catch (e) {
        errors.read(path);
    }
}