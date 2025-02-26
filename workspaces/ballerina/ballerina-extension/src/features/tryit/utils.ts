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
import * as vscode from 'vscode';

// Retrieve the platform-specific commands
const platform = os.platform();

export interface Process {
    processName: string;
    pid: string;
    command: string;
    ports: number[];
}

export function findRunningBallerinaProcesses(projectPath: string): Promise<Process[]> {
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
            let balProcesses = processes.map((service) => {
                const [, processName, pid, command] = service.trim().match(/(\S+)\s+(\d+)\s+(.+)/) || [];
                const ports = pid ? getServicePorts(pid) : [];
                return { processName, pid, command, ports };
            });

            // Display the service information
            balProcesses = balProcesses.filter((process) => process.ports && process.ports.length > 0);
            balProcesses.forEach((service) => {
                debug(`Bal Process: ${service.pid}, Port(s): ${service.ports}`);
            });

            return resolve(balProcesses);
        });
    });
}

// Function to retrieve the port information of services using the related Ballerina program's process ID (PID)
function getServicePorts(pid: string): number[] {
    try {
        const output = execSync(getLSOFCommand(platform, pid), { encoding: 'utf-8' });
        if (isNaN(output as any)) {
            const listeningConnectionRegex = /^n(?:\*|localhost):(\d+)\b$/;
            const ports = output
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => listeningConnectionRegex.test(line))
                .map(line => {
                    const match = line.match(listeningConnectionRegex);
                    return match ? parseInt(match[1]) : null; // Convert port number to integer
                })
                .filter((port): port is number => port !== null);

            return ports;
        }
    } catch (error) {
        debug(`Error retrieving port for process ${pid}: ${error}`);
    }
    return [];
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

export async function waitForBallerinaService(projectDir: string): Promise<void> {
    const maxAttempts = 200; // Try for 20 seconds
    const timeout = 100; // 100ms

    let attempt = 0;
    while (attempt < maxAttempts) {
        const runningProcesses = await findRunningBallerinaProcesses(projectDir);
        if (runningProcesses.length > 0) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, timeout));
        attempt++;
    }
    throw new Error('Timed out waiting for Ballerina service to start');
}

/**
 * Centralized error handling function for Try It feature
 * @param error The error object or error message
 * @param context Description of where the error occurred
 * @param showToUser Whether to show the error to the user (default: true)
 */
export function handleError(error, context: string, showToUser = true): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (showToUser) {
        vscode.window.showErrorMessage(`${context}: ${errorMessage}`);
    }

    console.error(`[${context}]`, error);
}

/**
 * Singleton class to manage the language client reference
 */
export class ClientManager {
    private static instance: ClientManager;
    private _langClient: any = undefined;

    private constructor() { }

    public static getInstance(): ClientManager {
        if (!ClientManager.instance) {
            ClientManager.instance = new ClientManager();
        }
        return ClientManager.instance;
    }

    public setClient(client: any): void {
        this._langClient = client;
    }

    public getClient(): any {
        if (!this._langClient) {
            throw new Error('Language client is not initialized');
        }
        return this._langClient;
    }

    public hasClient(): boolean {
        return !!this._langClient;
    }
}

// Export singleton instance
export const clientManager = ClientManager.getInstance();