import { LoggingDebugSession, OutputEvent, TerminatedEvent } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { exec } from 'child_process';
import { spawn, ChildProcess } from 'child_process';
import * as treeKill from 'tree-kill';
import { generateTasksJsonIfNotExists } from '../extension';
import * as vscode from 'vscode';
import { extension } from '../MIExtensionContext';
import { COMMANDS, SELECTED_SERVER_PATH } from '../constants';

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

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments, request?: DebugProtocol.Request): void {

        this.updateServerPathAndGet().then((path) => {
            if (!path) {
                response.success = false;
                this.sendResponse(response);
            } else {
                this.executeTasks(path)
                    .then(() => {
                        // Continue with other launch logic here
                        this.sendResponse(response);
                    })
                    .catch(error => {
                        // Handle error
                        console.error(error);
                    });
            }
        });
    }

    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {

        const taskExecution = vscode.tasks.taskExecutions.find(execution => execution.task.name === 'Another Task');
        if (taskExecution) {
            taskExecution.terminate();
            const taskExecution2 = vscode.tasks.taskExecutions.find(execution => execution.task.name === 'My Task');
            if (taskExecution2) {
                taskExecution2.terminate();
            }
            response.success = true;
        } else {
            response.success = false;
        }
        this.sendResponse(response);
    }

    protected async attachRequest(response: DebugProtocol.AttachResponse, args: DebugProtocol.LaunchRequestArguments) {
        return this.launchRequest(response, args);
    }

}