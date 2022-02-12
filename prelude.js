"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifiers = exports.prelude = exports.helpSymbol = void 0;
const _ = require("lodash");
const error_1 = require("./error");
const sanitize_1 = require("./sanitize");
exports.helpSymbol = Symbol("help");
const uncurry2 = (f) => (x, y) => {
    try {
        return f(x)(y);
    }
    catch (err) {
        console.log("ERROR in `uncurry2`: " + err);
    }
};
exports.prelude = {
    whitespace: {
        regex: /^\s+/,
    },
    openBracket: {
        regex: /^\(/
    },
    closeBracket: {
        regex: /^\)/
    },
    lambda: {
        regex: /^[^()]*<-[^()]*/,
    },
    define: {
        regex: /^define/,
        func: (obj) => (val) => val == exports.helpSymbol ? console.log("IO () <- name <- val <- define\ndefines a variable.") :
            (name) => name == exports.helpSymbol ? console.log("IO () <- name <- define\ndefines a variable.") :
                void (obj[name] = val),
    },
    string: {
        regex: /^"[^"]*"/,
    },
    number: {
        regex: /^-?\d+(\.\d+)?/,
    },
    comment: {
        regex: /^((\/)([*])*(.|\n)+?(\2\1))|(\/\/.*)/,
    },
    add: {
        regex: /^\+/,
        func: (a) => a == exports.helpSymbol ? console.log("{a + b} <- b <- a <- +\nadds 2 numbers together.") :
            typeof a != "number" ? error_1.default.type(a, "number", "add, (+)") :
                (b) => b == exports.helpSymbol ? console.log(`b <- +\nadds ${a} to a number`) :
                    typeof b != "number" ? error_1.default.type(b, "number", "add, (+)") :
                        a + b
    },
    minus: {
        regex: /^-/,
        func: (a) => a == exports.helpSymbol ? console.log("{a - b} <- b <- a <- -\nsubtracts 2 numbers.") :
            typeof a != "number" ? error_1.default.type(a, "number", "minus, (-)") :
                (b) => b == exports.helpSymbol ? console.log(`b <- -\ndoes ${a} - b\nNOTE: if you want this function to do b - ${a}, then use \`${a} |-\\\` instead.`) :
                    typeof b != "number" ? error_1.default.type(b, "number", "minus, (-)") :
                        a - b
    },
    multiply: {
        regex: /^\*/,
        func: (a) => a == exports.helpSymbol ? console.log("{a * b} <- b <- a <- *\nmultiplies 2 numbers together.") :
            typeof a != "number" ? error_1.default.type(a, "number", "multiply, (*)") :
                (b) => b == exports.helpSymbol ? console.log(`b <- *\nmultiplies a number by ${a}.`) :
                    typeof b != "number" ? error_1.default.type(b, "number", "multiply, (*)") :
                        a * b
    },
    divide: {
        regex: /^\//,
        func: (a) => a == exports.helpSymbol ? console.log("{a / b} <- b <- a <- /\ndivides 2 numbers together.") :
            typeof a != "number" ? error_1.default.type(a, "number", "divide, (/)") :
                (b) => b == exports.helpSymbol ? console.log(`b <- -\ndoes ${a} / b\nNOTE: if you want this function to do b / ${a}, then use \`${a} |/\\\` instead.`) :
                    typeof b != "number" ? error_1.default.type(b, "number", "divide, (/)") :
                        a / b
    },
    mod: {
        regex: /^%/,
        func: (a) => a == exports.helpSymbol ? console.log("{a % b} <- b <- a <- %\ndoes the modulo of 2 numbers.") :
            typeof a != "number" ? error_1.default.type(a, "number", "modulo, (%)") :
                (b) => b == exports.helpSymbol ? console.log(`b <- %\ndoes ${a} % b\nNOTE: if you want this function to do b % ${a}, then use \`${a} |%\\\` instead.`) :
                    typeof b != "number" ? error_1.default.type(b, "number", "modulo, (%)") :
                        a % b
    },
    power: {
        regex: /^\^/,
        func: (a) => a == exports.helpSymbol ? console.log("{a ^ b} <- b <- a <- ^\ntakes one number to the power of another.") :
            typeof a != "number" ? error_1.default.type(a, "number", "power, (^)") :
                (b) => b == exports.helpSymbol ? console.log(`b <- ^\ndoes ${a} ^ b\nNOTE: if you want this function to do b ^ ${a}, then use \`${a} |^\\\` instead.`) :
                    typeof b != "number" ? error_1.default.type(b, "number", "power, (^)") :
                        Math.pow(a, b)
    },
    reverse: {
        regex: /^;/,
        func: (a) => a == exports.helpSymbol ? console.log("f(x) <- f <- x <- ;\ntakes a function and an argument and runs the function on that argument. Used for making functions go between their arguments\nEXAMPLES\n70 - 1;\t// returns 69") :
            (f) => f == exports.helpSymbol ? console.log("f(x) <- f <- x <- ;\ntakes a function and an argument and runs the function on that argument. Used for making functions go between their arguments\nEXAMPLES\n70 - 1;\t// returns 69") :
                typeof f != "function" ? error_1.default.type(f, "function", "reverse, (;)") :
                    f(a)
    },
    flip: {
        regex: /^\\/,
        func: (f) => f == exports.helpSymbol ? console.log("(c <- a <- b) <- (c <- b <- a) <- \\\nTakes a function that takes 2 arguments and returns a function that takes the arguments in reverse order.") :
            typeof f != "function" ? error_1.default.type(f, "function", "flip (\\)") :
                (b) => (a) => f(a)(b)
    },
    pipe: {
        regex: /^\|/
    },
    comma: {
        regex: /^\,/,
        func: (a) => (b) => a.map ? [...a, b] : [a, b]
    },
    range: {
        regex: /^\.\./,
        func: (startAt) => startAt == exports.helpSymbol ?
            console.log("[n] <- n <- n <- ..\ntakes 2 values and outputs an array ranging from those values.\nEXAMPLES\n1 .. 5;\t// returns [1, 2, 3, 4, 5]") :
            typeof startAt != "number" ? error_1.default.type(startAt, "number", "range, (..)") :
                (endAt) => endAt == exports.helpSymbol ?
                    console.log("[n] <- n <- ..\ntakes 2 values and outputs an array ranging from those values.\nEXAMPLES\n1 .. 5;\t// returns [1, 2, 3, 4, 5]") :
                    typeof endAt != "number" ? error_1.default.type(endAt, "number", "range, (..)") :
                        startAt == endAt ? [startAt] : [startAt, ...(exports.prelude.range.func(startAt + 1) || _)(endAt)]
    },
    compose: {
        regex: /^\./,
        func: (f) => f == exports.helpSymbol ? console.log("(f(g(x)) <- x <- g <- f <- .\ntakes 2 functions and combines them into one function.\nEXAMPLES\n/* if we have a function that multplies by 2 */\t| 2*\n/* and another function that subtracts 1 */\t| 1 |-\\\n/* we can compose them into one function that multiplies by 2 then subtracts 1 */ .\n 35;\t// returns 69") :
            typeof f != "function" ? error_1.default.type(f, "function", "compose, (.)") :
                (g) => g == exports.helpSymbol ? console.log("f(g(x)) <- g <- .\ntakes 2 functions and combines them into one function.\nEXAMPLES\n/* if we have a function that multplies by 2 */\t| 2*\n/* and another function that subtracts 1 */\t| 1 |-\\\n/* we can compose them into one function that multiplies by 2 then subtracts 1 */ .\n 35;\t// returns 69") :
                    typeof g != "function" ? error_1.default.type(g, "function", "compose, (.)") :
                        (x) => f(g(x))
    },
    eq: {
        regex: /^=/,
        func: (a) => a == exports.helpSymbol ? console.log("{bool} <- b <- a <- =\nTests to see if 2 values are equal.") :
            (b) => b == exports.helpSymbol ? console.log(`{bool} <- b <- =\nTests to see if an input is equal to ${(0, sanitize_1.default)(a)}.`) :
                JSON.stringify(a) == JSON.stringify(b)
    },
    lt: {
        regex: /^</,
        func: (a) => a == exports.helpSymbol ? console.log("{a < b} <- b <- a <- <\nchecks if one number is less than another.") :
            typeof a != "number" ? error_1.default.type(a, "number", "less than, (<)") :
                (b) => b == exports.helpSymbol ? console.log(`{a < b} <- b <- <\nchecks if ${(0, sanitize_1.default)(a)} is less than an input.`) :
                    typeof b != "number" ? error_1.default.type(b, "number", "less than, (<)") :
                        a < b
    },
    gt: {
        regex: /^>/,
        func: (a) => a == exports.helpSymbol ? console.log("{a > b} <- b <- a <- >\nchecks if one number is greater than another.") :
            typeof a != "number" ? error_1.default.type(a, "number", "greater than, (>)") :
                (b) => b == exports.helpSymbol ? console.log(`{a > b} <- b <- >\nchecks if ${(0, sanitize_1.default)(a)} is greater than an input.`) :
                    typeof b != "number" ? error_1.default.type(b, "number", "greater than, (>)") :
                        a > b
    },
    identifier: {
        regex: /^[\w'?]+/
    },
};
exports.identifiers = {
    true: true,
    false: false,
    help: (f) => f == exports.helpSymbol ? console.log("For help on a function type `<function> help`") :
        typeof f != "function" ? error_1.default.type(f, "function", "help") : f(exports.helpSymbol),
    diff: (f) => f == exports.helpSymbol ? console.log("f' <- f <- diff\nReturns the derivative of a function.") :
        (x) => {
            const h = 1e-10;
            f = f;
            return (f(x + h) - f(x)) / h;
        },
    print: (x) => x == exports.helpSymbol ? console.log("Prints a value to the console.") :
        console.log(x),
    test: (f) => {
        for (let i = 0; i < 100; i++) {
            let tf = f;
            while (typeof tf == "function") {
                const rand = Math.random() * Math.random() * 1000;
                tf = tf(rand);
            }
            if (!tf)
                return false;
        }
        return true;
    },
    map: (f) => f == exports.helpSymbol ? console.log("[f(x)] <- [x] <- f <- map\ntakes an array and a function as arguments and then performs the function on each of the arguments\nEXAMPLES\n1 .. 5; | 2* map\t// Returns [2, 4, 6, 8, 10]") :
        typeof f != "function" ? error_1.default.type(f, "function", "map") :
            (arr) => arr == exports.helpSymbol ? console.log("[f(x)] <- [x] <- map\ntakes an array as an argument and then performs the function on each of the arguments. This function has already been passed a function f as an argument.") :
                !arr.map ? error_1.default.type(arr, "array", "map") :
                    arr.map(f),
    scanl: (a) => a == exports.helpSymbol ? console.log("n <- [x] <- (n <- x <- acc <- f) <- a <- scanl\nReduces an array to a single element with a specific function that takes the previous value and the current.\nEXAMPLES\n1 .. 36; |+ 0 reduce // returns the sum of 1 to 36, which is 666.") :
        (f) => f == exports.helpSymbol ? console.log("x <- [x] <- (a <- x' <- x <- f) <- scanl\nReduces an array to a single element with a specific function that takes the previous value and the current.\nEXAMPLES\n1 .. 36; |+ 0 reduce // returns the sum of 1 to 36, which is 666.") :
            typeof f != "function" ? error_1.default.type(f, "function", "scanl") :
                (arr) => a == exports.helpSymbol ? console.log("x <- [x] <- scanl\nReduces an array to a single element with a specific function that takes the previous value and the current.\nEXAMPLES\n1 .. 36; |+ 0 reduce // returns the sum of 1 to 36, which is 666.") :
                    !arr.map ? error_1.default.type(arr, "array", "scanl") :
                        arr.reduce(uncurry2(f), a),
    replaceIf: (y) => y == exports.helpSymbol ? console.log("x|y <- x <- f <- y <- replaceIf\ntakes in a function f and a replacement value y. It applies the function on a value and if it returns true then it replaces it with y.\nEXAMPLES\n|| 3 | %\\ | 0 = . \"multiple of 3\" replaceIf\t// a function that can tell if something is a multiple of 3. if it isn't a multiple of 3, the function doesn't change the value. ") :
        (f) => f == exports.helpSymbol ? console.log("x|y <- x <- f <- replaceIf\ntakes in a function f. It applies the function on a value and if it returns true then it replaces it with y. This function has already been passed a value y.") :
            typeof f != "function" ? error_1.default.type(f, "function", "replaceIf") :
                (x) => f(x) ? y : x,
    replaceIfElse: (a) => a == exports.helpSymbol ? console.log("x|y <- b <- x <- y <- replaceIfElse\nreplaces a boolean with another value\nEXAMPLES\ntrue 420 69 replaceIfElse\t// returns 420\nfalse 420 69 replaceIfElse\t// returns 69") :
        (b) => b == exports.helpSymbol ? console.log("x|y <- b <- x <- replaceIfElse\nreplaces a boolean with another value\nEXAMPLES\ntrue 420 69 replaceIfElse\t// returns 420\nfalse 420 69 replaceIfElse\t// returns 69") :
            (c) => c == exports.helpSymbol ? console.log("x|y <- b <- replaceIfElse\nreplaces a boolean with another value\nEXAMPLES\ntrue 420 69 replaceIfElse\t// returns 420\nfalse 420 69 replaceIfElse\t// returns 69") :
                c ? b : a,
    head: (arr) => arr == exports.helpSymbol ? console.log("x <- [x] <- head\nGets the first element of an array.") :
        !arr.map ? error_1.default.type(arr, "array", "head") :
            arr[0],
    tail: (arr) => arr == exports.helpSymbol ? console.log("[x] <- [x] <- tail\nReturns an array without the first element.") :
        !arr.map ? error_1.default.type(arr, "array", "head") :
            arr.slice(1),
    and: (a) => a == exports.helpSymbol ? console.log("{bool} <- b <- b <- and\nIf both values are true, returns true, else returns false.") :
        typeof a != "boolean" ? error_1.default.type(a, "boolean", "and") :
            (b) => b == exports.helpSymbol ? console.log(`${a ? "b" : "false"} <- b <- and`) :
                typeof b != "boolean" ? error_1.default.type(b, "boolean", "and") :
                    a && b,
    or: (a) => a == exports.helpSymbol ? console.log("{bool} <- x <- y <- or\nReturns true if x or y is true, else returns false.") :
        typeof a != "boolean" ? error_1.default.type(a, "boolean", "or") :
            (b) => b == exports.helpSymbol ?
                a ? console.log("true <- b <- or\n Returns true")
                    : console.log("b <- b <- or\n Returns b")
                :
                    typeof b != "boolean" ? error_1.default.type(b, "boolean", "or") :
                        a || b,
    xor: (a) => a == exports.helpSymbol ? console.log("{bool} <- b <- b <- xor\nReturns true if exactly one argument is true.") :
        typeof a != "boolean" ? error_1.default.type(a, "boolean", "xor") :
            (b) => b == exports.helpSymbol ?
                a ? console.log("not b <- b <- xor")
                    : console.log("b <- b <- xor")
                :
                    typeof b != "boolean" ? error_1.default.type(b, "boolean", "xor") :
                        a != b,
    not: (a) => a == exports.helpSymbol ? console.log("{bool} <- b <- not\nIf the value is true, then return false, if false then return true.") :
        typeof a != "boolean" ? error_1.default.type(a, "boolean", "not") :
            !a,
};
for (let k of Object.getOwnPropertyNames(Math)) {
    exports.identifiers[k] =
        typeof Math[k] == "function" ?
            Math[k].length == 1 ?
                (x) => x == exports.helpSymbol ? console.log("Help is not available for advanced math functions, sorry.") :
                    typeof x != "number" ? error_1.default.type(x, "number", k) : Math[k](x)
                : Math[k].length == 2 ?
                    (x) => x == exports.helpSymbol ? console.log("Help is not available for advanced math functions, sorry.") :
                        typeof x != "number" ? error_1.default.type(x, "number", k) :
                            (y) => y == exports.helpSymbol ? console.log("Help is not available for advanced math functions, sorry.") :
                                typeof y != "number" ? error_1.default.type(y, "number", k) :
                                    Math[k](x, y) :
                    Math[k]
            : Math[k];
}
