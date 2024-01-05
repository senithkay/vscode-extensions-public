import * as vscode from 'vscode';
import { MILanguageClient } from '../lang-client/activator';
import { GetProjectStructureResponse, ProjectStructureEntry } from '@wso2-enterprise/mi-core';

export class ProjectExplorerEntry extends vscode.TreeItem {
	children: ProjectExplorerEntry[] | undefined

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
		this.tooltip = `${this.label}`;
	}
}

export class ProjectExplorerEntryProvider implements vscode.TreeDataProvider<ProjectExplorerEntry> {
	private _data: ProjectExplorerEntry[]
	private _onDidChangeTreeData: vscode.EventEmitter<ProjectExplorerEntry | undefined | null | void> = new vscode.EventEmitter<ProjectExplorerEntry | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<ProjectExplorerEntry | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	constructor(context: vscode.ExtensionContext) {
		this._data = []

		getProjectStructureData(context)
			.then(data => {
				this._data = data
				this.refresh()
			})
			.catch(err => {
				console.error(err)
				this._data = []
			})
	}

	getTreeItem(element: ProjectExplorerEntry): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: ProjectExplorerEntry | undefined): vscode.ProviderResult<ProjectExplorerEntry[]> {
		if (element === undefined) {
			return this._data;
		}
		return element.children;
	}

}

async function getProjectStructureData(context: vscode.ExtensionContext): Promise<ProjectExplorerEntry[]> {
	const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ?
		vscode.workspace.workspaceFolders[0].uri.fsPath
		: undefined;

	if (rootPath === undefined) {
		throw new Error("Error identifying workspace root")
	}

	const langClient = (await MILanguageClient.getInstance(context)).languageClient;

	if (!!langClient) {
		const resp = await langClient.getProjectStructure(rootPath)

		const object: GetProjectStructureResponse =
		{
			"directoryMap": {
				"esbConfigs": {
					"message-stores": [
						{
							"type": "message-stores",
							"name": "messageStore.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/message-stores/messageStore.xml"
						}
					],
					"endpoints": [
						{
							"type": "endpoints",
							"name": "address.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/address.xml"
						},
						{
							"type": "endpoints",
							"name": "http.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/http.xml"
						},
						{
							"type": "endpoints",
							"name": "wsdl.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/wsdl.xml"
						},
						{
							"type": "endpoints",
							"name": "failover.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/failover.xml"
						},
						{
							"type": "endpoints",
							"name": "template.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/template.xml"
						},
						{
							"type": "endpoints",
							"name": "recipientlist.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/recipientlist.xml"
						},
						{
							"type": "endpoints",
							"name": "wsdl1.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/wsdl1.xml"
						},
						{
							"type": "endpoints",
							"name": "zc.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/zc.xml"
						},
						{
							"type": "endpoints",
							"name": "default.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/default.xml"
						},
						{
							"type": "endpoints",
							"name": "loadbalance.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/loadbalance.xml"
						}
					],
					"proxy-services": [
						{
							"sequences": [

							],
							"endpoints": [

							],
							"type": "proxy-services",
							"name": "proxy.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/proxy-services/proxy.xml"
						},
						{
							"sequences": [

							],
							"endpoints": [

							],
							"type": "proxy-services",
							"name": "wsdlproxy.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/proxy-services/wsdlproxy.xml"
						},
						{
							"sequences": [

							],
							"endpoints": [

							],
							"type": "proxy-services",
							"name": "wsdlfile.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/proxy-services/wsdlfile.xml"
						}
					],
					"local-entries": [
						{
							"type": "local-entries",
							"name": "localEntry.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/local-entries/localEntry.xml"
						}
					],
					"templates": [

					],
					"message-processors": [

					],
					"api": [
						{
							"sequences": [

							],
							"endpoints": [

							],
							"type": "api",
							"name": "HelloWorld.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/api/HelloWorld.xml"
						},
						{
							"sequences": [

							],
							"endpoints": [

							],
							"type": "api",
							"name": "newapi.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/api/newapi.xml"
						},
						{
							"sequences": [

							],
							"endpoints": [

							],
							"type": "api",
							"name": "hh.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/api/hh.xml"
						},
						{
							"sequences": [
								{
									"type": "sequence",
									"name": "defseq",
									"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/sequences/defseq.xml"
								}
							],
							"endpoints": [
								{
									"type": "endpoint",
									"name": "loadbalance",
									"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/loadbalance.xml"
								},
								{
									"type": "endpoint",
									"name": "address",
									"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/endpoints/address.xml"
								}
							],
							"type": "api",
							"name": "HelloWorld copy.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/api/HelloWorld copy.xml"
						}
					],
					"sequences": [
						{
							"sequences": [

							],
							"endpoints": [

							],
							"type": "sequences",
							"name": "defseq.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/sequences/defseq.xml"
						}
					],
					"inbound-endpoints": [
						{
							"sequences": [

							],
							"endpoints": [

							],
							"type": "inbound-endpoints",
							"name": "ibe.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/inbound-endpoints/ibe.xml"
						}
					],
					"tasks": [
						{
							"type": "tasks",
							"name": "tem.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/tasks/tem.xml"
						},
						{
							"type": "tasks",
							"name": "adfa.xml",
							"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloConfigs/src/main/synapse-config/tasks/adfa.xml"
						}
					]
				},
				"dataServiceConfigs": [
					{
						"type": "DATA_SERVICE_CONFIGS",
						"name": "dssconfig",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/dssconfig"
					}
				],
				"dataSourceConfigs": [
					{
						"type": "DATA_SOURCE_CONFIGS",
						"name": "datasource",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/datasource"
					},
					{
						"type": "DATA_SOURCE_CONFIGS",
						"name": "test-datasource",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/test-datasource"
					}
				],
				"mediatorProjects": [
					{
						"type": "MEDIATOR_PROJECT",
						"name": "mediatorProject",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/mediatorProject"
					}
				],
				"registryResources": [
					{
						"type": "REGISTRY_RESOURCE",
						"name": "reg",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/reg"
					},
					{
						"type": "REGISTRY_RESOURCE",
						"name": "sampleregres",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/sampleregres"
					}
				],
				"javaLibraryProjects": [

				],
				"compositeExporters": [
					{
						"type": "COMPOSITE_EXPORTER",
						"name": "helloCompositeExporter",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/helloCompositeExporter"
					}
				],
				"connectorExporters": [
					{
						"type": "CONNECTOR_EXPORTER",
						"name": "utilityconnectorexpoertr",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/utilityconnectorexpoertr"
					}
				],
				"dockerExporters": [
					{
						"type": "DOCKER_EXPORTER",
						"name": "docker",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/docker"
					},
					{
						"type": "DOCKER_EXPORTER",
						"name": "dss",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/dss"
					}
				],
				"kubernetesExporters": [
					{
						"type": "KUBERNETES_EXPORTER",
						"name": "k8sexporter",
						"path": "/Users/charukakarunanayake/test-projects/mi-tests/hello/k8sexporter"
					}
				]
			}
		};


		console.log(resp)


		return generateTreeData(resp);

	}

	return []

}

