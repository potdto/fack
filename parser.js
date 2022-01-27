const { prelude, identifiers, helpSymbol } = require("./prelude");
identifiers.import = s =>
    s == helpSymbol? console.log("{codeblock} <- s <- import\nImports tokens from another file using the file's location passed as a string."):
    runFromFile(s);
const fs = require("fs");
const errors = require("./error");
const sanitize = require("./sanitize");

/**
 * 
 * @param {Function} f 
 * @param {Array} stack 
 */
function append(f, stack) {
    if (typeof f != "function") return stack.push(f);
    if (f.length == 0) return stack.push(f());
    let a = stack.pop();
    while (typeof f == "function" && a != "pipe" && a != undefined) {
        f = f(a);
        if (typeof f != "function") break;
        a = stack.pop();
    }
    if (f != null && f != undefined) stack.push(f);
}
/**
 * 
 * @param {string} file 
 * @param {object} obj 
 * @param {boolean} san
 * @returns Array
 */
function run(file, obj = identifiers, san = true) {

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
                    const lambdaObj = Object.create(obj);
                    lambdaObj[argName] = a;
                    run(fbody, lambdaObj, false).forEach(x => append(x, stack));
                }, stack);
                break;
            case "string":
                let val;
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
                if (obj[value] == undefined) errors.nil(value);
                append(obj[value], stack);
                break;
            case "pipe":
                append("pipe", stack);
                break;
            case "define":
                append(token[0].func(obj), stack);
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
    return san ? sanitize(stack) : stack;
}
const runFromFile = path => {
    try {
        return run(
            fs.readFileSync(path, { encoding: "utf-8" })
            , identifiers, false);
    } catch (e) {
        errors.read(path);
    }
}

module.exports = { run, runFromFile };