import { LoggingDebugSession, OutputEvent, TerminatedEvent } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { exec } from 'child_process';
import { spawn, ChildProcess } from 'child_process';
import * as treeKill from 'tree-kill';
import { generateTasksJsonIfNotExists } from '../extension';

export class MiDebugAdapter extends LoggingDebugSession {
    private childProcess: ChildProcess | null = null;

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments, request?: DebugProtocol.Request): void {
        const command = '/Users/sachinisa/Documents/MiTestSamples/wso2mi-4.2.0/bin/micro-integrator.sh';
        this.childProcess = spawn(command,  {detached: true});

        // Pipe stdout and stderr to the debugging terminal
        if (this.childProcess) {
            this.childProcess.stdout?.on('data', (data) => {
                this.sendEvent(new OutputEvent(data.toString(), 'stdout'));
            });

            this.childProcess.stderr?.on('data', (data) => {
                this.sendEvent(new OutputEvent(data.toString(), 'stderr'));
            });

            this.childProcess.on('close', (code) => {
                if (code !== 0) {
                    this.sendEvent(new OutputEvent(`Process exited with code ${code}`, 'stderr'));
                }
                this.sendEvent(new TerminatedEvent());
            });
        }

        this.sendResponse(response);
    }

    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {        
        
        if (this.childProcess?.pid) {
            const childPid = this.childProcess.pid;
        
            const killProcess = treeKill(childPid, 'SIGINT', (err) => {
                if (err) {
                    console.error('Error killing process and its descendants:', err);
                    response.success = false;
                } else {
                    console.log('Process and its descendants terminated');
                    response.success = true;
                }
                this.sendResponse(response);
            });

            
        } else {
            response.success = false;
            this.sendResponse(response);
        }
	}

	protected async attachRequest(response: DebugProtocol.AttachResponse, args: DebugProtocol.LaunchRequestArguments) {
		return this.launchRequest(response, args);
	}

}