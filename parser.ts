import fs = require("fs");
import _ = require("lodash");
import { identifiers, prelude, helpSymbol, token } from "./prelude";
import errors from "./error";

identifiers.import = (s: string | Symbol) =>
    s == helpSymbol ? console.log("{codeblock} <- s <- import\nImports tokens from another file using the file's location passed as a string.") :
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

function tokenize(file: string) {
    let tokens: token[] = [];
    let n = 1e300;
    while (file.length > 0 && n-- > 0) {
        for (const key in prelude) {
            const token: token = Object.create(prelude[key]);
            token.name = key;
            if (token.regex.test(file)) {
                token.value = file.match(token.regex)[0];

                if (token.name == "closeBracket") {
                    for (let j = tokens.length - 1; j >= 0; j--) {
                        if (tokens[j].name == "openBracket") {
                            const a = { name: "codeBlock", value: tokens.slice(j + 1, tokens.length) };
                            tokens.splice(j);
                            if (a.value.length == 1 && a.value[0].name == "lambda")
                                tokens.push(...a.value);
                            else
                                tokens.push(a);
                        }
                    }
                } else {
                    tokens.push(token);
                }
                file = file.replace(token.regex, "");
            }
        }
    }
    if (n <= 0) console.log("ERROR: weird character detected, command failed");
    return tokens;
}

export function run(file: string, scope = identifiers) {
    const tokens = tokenize(file);
    const stack = [];
    tokens.forEach(token => {
        switch (token.name) {
            case "codeBlock":
                append(token, stack);
                break;
            case "lambda":
                token.value = token.value.split("<-");
                while (token.value.length > 2) {
                    token.value[1] = token.value[0] + " <- " + token.value[1];
                    token.value.shift();
                }
                let argName = token.value[1].trim();
                let fbody = token.value[0];
                append((a: any) => {
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
                    val = eval(token.value);
                    append(
                        val,
                        stack);
                } catch (e) {
                    errors.string(token.value);
                }
                break;
            case "number":
                append(Number(token.value), stack);
                break;
            case "identifier":
                if (scope[token.value] == undefined) errors.nil(token.value);
                append(scope[token.value], stack);
                break;
            case "pipe":
                append("|", stack);
                break;
            case "define":
                append(token.func(scope), stack);
                break;
            default:
                if (token.func) {
                    append(token.func, stack);
                    return;
                } else {
                    append(token.value, stack);
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