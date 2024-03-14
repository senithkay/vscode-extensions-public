import * as vscode from 'vscode';
import { CancellationToken, DebugConfiguration, ProviderResult, WorkspaceFolder } from 'vscode';
import { MiDebugAdapter } from './debugAdapter';
import { generateTasksJsonIfNotExists } from '../extension';


class MiConfigurationProvider implements vscode.DebugConfigurationProvider {
	
	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
	resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		
		
		// if launch.json is missing or empty
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'markdown') {
				config.type = 'mock';
				config.name = 'Launch';
				config.request = 'launch';
				// config.program = '${file}';
				config.stopOnEntry = true;
			}
		}

		// if (!config.program) {
		// 	return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
		// 		return undefined;	// abort launch
		// 	});
		// }

		return config;
	}
}

export function activateDebugger(context: vscode.ExtensionContext) {
	let storedPath: any;
	context.subscriptions.push(vscode.commands.registerCommand('extension.micro-integrator.getProgramName', config => {
		storedPath =  vscode.window.showInputBox({
			placeHolder: "Please enter the name of a markdown file in the workspace folder",
			value: "readme.md"
		});
		return storedPath;
	}));

    // register a configuration provider for 'mock' debug type
    const provider = new MiConfigurationProvider();
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mock', provider));

	// register a dynamic configuration provider for 'mock' debug type
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mock', {
		provideDebugConfigurations(folder: WorkspaceFolder | undefined): ProviderResult<DebugConfiguration[]> {
			return [
				{
					name: "Dynamic Launch",
					request: "launch",
					type: "mock"
				},
				{
					name: "Another Dynamic Launch",
					request: "launch",
					type: "mock"
				},
				{
					name: "Mock Launch",
					request: "launch",
					type: "mock"
				}
			];
		}
	}, vscode.DebugConfigurationProviderTriggerKind.Dynamic));

    const factory = new InlineDebugAdapterFactory();
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('mock', factory));
}

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
	
	createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
		return new vscode.DebugAdapterInlineImplementation(new MiDebugAdapter());
	}
}
