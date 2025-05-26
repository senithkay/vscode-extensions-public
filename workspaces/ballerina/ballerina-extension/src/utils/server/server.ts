/**
 * Copyright (c) 2018, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { delimiter, join, sep } from 'path';
import { debug } from '../logger';
import { ServerOptions, ExecutableOptions } from 'vscode-languageclient/node';
import { isWindows } from '..';
import { BallerinaExtension } from '../../core';
import * as fs from 'fs';
import * as path from 'path';

function findFileByPattern(directory: string, pattern: RegExp): string | null {
    try {
        if (!fs.existsSync(directory)) {
            return null;
        }
        const files = fs.readdirSync(directory);
        const matchingFile = files.find(file => pattern.test(file));
        return matchingFile ? path.join(directory, matchingFile) : null;
    } catch (error) {
        console.error(`Error reading directory ${directory}:`, error);
        return null;
    }
}

function findJarsByPatterns(directory: string, patterns: string[]): string[] {
    try {
        if (!fs.existsSync(directory)) {
            return [];
        }
        const files = fs.readdirSync(directory);
        const matchingJars: string[] = [];
        
        patterns.forEach(pattern => {
            const regex = new RegExp(pattern.replace(/\*/g, '.*') + '\\.jar$');
            const matchingFile = files.find(file => regex.test(file));
            if (matchingFile) {
                matchingJars.push(path.join(directory, matchingFile));
            }
        });
        
        return matchingJars;
    } catch (error) {
        console.error(`Error reading directory ${directory}:`, error);
        return [];
    }
}

export function getServerOptions(ballerinaCmd: string, extension?: BallerinaExtension): ServerOptions {
    debug(`Using Ballerina CLI command '${ballerinaCmd}' for Language server.`);
    let cmd = isWindows() ? 'cmd.exe' : ballerinaCmd;
    let args = ["start-language-server"];
    if (isWindows()) {
        args = ['/c', ballerinaCmd, 'start-language-server'];
    }
    let opt: ExecutableOptions = {};
    opt.env = Object.assign({}, process.env);

    if (process.env.LS_EXTENSIONS_PATH !== "") {
        if (opt.env.BALLERINA_CLASSPATH_EXT) {
            opt.env.BALLERINA_CLASSPATH_EXT += delimiter + process.env.LS_EXTENSIONS_PATH;
        } else {
            opt.env.BALLERINA_CLASSPATH_EXT = process.env.LS_EXTENSIONS_PATH;
        }
    }
    if (process.env.LSDEBUG === "true" || extension?.enableLSDebug()) {
        debug('Language Server is starting in debug mode.');
        let debugPort = 5005;
        opt.env.BAL_JAVA_DEBUG = debugPort;
        opt.env.BAL_DEBUG_OPTS = `-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=${debugPort},quiet=y`;
    }

    const ballerinaHome = extension?.getBallerinaHome();
    // Get the base ballerina home by removing the distribution part
    const baseHome = ballerinaHome.includes('distributions') 
        ? ballerinaHome.substring(0, ballerinaHome.indexOf('distributions'))
        : ballerinaHome;
    
    // ballerina jar patterns (using wildcards for version)
    const ballerinaJarPatterns = [
        'ballerina-lang-*',
        'ballerina-tools-api-*',
        'diagram-util-*',
        'syntax-api-calls-gen-*',
        'ballerina-parser-*',
        'central-client-*',
        'formatter-core-*',
        'toml-parser-*'
    ];

    // Generate paths for ballerina home jars using dynamic discovery
    const ballerinaLibDir = join(ballerinaHome, 'bre', 'lib');
    const ballerinaJarPaths = findJarsByPatterns(ballerinaLibDir, ballerinaJarPatterns);
    
    ballerinaJarPaths.forEach(jarPath => {
        if (fs.existsSync(jarPath)) {
            console.log(">>> Found ballerina jar in", jarPath);
        } else {
            console.log(">>> Ballerina jar not found in", jarPath);
        }
    });

    // language server jar - find any ballerina-language-server jar in the ls directory
    const lsDir = join(__dirname, 'ls');
    const ballerinaLanguageServerJar = findFileByPattern(lsDir, /^ballerina-language-server.*\.jar$/);
    
    if (!ballerinaLanguageServerJar || !fs.existsSync(ballerinaLanguageServerJar)) {
        console.error(">>> No ballerina language server jar found in:", lsDir);
        throw new Error(`Language server JAR not found in ${lsDir}`);
    }
    
    console.log(">>> Found language server jar:", ballerinaLanguageServerJar);

    // join paths and add to args
    const customPaths = [...ballerinaJarPaths, ballerinaLanguageServerJar];
    if (process.env.LS_CUSTOM_CLASSPATH) {
        console.log(">>> LS_CUSTOM_CLASSPATH:", process.env.LS_CUSTOM_CLASSPATH);
        customPaths.push(process.env.LS_CUSTOM_CLASSPATH);
    }
    
    const classpath = customPaths.join(delimiter);
    
    // Find any JDK in the dependencies directory
    const dependenciesDir = join(baseHome, 'dependencies');
    const jdkDir = findFileByPattern(dependenciesDir, /^jdk-.*-jre$/);
    
    if (!jdkDir) {
        console.error(">>> No JDK found in dependencies directory:", dependenciesDir);
        throw new Error(`JDK not found in ${dependenciesDir}`);
    }
    
    const javaExecutable = isWindows() ? 'java.exe' : 'java';
    cmd = join(jdkDir, 'bin', javaExecutable);
    args = ['-cp', classpath, 'org.ballerinalang.langserver.launchers.stdio.Main'];
    
    console.log(">>> Found JDK:", jdkDir);
    console.log(">>> Java executable:", cmd, "exists:", fs.existsSync(cmd));
    
    // Create the final command line that will be executed
    const serverOptions = {
        command: cmd,
        args,
        options: opt
    };
    
    console.log(">>> final command:", cmd, args.join(" "));
    
    return serverOptions;
}
