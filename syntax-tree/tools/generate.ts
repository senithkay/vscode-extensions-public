import * as fs from "fs";
import { sync as globSync } from "glob";
import * as path from "path";
import { fix } from "prettier-tslint";
import { findModelInfo, genBaseVisitorFileCode, genCheckKindUtilCode,
    genInterfacesFileCode } from "./generators";
import { genSyntaxTree, shutdown } from "./lang-client";

if (!fs.existsSync(path.join(process.cwd(), "..", "..", "..", "examples"))) {
    // tslint:disable-next-line:no-console
    console.log("please run from syntax-tree directory. you are in", process.cwd());
    process.exit(1);
}

const modelInfo: any = {};

const SYNTAX_TREE_INTERFACES_PATH = "./src/syntax-tree-interfaces.ts";
const BASE_VISITOR_PATH = "./src/base-visitor.ts";
const CHECK_KIND_UTIL_PATH = "./src/check-kind-util.ts";

const balFiles = globSync(path.join(
    process.cwd(), "..", "..", "..", "{examples,tests}", "**", "*.bal"), {});

const triedBalFiles: string[] = [];
const notParsedBalFiles: string[] = [];
const usedBalFiles: string[] = [];
const timedOutBalFiles: string[] = [];

processPart(0, 100);

function printSummary() {
    const { log } = console;
    const found = balFiles.length;
    const notParsed = notParsedBalFiles.length;
    const used = usedBalFiles.length;
    const timedOut = timedOutBalFiles.length;

    log(`${found} Files found`);
    log(`${notParsed} Could not be parsed`);
    log(`${used} Used for util generation`);
    log(`${timedOut} timed out while parsing`);
}

function processPart(start: number, count: number) {
    const syntaxTreePromises: any[] = [];
    const filesPart = balFiles.slice(start, start + count);
    filesPart.forEach((file) => {
        triedBalFiles.push(file);
        const promise = genSyntaxTree(file).then((syntaxTree) => {
            if (!syntaxTree) {
                // could not parse
                notParsedBalFiles.push(file);
                return;
            }
            usedBalFiles.push(file);
            syntaxTree.kind = "SyntaxTree";
            findModelInfo(syntaxTree, modelInfo);
        }).catch((err) => {
            notParsedBalFiles.push(file);
            // tslint:disable-next-line: no-console
            console.log(err);
        });

        const timeout = new Promise((resolve, reject) => {
            setTimeout(() => {
                timedOutBalFiles.push(file);
                resolve();
            }, 20000);
        });
        syntaxTreePromises.push(Promise.race([promise, timeout]));
    });

    Promise.all(syntaxTreePromises).then(() => {
        if (syntaxTreePromises.length < count) {
            genFiles();
            shutdown();
            printSummary();
            return;
        }

        processPart(start + count, count);
    });
}

function genFiles() {
    fs.writeFileSync(SYNTAX_TREE_INTERFACES_PATH, genInterfacesFileCode(modelInfo));
    fix(SYNTAX_TREE_INTERFACES_PATH);
    const modelNames = Object.keys(modelInfo).sort();
    fs.writeFileSync(BASE_VISITOR_PATH, genBaseVisitorFileCode(modelNames));
    fix(BASE_VISITOR_PATH);
    fs.writeFileSync(CHECK_KIND_UTIL_PATH, genCheckKindUtilCode(modelNames));
    fix(CHECK_KIND_UTIL_PATH);
}
