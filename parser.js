"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFromFile = exports.run = void 0;
const fs = require("fs");
const prelude_1 = require("./prelude");
const error_1 = require("./error");
prelude_1.identifiers.import = (s) => s == prelude_1.helpSymbol ? console.log("{codeblock} <- s <- import\nImports tokens from another file using the file's location passed as a string.") :
    (0, exports.runFromFile)(s);
function append(f, stack) {
    if (typeof f != "function")
        return void stack.push(f);
    if (f.length == 0)
        return void stack.push(f());
    let a = stack.pop();
    while (typeof f == "function" && a != "|" && a != undefined) {
        f = f(a);
        if (typeof f != "function")
            break;
        a = stack.pop();
    }
    if (f != null && f != undefined)
        stack.push(f);
}
function tokenize(file) {
    let tokens = [];
    let n = 1e10;
    while (file.length > 0 && n-- > 0) {
        for (const key in prelude_1.prelude) {
            const token = Object.create(prelude_1.prelude[key]);
            token.name = key;
            if (token.regex.test(file)) {
                token.value = file.match(token.regex)[0];
                if (token.name == "closeBracket") {
                    for (let j = tokens.length - 1; j >= 0; j--) {
                        if (tokens[j].name == "openBracket") {
                            const a = { name: "codeBlock", value: tokens.slice(j + 1, tokens.length) };
                            tokens.splice(j);
                            if (a.value.length == 1 && a.value[0].name == "lambda")
                                tokens.push(a.value[0]);
                            else
                                tokens.push(a);
                        }
                    }
                }
                else {
                    tokens.push(token);
                }
                file = file.replace(token.regex, "");
            }
        }
    }
    if (n <= 0)
        console.log("ERROR: weird character detected, command failed");
    return tokens;
}
function run(file, scope = prelude_1.identifiers, stack = []) {
    const tokens = tokenize(file);
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
                const fbody = token.value[0];
                append((a) => {
                    if (argName.split(" ").length > 1) {
                        const type = argName.split(" ")[1];
                        argName = argName.split(" ")[0];
                        if (typeof a != type) {
                            return error_1.default.type(a, type, "(lambda)");
                        }
                    }
                    const lambdaScope = Object.create(scope);
                    lambdaScope[argName] = a;
                    const lambdaStack = run(fbody, lambdaScope, []);
                    if (lambdaStack.length > 1)
                        error_1.default.return();
                    return lambdaStack[0];
                }, stack);
                break;
            case "string":
                let val;
                try {
                    val = eval(token.value);
                    append(val, stack);
                }
                catch (e) {
                    error_1.default.string(token.value);
                }
                break;
            case "number":
                append(Number(token.value), stack);
                break;
            case "identifier":
                if (scope[token.value] == undefined)
                    error_1.default.nil(token.value);
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
                }
                else {
                    append(token.value, stack);
                }
            case "whitespace":
            case "comment":
                break;
        }
    });
    return stack;
}
exports.run = run;
const runFromFile = (path) => {
    try {
        return run(fs.readFileSync(path, { encoding: "utf-8" }), prelude_1.identifiers);
    }
    catch (e) {
        error_1.default.read(path);
    }
};
exports.runFromFile = runFromFile;
