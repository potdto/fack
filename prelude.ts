import _ = require("lodash");
import errors from "./error";
import sanitize from "./sanitize";
export const helpSymbol = Symbol("help");
const uncurry2 = (f: Function) => (x: any, y: any) => {
    try {
        return f(x)(y);
    } catch (err) {
        console.log("ERROR in `uncurry2`: " + err);
    }
}
export interface token {
    readonly regex?: RegExp;
    readonly func?: Function;
    name?: string;
    value?: any;
}
interface prelude {
    [key: string]: token;
}

export const prelude: prelude = {
    whitespace: {
        regex: /^\s+/,
    },
    js: {
        regex: /^{[^}]*}/,
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
        func: (obj: object) => (val: any) => val == helpSymbol ? console.log("IO () <- name <- val <- define\ndefines a variable.") :
            (name: string | symbol) => name == helpSymbol ? console.log("IO () <- name <- define\ndefines a variable.") :
                void (obj[name as string] = val),
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
        func: (a: number | symbol) => a == helpSymbol ? console.log("{a + b} <- b <- a <- +\nadds 2 numbers together.") :
            typeof a != "number" ? errors.type(a, "number", "add, (+)") :
                (b: number | symbol) => b == helpSymbol ? console.log(`b <- +\nadds ${a} to a number`) :
                    typeof b != "number" ? errors.type(b, "number", "add, (+)") :
                        a + b
    },
    minus: {
        regex: /^-/,
        func: (a: number | symbol) => a == helpSymbol ? console.log("{a - b} <- b <- a <- -\nsubtracts 2 numbers.") :
            typeof a != "number" ? errors.type(a, "number", "minus, (-)") :
                (b: number | symbol) => b == helpSymbol ? console.log(`b <- -\ndoes ${a} - b\nNOTE: if you want this function to do b - ${a}, then use \`${a} |-\\\` instead.`) :
                    typeof b != "number" ? errors.type(b, "number", "minus, (-)") :
                        a - b
    },
    multiply: {
        regex: /^\*/,
        func: (a: number | symbol) => a == helpSymbol ? console.log("{a * b} <- b <- a <- *\nmultiplies 2 numbers together.") :
            typeof a != "number" ? errors.type(a, "number", "multiply, (*)") :
                (b: number | symbol) => b == helpSymbol ? console.log(`b <- *\nmultiplies a number by ${a}.`) :
                    typeof b != "number" ? errors.type(b, "number", "multiply, (*)") :
                        a * b
    },
    divide: {
        regex: /^\//,
        func: (a: number | symbol) => a == helpSymbol ? console.log("{a / b} <- b <- a <- /\ndivides 2 numbers together.") :
            typeof a != "number" ? errors.type(a, "number", "divide, (/)") :
                (b: number | symbol) => b == helpSymbol ? console.log(`b <- -\ndoes ${a} / b\nNOTE: if you want this function to do b / ${a}, then use \`${a} |/\\\` instead.`) :
                    typeof b != "number" ? errors.type(b, "number", "divide, (/)") :
                        a / b
    },
    mod: {
        regex: /^%/,
        func: (a: number | symbol) => a == helpSymbol ? console.log("{a % b} <- b <- a <- %\ndoes the modulo of 2 numbers.") :
            typeof a != "number" ? errors.type(a, "number", "modulo, (%)") :
                (b: number | symbol) => b == helpSymbol ? console.log(`b <- %\ndoes ${a} % b\nNOTE: if you want this function to do b % ${a}, then use \`${a} |%\\\` instead.`) :
                    typeof b != "number" ? errors.type(b, "number", "modulo, (%)") :
                        a % b
    },
    power: {
        regex: /^\^/,
        func: (a: number | symbol) => a == helpSymbol ? console.log("{a ^ b} <- b <- a <- ^\ntakes one number to the power of another.") :
            typeof a != "number" ? errors.type(a, "number", "power, (^)") :
                (b: number | symbol) => b == helpSymbol ? console.log(`b <- ^\ndoes ${a} ^ b\nNOTE: if you want this function to do b ^ ${a}, then use \`${a} |^\\\` instead.`) :
                    typeof b != "number" ? errors.type(b, "number", "power, (^)") :
                        Math.pow(a, b)
    },
    reverse: {
        regex: /^;/,
        func: (a: any) => a == helpSymbol ? console.log("f(x) <- f <- x <- ;\ntakes a function and an argument and runs the function on that argument. Used for making functions go between their arguments\nEXAMPLES\n70 - 1;\t// returns 69") :
            (f: Function | symbol) => f == helpSymbol ? console.log("f(x) <- f <- x <- ;\ntakes a function and an argument and runs the function on that argument. Used for making functions go between their arguments\nEXAMPLES\n70 - 1;\t// returns 69") :
                typeof f != "function" ? errors.type(f, "function", "reverse, (;)") :
                    f(a)
    },
    flip: {
        regex: /^\\/,
        func: (f: Function | symbol) => f == helpSymbol ? console.log("(c <- a <- b) <- (c <- b <- a) <- \\\nTakes a function that takes 2 arguments and returns a function that takes the arguments in reverse order.") :
            typeof f != "function" ? errors.type(f, "function", "flip (\\)") :
                (b: any) => (a: any) => f(a)(b)
    },
    pipe: {
        regex: /^\|/
    },
    comma: {
        regex: /^\,/,
        func: (a: any[]) => (b: any) => a.map ? [...a, b] : [a, b]
    },
    range: {
        regex: /^\.\./,
        func: (startAt: number | symbol) => startAt == helpSymbol ?
            console.log("[n] <- n <- n <- ..\ntakes 2 values and outputs an array ranging from those values.\nEXAMPLES\n1 .. 5;\t// returns [1, 2, 3, 4, 5]") :
            typeof startAt != "number" ? errors.type(startAt, "number", "range, (..)") :
                (endAt: number | symbol) => endAt == helpSymbol ?
                    console.log("[n] <- n <- ..\ntakes 2 values and outputs an array ranging from those values.\nEXAMPLES\n1 .. 5;\t// returns [1, 2, 3, 4, 5]") :
                    typeof endAt != "number" ? errors.type(endAt, "number", "range, (..)") :
                        startAt == endAt ? [startAt] : [startAt, ...(prelude.range.func(startAt + 1) || _)(endAt)]
    },
    compose: {
        regex: /^\./,
        func: (f: Function | symbol) => f == helpSymbol ? console.log("(f(g(x)) <- x <- g <- f <- .\ntakes 2 functions and combines them into one function.\nEXAMPLES\n/* if we have a function that multplies by 2 */\t| 2*\n/* and another function that subtracts 1 */\t| 1 |-\\\n/* we can compose them into one function that multiplies by 2 then subtracts 1 */ .\n 35;\t// returns 69") :
            typeof f != "function" ? errors.type(f, "function", "compose, (.)") :
                (g: Function | symbol) => g == helpSymbol ? console.log("f(g(x)) <- g <- .\ntakes 2 functions and combines them into one function.\nEXAMPLES\n/* if we have a function that multplies by 2 */\t| 2*\n/* and another function that subtracts 1 */\t| 1 |-\\\n/* we can compose them into one function that multiplies by 2 then subtracts 1 */ .\n 35;\t// returns 69") :
                    typeof g != "function" ? errors.type(g, "function", "compose, (.)") :
                        (x: any) => f(g(x))
    },
    eq: {
        regex: /^=/,
        func: (a: boolean | symbol) => a == helpSymbol ? console.log("{bool} <- b <- a <- =\nTests to see if 2 values are equal.") :
            (b: boolean | symbol) => b == helpSymbol ? console.log(`{bool} <- b <- =\nTests to see if an input is equal to ${sanitize(a)}.`) :
                JSON.stringify(a) == JSON.stringify(b)
    },
    lt: {
        regex: /^</,
        func: (a: number | symbol) => a == helpSymbol ? console.log("{a < b} <- b <- a <- <\nchecks if one number is less than another.") :
            typeof a != "number" ? errors.type(a, "number", "less than, (<)") :
                (b: number | symbol) => b == helpSymbol ? console.log(`{a < b} <- b <- <\nchecks if ${sanitize(a)} is less than an input.`) :
                    typeof b != "number" ? errors.type(b, "number", "less than, (<)") :
                        a < b
    },
    gt: {
        regex: /^>/,
        func: (a: number | symbol) => a == helpSymbol ? console.log("{a > b} <- b <- a <- >\nchecks if one number is greater than another.") :
            typeof a != "number" ? errors.type(a, "number", "greater than, (>)") :
                (b: number | symbol) => b == helpSymbol ? console.log(`{a > b} <- b <- >\nchecks if ${sanitize(a)} is greater than an input.`) :
                    typeof b != "number" ? errors.type(b, "number", "greater than, (>)") :
                        a > b
    },
    identifier: {
        regex: /^[\w'?]+/
    },
}
export const identifiers: any = {
    true: true,
    false: false,
    help: (f: Function | symbol) => f == helpSymbol ? console.log("For help on a function type `<function> help`") :
        typeof f != "function" ? errors.type(f, "function", "help") : f(helpSymbol),
    diff: (f: Function | symbol) => f == helpSymbol ? console.log("f' <- f <- diff\nReturns the derivative of a function.") :
        (x: number) => {
            const h = 1e-10;
            f = f as Function;
            return (f(x + h) - f(x)) / h;
        },
    print: (x: any) => x == helpSymbol ? console.log("Prints a value to the console.") :
        console.log(x),
    test: (f: any) => {
        for (let i = 0; i < 100; i++) {
            let tf = f;
            while (typeof tf == "function") {
                const rand = Math.random() * Math.random() * 1000;
                tf = tf(rand);
            }
            if (!tf) return false;
        }
        return true;
    },
    map: (f: Function | symbol) => f == helpSymbol ? console.log("[f(x)] <- [x] <- f <- map\ntakes an array and a function as arguments and then performs the function on each of the arguments\nEXAMPLES\n1 .. 5; | 2* map\t// Returns [2, 4, 6, 8, 10]") :
        typeof f != "function" ? errors.type(f, "function", "map") :
            (arr: any[] | symbol) => arr == helpSymbol ? console.log("[f(x)] <- [x] <- map\ntakes an array as an argument and then performs the function on each of the arguments. This function has already been passed a function f as an argument.") :
                !(arr as any[]).map ? errors.type(arr, "array", "map") :
                    (arr as any[]).map(f as any),
    scanl: (a: any) => a == helpSymbol ? console.log("n <- [x] <- (n <- x <- acc <- f) <- a <- scanl\nReduces an array to a single element with a specific function that takes the previous value and the current.\nEXAMPLES\n1 .. 36; |+ 0 reduce // returns the sum of 1 to 36, which is 666.") :
        (f: Function | symbol) => f == helpSymbol ? console.log("x <- [x] <- (a <- x' <- x <- f) <- scanl\nReduces an array to a single element with a specific function that takes the previous value and the current.\nEXAMPLES\n1 .. 36; |+ 0 reduce // returns the sum of 1 to 36, which is 666.") :
            typeof f != "function" ? errors.type(f, "function", "scanl") :
                (arr: any[]) => a == helpSymbol ? console.log("x <- [x] <- scanl\nReduces an array to a single element with a specific function that takes the previous value and the current.\nEXAMPLES\n1 .. 36; |+ 0 reduce // returns the sum of 1 to 36, which is 666.") :
                    !(arr as any[]).map ? errors.type(arr, "array", "scanl") :
                        (arr as any[]).reduce(uncurry2(f), a),
    replaceIf: (y: boolean | symbol) =>
        y == helpSymbol ? console.log("x|y <- x <- f <- y <- replaceIf\ntakes in a function f and a replacement value y. It applies the function on a value and if it returns true then it replaces it with y.\nEXAMPLES\n|| 3 | %\\ | 0 = . \"multiple of 3\" replaceIf\t// a function that can tell if something is a multiple of 3. if it isn't a multiple of 3, the function doesn't change the value. ") :
            (f: Function | symbol) =>
                f == helpSymbol ? console.log("x|y <- x <- f <- replaceIf\ntakes in a function f. It applies the function on a value and if it returns true then it replaces it with y. This function has already been passed a value y.") :
                    typeof f != "function" ? errors.type(f, "function", "replaceIf") :
                        (x: any) =>
                            f(x) ? y : x,
    replaceIfElse: (a: boolean | symbol) =>
        a == helpSymbol ? console.log("x|y <- b <- x <- y <- replaceIfElse\nreplaces a boolean with another value\nEXAMPLES\ntrue 420 69 replaceIfElse\t// returns 420\nfalse 420 69 replaceIfElse\t// returns 69") :
            (b: boolean | symbol) => b == helpSymbol ? console.log("x|y <- b <- x <- replaceIfElse\nreplaces a boolean with another value\nEXAMPLES\ntrue 420 69 replaceIfElse\t// returns 420\nfalse 420 69 replaceIfElse\t// returns 69") :
                (c: boolean | symbol) => c == helpSymbol ? console.log("x|y <- b <- replaceIfElse\nreplaces a boolean with another value\nEXAMPLES\ntrue 420 69 replaceIfElse\t// returns 420\nfalse 420 69 replaceIfElse\t// returns 69") :
                    c ? b : a,
    head: (arr: any[] | symbol) => arr == helpSymbol ? console.log("x <- [x] <- head\nGets the first element of an array.") :
        !(arr as any[]).map ? errors.type(arr, "array", "head") :
            arr[0],
    tail: (arr: any[] | symbol) => arr == helpSymbol ? console.log("[x] <- [x] <- tail\nReturns an array without the first element.") :
        !(arr as any[]).map ? errors.type(arr, "array", "head") :
            (arr as any[]).slice(1),
    and: (a: boolean | symbol) => a == helpSymbol ? console.log("{bool} <- b <- b <- and\nIf both values are true, returns true, else returns false.") :
        typeof a != "boolean" ? errors.type(a, "boolean", "and") :
            (b: boolean | symbol) => b == helpSymbol ? console.log(`${a ? "b" : "false"} <- b <- and`) :
                typeof b != "boolean" ? errors.type(b, "boolean", "and") :
                    a && b,
    or: (a: boolean | symbol) => a == helpSymbol ? console.log("{bool} <- x <- y <- or\nReturns true if x or y is true, else returns false.") :
        typeof a != "boolean" ? errors.type(a, "boolean", "or") :
            (b: boolean | symbol) => b == helpSymbol ?
                a ? console.log("true <- b <- or\n Returns true")
                    : console.log("b <- b <- or\n Returns b")
                :
                typeof b != "boolean" ? errors.type(b, "boolean", "or") :
                    a || b,
    xor: (a: boolean | symbol) => a == helpSymbol ? console.log("{bool} <- b <- b <- xor\nReturns true if exactly one argument is true.") :
        typeof a != "boolean" ? errors.type(a, "boolean", "xor") :
            (b: boolean | symbol) => b == helpSymbol ?
                a ? console.log("not b <- b <- xor")
                    : console.log("b <- b <- xor")
                :
                typeof b != "boolean" ? errors.type(b, "boolean", "xor") :
                    a != b,
    not: (a: boolean | symbol) => a == helpSymbol ? console.log("{bool} <- b <- not\nIf the value is true, then return false, if false then return true.") :
        typeof a != "boolean" ? errors.type(a, "boolean", "not") :
            !a,
}
for (let k of Object.getOwnPropertyNames(Math)) {
    identifiers[k] =
        typeof Math[k] == "function" ?
            Math[k].length == 1 ?
                (x: number | symbol) => x == helpSymbol ? console.log("Help is not available for advanced math functions, sorry.") :
                    typeof x != "number" ? errors.type(x, "number", k) : Math[k](x)
                : Math[k].length == 2 ?
                    (x: number | symbol) => x == helpSymbol ? console.log("Help is not available for advanced math functions, sorry.") :
                        typeof x != "number" ? errors.type(x, "number", k) :
                            (y: number | symbol) => y == helpSymbol ? console.log("Help is not available for advanced math functions, sorry.") :
                                typeof y != "number" ? errors.type(y, "number", k) :
                                    Math[k](x, y) :
                    Math[k]
            : Math[k]
}