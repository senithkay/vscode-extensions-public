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
				config.type = 'mi';
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
