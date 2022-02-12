"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
const sanitize_1 = require("./sanitize");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const args = process.argv.slice(2);
switch (args[0]) {
    case "-v":
    case "--version":
        console.log("stacklang v1.0.0");
        process.exit();
    case "-i":
    case "--interactive":
        console.log("Interactive command line, use Ctrl+C to quit and Ctrl+L to clear the console.");
        let rec = () => {
            readline.question("> ", (input) => {
                console.log((0, sanitize_1.default)((0, parser_1.run)(input)));
                rec();
            });
        };
        rec();
        break;
    case "-h":
    case "--help":
    default:
        console.log("Usage:\n-h --help\t\tDisplay this help message\n-i --interactive\tEnter interactive mode\n-r --run <FILEPATH>\tRun a file\n");
        process.exit();
    case "-r":
    case "--run":
        try {
            console.log((0, sanitize_1.default)((0, parser_1.runFromFile)(args[1])));
            process.exit();
        }
        catch (e) {
            console.log("Error reading file");
            console.error(e);
            process.exit();
        }
}
