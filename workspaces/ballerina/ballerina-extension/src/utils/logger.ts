/**
 * Copyright (c) 2018, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import {getPluginConfig} from'../utils/config';
import * as fs from 'fs';
import * as path from 'path';
import { isWindows } from './index';
import type { BallerinaExtension } from '../core/extension';
import { findHighestVersionJdk } from './server/server';

export const outputChannel = vscode.window.createOutputChannel("Ballerina");
const logLevelDebug: boolean = getPluginConfig().get('debugLog') === true;

function withNewLine(value: string) {
    if (typeof value === 'string' && !value.endsWith('\n')) {
        return value += '\n';
    }
    return value;
}

// This function will log the value to the Ballerina output channel only if debug log is enabled
export function debug(value: string): void {
    const output = withNewLine(value);
    console.log(output);
    if (logLevelDebug) {
        outputChannel.append(output);
    }
}

// This function will log the value to the Ballerina output channel
export function log(value: string): void {
    const output = withNewLine(value);
    console.log(output);
    outputChannel.append(output);
}

export function getOutputChannel() {
    if (logLevelDebug) {
        return outputChannel;
    }
}

// Log initial extension information including Ballerina version and language server details
export function logExtensionInitInfo(extension: BallerinaExtension): void {
    try {
        // For all users - show only essential information
        debug("=".repeat(60));
        log(`Plugin version: ${extension.getVersion()}`);
        log(`Ballerina version: ${extension.ballerinaVersion}`);
        
        // For debug users - show detailed information
        debug(`Ballerina Home: ${extension.getBallerinaHome()}`);
        debug(`Plugin Dev Mode: ${extension.overrideBallerinaHome()}`);
        debug(`Debug Mode: ${extension.enableLSDebug()}`);
        debug(`Experimental Features: ${extension.enabledExperimentalFeatures()}`);
        
        // Log detailed Java and Language server information for debug users
        logLanguageServerInfo(extension);
        logJavaInfo(extension);
        
        debug("=".repeat(60));
    } catch (error) {
        log(`Error logging extension init info: ${error}`);
    }
}

function logLanguageServerInfo(extension: BallerinaExtension): void {
    try {
        const configuredLangServerPath = extension.getConfiguredLangServerPath();
        
        if (configuredLangServerPath && configuredLangServerPath.trim() !== "") {
            // Custom language server path
            debug(`Language Server: Custom JAR`);
            debug(`Language Server Path: ${configuredLangServerPath}`);
            
            // Extract version from JAR name if possible
            const jarName = path.basename(configuredLangServerPath);
            const versionMatch = jarName.match(/ballerina-language-server-(.+)\.jar$/);
            if (versionMatch) {
                log(`Language Server Version: ${versionMatch[1]}`);
            } else {
                debug(`Language Server JAR: ${jarName}`);
            }
        } else {
            // Bundled language server
            debug(`Language Server: Bundled JAR`);
            
            if (extension.context) {
                const lsDir = extension.context.asAbsolutePath("ls");
                try {
                    const files = fs.readdirSync(lsDir);
                    const langServerJar = files.find(file => file.startsWith('ballerina-language-server') && file.endsWith('.jar'));
                    
                    if (langServerJar) {
                        debug(`Language Server JAR: ${langServerJar}`);
                        debug(`Language Server Path: ${path.join(lsDir, langServerJar)}`);
                        
                        // Extract version from JAR name
                        const versionMatch = langServerJar.match(/ballerina-language-server-(.+)\.jar$/);
                        if (versionMatch) {
                            log(`Language Server Version: ${versionMatch[1]}`);
                        }
                    } else {
                        debug(`Language Server JAR: Not found in ${lsDir}`);
                    }
                } catch (error) {
                    debug(`Error reading language server directory: ${error}`);
                }
            } else {
                debug(`Language Server: Context not available`);
            }
        }
    } catch (error) {
        debug(`Error logging language server info: ${error}`);
    }
}

function logJavaInfo(extension: BallerinaExtension): void {
    try {
        const ballerinaHome = isWindows() ? fs.realpathSync.native(extension?.getBallerinaHome()) : extension?.getBallerinaHome();
        
        // Get the base ballerina home by removing the distribution part
        const baseHome = ballerinaHome.includes('distributions') 
            ? ballerinaHome.substring(0, ballerinaHome.indexOf('distributions'))
            : ballerinaHome;
        
        const dependenciesDir = path.join(baseHome, 'dependencies');
        
        // Check if dependencies directory exists and find JDK
        if (fs.existsSync(dependenciesDir)) {
            try {
                const jdkDir = findHighestVersionJdk(dependenciesDir);
                
                if (jdkDir) {
                    debug(`JDK Path: ${jdkDir}`);
                    
                    // Extract Java version from directory name
                    const versionMatch = jdkDir.match(/^jdk-(.+)-jre$/);
                    if (versionMatch) {
                        log(`Java Version: ${versionMatch[1]}`);
                    }
                    
                    // Try to get detailed Java version by executing java -version
                    const javaExecutable = isWindows() ? 'java.exe' : 'java';
                    const javaPath = path.join(dependenciesDir, jdkDir, 'bin', javaExecutable);
                    
                    if (fs.existsSync(javaPath)) {
                        debug(`Java Executable: ${javaPath}`);
                    } else {
                        debug(`Java Executable: Not found at ${javaPath}`);
                    }
                } else {
                    debug(`Java Runtime: No bundled JDK found in dependencies`);
                }
            } catch (error) {
                debug(`Error reading dependencies directory: ${error}`);
            }
        } else {
            debug(`Java Runtime: Dependencies directory not found, checking system Java`);
        }
    } catch (error) {
        debug(`Error logging Java info: ${error}`);
    }
}