function generateTreeData(data: GetProjectStructureResponse): ProjectExplorerEntry[] {
	console.log("hehe >>>", data)
	const directoryMap = data.directoryMap;
	const result: ProjectExplorerEntry[] = [];
	const projectRoot = new ProjectExplorerEntry("Project", vscode.TreeItemCollapsibleState.Collapsed);

	for (const key in directoryMap) {
		switch (key) {
			case "esbConfigs":
				const esbConfigs = new ProjectExplorerEntry(
					key,
					isCollapsibleState(Object.keys(directoryMap.esbConfigs).length > 0));

				for (const key in directoryMap.esbConfigs) {
					const parentEntry = new ProjectExplorerEntry(key, isCollapsibleState(directoryMap.esbConfigs[key].length > 0));
					const children = genProjectStructureEntry(directoryMap.esbConfigs[key]);

					parentEntry.children = children;
					esbConfigs.children = esbConfigs.children ?? [];
					esbConfigs.children.push(parentEntry);
				}
				projectRoot.children = projectRoot.children ?? [];
				projectRoot.children.push(esbConfigs);
				break;
			case 'dataServiceConfigs':
			case 'dataSourceConfigs':
			case 'mediatorProjects':
			case 'registryResources':
			case 'javaLibraryProjects':
			case 'compositeExporters':
			case 'connectorExporters':
			case 'dockerExporters':
				const parentEntry = new ProjectExplorerEntry(
					key,
					isCollapsibleState(Object.keys(directoryMap.esbConfigs).length > 0));
				const children = genProjectStructureEntry(directoryMap[key]);
				parentEntry.children = children;
				projectRoot.children = projectRoot.children ?? [];
				projectRoot.children.push(parentEntry);
			default:
			// do none

		}
	}

	result.push(projectRoot);

	console.log("hehe >>>", result)

	return result;
}

function isCollapsibleState(state: boolean): vscode.TreeItemCollapsibleState {
	return state ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
}

function genProjectStructureEntry(data: ProjectStructureEntry[]): ProjectExplorerEntry[] {
	const result: ProjectExplorerEntry[] = [];

	for (const entry of data) {
		const children = genProjectStructureEntry(entry.sequences ?? []).concat(genProjectStructureEntry(entry.endpoints ?? []))
		result.push(new ProjectExplorerEntry(entry.name, isCollapsibleState(children.length > 0)));
	}

	return result;
}

