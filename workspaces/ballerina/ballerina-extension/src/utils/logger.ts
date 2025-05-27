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
import { exec } from 'child_process';
import { isWindows } from './index';
import type { BallerinaExtension } from '../core/extension';

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
        log("=".repeat(60));
        log("Ballerina Extension Initialization Complete");
        log("=".repeat(60));
        
        // Log Ballerina version
        log(`Ballerina Version: ${extension.ballerinaVersion}`);
        log(`Ballerina Home: ${extension.getBallerinaHome()}`);
        log(`Ballerina Command: ${extension.getBallerinaCmd()}`);
        
        // Log Java version information
        logJavaInfo(extension);
        
        // Log language server information
        logLanguageServerInfo(extension);
        
        // Log extension version
        log(`Extension Version: ${extension.getVersion()}`);
        log(`Extension ID: ${extension.getID()}`);
        
        // Log configuration settings
        log(`Plugin Dev Mode: ${extension.overrideBallerinaHome()}`);
        log(`Debug Mode: ${extension.enableLSDebug()}`);
        log(`Experimental Features: ${extension.enabledExperimentalFeatures()}`);
        
        log("=".repeat(60));
    } catch (error) {
        log(`Error logging extension init info: ${error}`);
    }
}

export function logLanguageServerInfo(extension: BallerinaExtension): void {
    try {
        const configuredLangServerPath = extension.getConfiguredLangServerPath();
        
        if (configuredLangServerPath && configuredLangServerPath.trim() !== "") {
            // Custom language server path
            log(`Language Server: Custom JAR`);
            log(`Language Server Path: ${configuredLangServerPath}`);
            
            // Extract version from JAR name if possible
            const jarName = path.basename(configuredLangServerPath);
            const versionMatch = jarName.match(/ballerina-language-server-(.+)\.jar$/);
            if (versionMatch) {
                log(`Language Server Version: ${versionMatch[1]}`);
            } else {
                log(`Language Server JAR: ${jarName}`);
            }
        } else {
            // Bundled language server
            log(`Language Server: Bundled JAR`);
            
            if (extension.context) {
                const lsDir = extension.context.asAbsolutePath("ls");
                try {
                    const files = fs.readdirSync(lsDir);
                    const langServerJar = files.find(file => file.startsWith('ballerina-language-server') && file.endsWith('.jar'));
                    
                    if (langServerJar) {
                        log(`Language Server JAR: ${langServerJar}`);
                        log(`Language Server Path: ${path.join(lsDir, langServerJar)}`);
                        
                        // Extract version from JAR name
                        const versionMatch = langServerJar.match(/ballerina-language-server-(.+)\.jar$/);
                        if (versionMatch) {
                            log(`Language Server Version: ${versionMatch[1]}`);
                        }
                    } else {
                        log(`Language Server JAR: Not found in ${lsDir}`);
                    }
                } catch (error) {
                    log(`Error reading language server directory: ${error}`);
                }
            } else {
                log(`Language Server: Context not available`);
            }
        }
    } catch (error) {
        log(`Error logging language server info: ${error}`);
    }
}

export function logJavaInfo(extension: BallerinaExtension): void {
    try {
        const ballerinaHome = extension.getBallerinaHome();
        
        // Get the base ballerina home by removing the distribution part
        const baseHome = ballerinaHome.includes('distributions') 
            ? ballerinaHome.substring(0, ballerinaHome.indexOf('distributions'))
            : ballerinaHome;
        
        const dependenciesDir = path.join(baseHome, 'dependencies');
        
        // Check if dependencies directory exists and find JDK
        if (fs.existsSync(dependenciesDir)) {
            try {
                const files = fs.readdirSync(dependenciesDir);
                const jdkDir = files.find(file => file.match(/^jdk-.*-jre$/));
                
                if (jdkDir) {
                    log(`Java Runtime: Bundled JDK`);
                    log(`JDK Directory: ${jdkDir}`);
                    log(`JDK Path: ${path.join(dependenciesDir, jdkDir)}`);
                    
                    // Extract Java version from directory name
                    const versionMatch = jdkDir.match(/^jdk-(.+)-jre$/);
                    if (versionMatch) {
                        log(`Java Version: ${versionMatch[1]}`);
                    }
                    
                    // Try to get detailed Java version by executing java -version
                    const javaExecutable = isWindows() ? 'java.exe' : 'java';
                    const javaPath = path.join(dependenciesDir, jdkDir, 'bin', javaExecutable);
                    
                    if (fs.existsSync(javaPath)) {
                        log(`Java Executable: ${javaPath}`);
                        getDetailedJavaVersion(javaPath);
                    } else {
                        log(`Java Executable: Not found at ${javaPath}`);
                    }
                } else {
                    log(`Java Runtime: No bundled JDK found in dependencies`);
                    // Fall back to system Java
                    getSystemJavaVersion();
                }
            } catch (error) {
                log(`Error reading dependencies directory: ${error}`);
                getSystemJavaVersion();
            }
        } else {
            log(`Java Runtime: Dependencies directory not found, checking system Java`);
            getSystemJavaVersion();
        }
    } catch (error) {
        log(`Error logging Java info: ${error}`);
    }
}

export function getDetailedJavaVersion(javaPath: string): void {
    try {
        exec(`"${javaPath}" -version`, { timeout: 5000 }, (error, stdout, stderr) => {
            if (error) {
                log(`Error getting Java version: ${error.message}`);
                return;
            }
            
            // Java version info is typically in stderr
            const output = stderr || stdout;
            if (output) {
                const lines = output.split('\n').filter(line => line.trim());
                if (lines.length > 0) {
                    // First line usually contains the main version info
                    log(`Java Version Details: ${lines[0].trim()}`);
                    
                    // Log additional info if available
                    if (lines.length > 1) {
                        log(`Java Runtime Details: ${lines[1].trim()}`);
                    }
                    if (lines.length > 2) {
                        log(`Java VM Details: ${lines[2].trim()}`);
                    }
                }
            }
        });
    } catch (error) {
        log(`Error executing Java version command: ${error}`);
    }
}

export function getSystemJavaVersion(): void {
    try {
        log(`Java Runtime: System Java`);
        
        // Check JAVA_HOME environment variable
        if (process.env.JAVA_HOME) {
            log(`JAVA_HOME: ${process.env.JAVA_HOME}`);
            
            const javaExecutable = isWindows() ? 'java.exe' : 'java';
            const javaPath = path.join(process.env.JAVA_HOME, 'bin', javaExecutable);
            
            if (fs.existsSync(javaPath)) {
                log(`Java Executable: ${javaPath}`);
                getDetailedJavaVersion(javaPath);
            } else {
                log(`Java Executable: Not found at ${javaPath}`);
                // Try system java command
                getDetailedJavaVersion('java');
            }
        } else {
            log(`JAVA_HOME: Not set`);
            // Try system java command
            getDetailedJavaVersion('java');
        }
    } catch (error) {
        log(`Error getting system Java info: ${error}`);
    }
}
