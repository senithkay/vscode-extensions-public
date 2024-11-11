/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { exec, execSync } from 'child_process';
import { debug } from '../../utils';
import * as os from 'os';
import { vscode } from '@wso2-enterprise/ballerina-core';
import { window } from 'vscode';

// Retrieve the platform-specific commands
const platform = os.platform();

export interface Process {
    serviceName: string;
    pid: string;
    command: string;
    port: number;
}

export function findRunningBallerinaServices(projectPath: string): Promise<Process[]> {
    // Execute the 'ps' command to retrieve running processes with command
    return new Promise((resolve, reject) => {
        exec(getPSCommand(platform, `-XX:HeapDumpPath=${projectPath}`), (error, stdout) => {
            if (error) {
                debug(`Error executing ps command: ${error}`);
                return reject(error);
            }

            // Parse the output of the 'ps' command
            const out = stdout.trim().split('\n');
            const processes = platform == 'win32' ? out.slice(1) : out; // Exclude the header row

            // Extract the service name, PID, and command information
            let services = processes.map((service) => {
                const [, serviceName, pid, command] = service.trim().match(/(\S+)\s+(\d+)\s+(.+)/) || [];
                const port = pid ? getServicePort(pid) : undefined;
                return { serviceName, pid, command, port };
            });

            // Display the service information
            services = services.filter((service) => !isNaN(service.port as any));
            services.forEach((service) => {
                debug(`Service: ${service.serviceName} Port: ${service.port}`);
            });

            return resolve(services);
        });
    });
}

// Function to retrieve the port information of a service using its process ID (PID)
function getServicePort(pid: string): number | undefined {
    try {
        const output = execSync(getLSOFCommand(platform, pid), { encoding: 'utf-8' });
        if (isNaN(output as any)) {
            const portMatch = output.match(/:\d+/);
            if (portMatch) {
                return parseInt(portMatch[0].substring(1));
            }
        } else { return parseInt(output); }
    } catch (error) {
        debug(`Error retrieving port for process ${pid}: ${error}`);
    }
    return undefined;
}

// Function to get the platform-specific 'ps' command
function getPSCommand(platform: string, searchStr: string): string {
    switch (platform) {
        case 'darwin':
            return `ps -A -o comm,pid,command | grep -e "${searchStr}"`;
        case 'linux':
            return `ps -A -o comm,pid,cmd | grep -e "${searchStr}"`;
        case 'win32':
            return `powershell -command "Get-CimInstance -query \\"select * from win32_process WHERE commandLine LIKE '%${searchStr.replaceAll("\\", "\\\\")}%'\\" | Format-Table Name,ProcessId,commandLine | Out-String -Width 512"`;
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
}

// Function to get the platform-specific 'lsof' command
function getLSOFCommand(platform: string, pid: string): string {
    switch (platform) {
        case 'darwin':
            return `lsof -a -i -p ${pid} -P -F nP`;
        case 'linux':
            return `lsof -a -i -p ${pid} -P -F nP`;
        case 'win32':
            return `powershell -command "Get-NetTCPConnection -OwningProcess ${pid} | Where-Object { $_.State -eq 'Listen' } | Select-Object -ExpandProperty LocalPort"`;
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
}

export async function waitForBallerinaService(projectDir: string): Promise<number> {
    const defaultPort = 9090;
    const maxAttempts = 30; // Try for 30 seconds
    let attempts = 0;

    while (attempts < maxAttempts) {
        const runningServices = await findRunningBallerinaServices(projectDir);
        if (runningServices.length > 0) {
            return runningServices[0].port;
        }

        // Wait for 1 second before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
    }
    throw new Error('Timed out waiting for Ballerina service to start');
}