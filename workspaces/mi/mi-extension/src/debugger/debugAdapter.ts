import { LoggingDebugSession, OutputEvent, TerminatedEvent } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { exec } from 'child_process';
import { spawn, ChildProcess } from 'child_process';
import * as treeKill from 'tree-kill';
import { generateTasksJsonIfNotExists } from '../extension';
import * as vscode from 'vscode';
import { extension } from '../MIExtensionContext';
import { COMMANDS, SELECTED_SERVER_PATH } from '../constants';

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    /** An absolute path to the "program" to debug. */
    program: string;
}


export class MiDebugAdapter extends LoggingDebugSession {
    private childProcess: ChildProcess | null = null;

    private async executeTasks(program: string): Promise<void> {

        const commandPath = program + '/repository/deployment/server/carbonapps';
        const commandToExecute = "mvn clean install && cp -f target/*.car " + commandPath;

        const firstTask = new vscode.Task(
            { type: 'myTaskType' },
            vscode.TaskScope.Workspace,
            'My Task',
            'My Task Executable',
            new vscode.ShellExecution(commandToExecute)
        );

        await vscode.tasks.executeTask(firstTask);

        const command2 = program + '/bin/micro-integrator.sh';
        const secondTask = new vscode.Task(
            { type: 'anotherTaskType' },
            vscode.TaskScope.Workspace,
            'Another Task',
            'Another Task Executable',
            new vscode.ShellExecution(command2)
        );

        await vscode.tasks.executeTask(secondTask);
    }

    

    private async updateServerPathAndGet(): Promise<string | undefined> {
        const currentPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
        if (!currentPath) {
            await vscode.commands.executeCommand(COMMANDS.CHANGE_SERVER_PATH);
            const updatedPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
            return updatedPath as string;
        }
        return currentPath as string;
        
    }

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments, request?: DebugProtocol.Request): void {
        // const newPath = this.updateServerPathAndGet().then((path) => {
        //     const path2 = path;
        //     this.sendResponse(response);
        // });
        



       

        this.executeTasks(args.program)
            .then(() => {
                // Continue with other launch logic here
                this.sendResponse(response);
            })
            .catch(error => {
                // Handle error
                console.error(error);
            });

        



        // const command = args.program  + '/bin/micro-integrator.sh';
        // // const command = '/Users/sachinisa/Documents/MiTestSamples/wso2mi-4.2.0/bin/micro-integrator.sh';
        // console.log('command:', command);
        // this.childProcess = spawn(command,  {detached: true});

        // // Pipe stdout and stderr to the debugging terminal
        // if (this.childProcess) {
        //     this.childProcess.stdout?.on('data', (data) => {
        //         this.sendEvent(new OutputEvent(data.toString(), 'stdout'));
        //     });

        //     this.childProcess.stderr?.on('data', (data) => {
        //         this.sendEvent(new OutputEvent(data.toString(), 'stderr'));
        //     });

        //     this.childProcess.on('close', (code) => {
        //         if (code !== 0) {
        //             this.sendEvent(new OutputEvent(`Process exited with code ${code}`, 'stderr'));
        //         }
        //         this.sendEvent(new TerminatedEvent());
        //     });
        // }

        // this.sendResponse(response);
    }

    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {

        const taskExecution = vscode.tasks.taskExecutions.find(execution => execution.task.name === 'Another Task');
    if (taskExecution) {
        
        taskExecution.terminate();
        response.success = true;
    } else {
        response.success = false;
    }
    this.sendResponse(response);
    
        // if (this.childProcess?.pid) {
        //     const childPid = this.childProcess.pid;

        //     const killProcess = treeKill(childPid, 'SIGINT', (err) => {
        //         if (err) {
        //             console.error('Error killing process and its descendants:', err);
        //             response.success = false;
        //         } else {
        //             console.log('Process and its descendants terminated');
        //             response.success = true;
        //         }
        //         this.sendResponse(response);
        //     });


        // } else {
        //     response.success = false;
        //     this.sendResponse(response);
        // }
    }

    protected async attachRequest(response: DebugProtocol.AttachResponse, args: ILaunchRequestArguments) {
        return this.launchRequest(response, args);
    }

}