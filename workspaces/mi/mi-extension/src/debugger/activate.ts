/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { CancellationToken, DebugConfiguration, ProviderResult, WorkspaceFolder } from 'vscode';
import { MiDebugAdapter } from './debugAdapter';
import { COMMANDS, SELECTED_SERVER_PATH } from '../constants';
import { extension } from '../MIExtensionContext';


class MiConfigurationProvider implements vscode.DebugConfigurationProvider {

    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {
        // if launch.json is missing or empty
        if (!config.type && !config.request && !config.name) {
            config.type = 'mi';
            config.name = 'MI: Run';
            config.request = 'launch';
        }

        return config;
    }
}

export function activateDebugger(context: vscode.ExtensionContext) {

    vscode.commands.registerCommand(COMMANDS.CHANGE_SERVER_PATH, async () => {
        const addServer: string = "Add MI Server";
        const currentServerPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
        const quickPicks: vscode.QuickPickItem[] = [];
        if (!currentServerPath) {
            quickPicks.push({ label: addServer });
        } else {
            quickPicks.push({ kind: vscode.QuickPickItemKind.Separator, label: "current server path" });
            quickPicks.push({ label: currentServerPath, },
                { label: addServer });
        }
        const options: vscode.QuickPickOptions = { canPickMany: false, title: "Select Server Path" };
        const selected = await vscode.window.showQuickPick(quickPicks, options);
        if (selected) {
            if (selected.label === addServer) {
                // Perform a folder search
                const folders = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Folder'
                });

                if (!folders || folders.length === 0) {
                    return undefined;
                }

                await extension.context.globalState.update(SELECTED_SERVER_PATH, folders[0].fsPath);
            } else {
                await extension.context.globalState.update(SELECTED_SERVER_PATH, selected.label);
            }
        }
    });

    // register a configuration provider for 'mi' debug type
    const provider = new MiConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mi', provider));

    // register a dynamic configuration provider for 'mi' debug type
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mi', {
        provideDebugConfigurations(folder: WorkspaceFolder | undefined): ProviderResult<DebugConfiguration[]> {
            return [
                {
                    name: "MI: Run",
                    request: "launch",
                    type: "mi"
                }
            ];
        }
    }, vscode.DebugConfigurationProviderTriggerKind.Dynamic));

    const factory = new InlineDebugAdapterFactory();
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('mi', factory));
}

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

    createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new MiDebugAdapter());
    }
}
