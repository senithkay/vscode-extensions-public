import * as fs from "fs";
import { sync as globSync } from "glob";
import * as path from "path";
import { fix } from "prettier-tslint";

import { findModelInfo, genBaseVisitorFileCode, genCheckKindUtilCode,
    genInterfacesFileCode } from "./generators";
import { genSyntaxTree, restart, shutdown } from "./lang-client";

const sdkPath = process.env.BALLERINA_SDK_PATH;
const repoPath = process.env.BALLERINA_REPO_PATH;
const bbePath = process.env.BBE_PATH;

if (!sdkPath || !repoPath || !bbePath) {
    // tslint:disable-next-line:no-console
    console.log("please define BALLERINA_SDK_PATH, BALLERINA_REPO_PATH and BBE_PATH env vars.");
    process.exit(1);
}

const modelInfo: any = {};

const SYNTAX_TREE_INTERFACES_PATH = "../src/syntax-tree-interfaces.ts";
const BASE_VISITOR_PATH = "../src/base-visitor.ts";
const CHECK_KIND_UTIL_PATH = "../src/check-kind-util.ts";

const bbeBalFiles = globSync(path.join(bbePath, "**", "*.bal"), {});
const testBalFiles = globSync(path.join(repoPath, "tests", "**", "*.bal"), {});
const balFiles = [  ...bbeBalFiles, ...testBalFiles ];

const triedBalFiles: string[] = [];
const notParsedBalFiles: string[] = [];
const usedBalFiles: string[] = [];
const timedOutBalFiles: string[] = [];

processFiles();

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

async function processFiles() {
    for (const file of balFiles)  {
        let timeoutTriggerred = false;
        let gotST = false;
        triedBalFiles.push(file);
        try {
            const timeout = new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (gotST) { return }
                    timedOutBalFiles.push(file);
                     // tslint:disable-next-line: no-console
                    console.log(`Timeout Triggered for ${file}`);
                    timeoutTriggerred = true;
                    resolve(undefined);
                }, 7500);
            });
            const syntaxTree = await Promise.race([genSyntaxTree(file), timeout]);
            if (!syntaxTree) {
                if (timeoutTriggerred) {
                    await restart();
                }
                // could not parse
                notParsedBalFiles.push(file);
                continue;
            } else {
                gotST = true;
            }
            usedBalFiles.push(file);
            findModelInfo(syntaxTree, modelInfo);
        } catch (err) {
            notParsedBalFiles.push(file);
            // tslint:disable-next-line: no-console
            console.log(err);
        }
    }
    genFiles();
    shutdown();
    printSummary();
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
