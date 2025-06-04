/**
 * Copyright (c) 2018, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { delimiter, join } from 'path';
import { debug, log } from '../logger';
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

function findJarsExcludingPatterns(directory: string, excludePatterns: string[]): string[] {
    try {
        if (!fs.existsSync(directory)) {
            return [];
        }
        const files = fs.readdirSync(directory);
        const matchingJars: string[] = [];
        
        const compiledPatterns = excludePatterns.map(pattern => new RegExp(pattern.replace(/\*/g, '.*')));
        
        files.forEach(file => {
            if (file.endsWith('.jar')) {
                const shouldExclude = compiledPatterns.some(regex => regex.test(file));
                
                if (!shouldExclude) {
                    matchingJars.push(path.join(directory, file));
                }
            }
        });
        
        return matchingJars;
    } catch (error) {
        console.error(`Error reading directory ${directory}:`, error);
        return [];
    }
}

export function getServerOptions(ballerinaCmd: string, extension: BallerinaExtension): ServerOptions {
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
    
    // jar patterns to exclude
    const excludeJarPatterns = [
        'architecture-model-*',
        'flow-model-*',
        'graphql-model-*',
        'model-generator-*',
        'sequence-model-*',
        'language-server-*',
    ];

    // Generate paths for ballerina home jars using dynamic discovery (excluding specified patterns)
    const ballerinaLibDir = join(ballerinaHome, 'bre', 'lib');
    const ballerinaJarPaths = findJarsExcludingPatterns(ballerinaLibDir, excludeJarPatterns);
    
    ballerinaJarPaths.forEach(jarPath => {
        if (!fs.existsSync(jarPath)) {
            log(`Ballerina jar not found in ${jarPath}`);
        }
    });

    let ballerinaLanguageServerJar: string | null = null;
    const configuredLangServerPath = extension?.getConfiguredLangServerPath();
    
    if (configuredLangServerPath && configuredLangServerPath.trim() !== "") {
        // User provided custom language server path
        log(`Using configured language server path: ${configuredLangServerPath}`);
        if (fs.existsSync(configuredLangServerPath)) {
            ballerinaLanguageServerJar = configuredLangServerPath;
            log(`Custom language server jar found: ${ballerinaLanguageServerJar}`);
        } else {
            log(`Configured language server jar not found: ${configuredLangServerPath}`);
            throw new Error(`Configured language server JAR not found: ${configuredLangServerPath}`);
        }
    } else {
        // Use bundled language server from ls directory
        log(`Using bundled language server from ls directory`);
        const lsDir = extension?.context.asAbsolutePath("ls");    
        ballerinaLanguageServerJar = findFileByPattern(lsDir, /^ballerina-language-server.*\.jar$/);
        
        if (!ballerinaLanguageServerJar || !fs.existsSync(ballerinaLanguageServerJar)) {
            log(`No ballerina language server jar found in: ${lsDir}`);
            throw new Error(`Language server JAR not found in ${lsDir}`);
        }
        
        log(`Found bundled language server jar: ${ballerinaLanguageServerJar}`);
    }

    // join paths and add to args
    const customPaths = [...ballerinaJarPaths, ballerinaLanguageServerJar];
    if (process.env.LS_CUSTOM_CLASSPATH) {
        log(`LS_CUSTOM_CLASSPATH: ${process.env.LS_CUSTOM_CLASSPATH}`);
        customPaths.push(process.env.LS_CUSTOM_CLASSPATH);
    }
    
    const classpath = customPaths.join(delimiter);
    
    // Find any JDK in the dependencies directory
    const dependenciesDir = join(baseHome, 'dependencies');
    const jdkDir = findFileByPattern(dependenciesDir, /^jdk-.*-jre$/);
    
    if (!jdkDir) {
        log(`No JDK found in dependencies directory: ${dependenciesDir}`);
        throw new Error(`JDK not found in ${dependenciesDir}`);
    }
    
    const javaExecutable = isWindows() ? 'java.exe' : 'java';
    cmd = join(jdkDir, 'bin', javaExecutable);
    args = ['-cp', classpath, `-Dballerina.home=${ballerinaHome}`, 'org.ballerinalang.langserver.launchers.stdio.Main'];
    
    log(`Found JDK: ${jdkDir}`);
    log(`Java executable: ${cmd} exists: ${fs.existsSync(cmd)}`);
    
    // Create the final command line that will be executed
    const serverOptions = {
        command: cmd,
        args,
        options: opt
    };
    
    log(`Final command: ${cmd} ${args.join(" ")}`);
    
    return serverOptions;
}
