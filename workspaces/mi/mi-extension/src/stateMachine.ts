/* eslint-disable @typescript-eslint/naming-convention */
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import { Uri, ViewColumn } from 'vscode';
import { MILanguageClient } from './lang-client/activator';
import { extension } from './MIExtensionContext';
import {
    DM_FUNCTION_NAME,
    EVENT_TYPE,
    HistoryEntry,
    MACHINE_VIEW,
    MachineStateValue,
    SyntaxTreeMi,
    VisualizerLocation,
    webviewReady
} from '@wso2-enterprise/mi-core';
import { ExtendedLanguageClient } from './lang-client/ExtendedLanguageClient';
import { VisualizerWebview } from './visualizer/webview';
import { RPCLayer } from './RPCLayer';
import { history } from './history/activator';
import { COMMANDS } from './constants';
import { openAIWebview } from './ai-panel/aiMachine';
import { AiPanelWebview } from './ai-panel/webview';
import { activateProjectExplorer } from './project-explorer/activate';
import { StateMachineAI } from './ai-panel/aiMachine';
import { getSources } from './util/dataMapper';
import { StateMachinePopup } from './stateMachinePopup';
import { STNode } from '../../syntax-tree/lib/src';
import { log } from './util/logger';
import { deriveConfigName } from './util/dataMapper';
import { fileURLToPath } from 'url';

interface MachineContext extends VisualizerLocation {
    langClient: ExtendedLanguageClient | null;
}

const stateMachine = createMachine<MachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWA6VA7VAXVAhgDaoBeYAxBAPZZiZYBu1A1vQMYAWY7LACgCdqAKx64A2gAYAuolAAHarDypackAA9EAJgCMANnSSA7AA5dAZgCsuyZIAspyVasAaEAE9E9+7vTHtfQDtK3tJSysATnsAXxj3NAYVYjJKGjoGZjZ0Lh5+IVF2CV1ZJBBFZXw1Mq0EbUlDE3NrWwcnF3cvBFMLdG1jC3sLfVNRyKt9PTiEjGxkknIqWnpsLI5uXkERMXFtUoUlFWrQWr1GswjWx2c3Tx1J9Cs7E0jjXXtQ-WmQRLn8FMWYAEQgE6HkRAIuAAZtQBMgcht8tsilJ9uVDlUsOpalZtJ1EO8rL1IqYSZEgqZAhYLJFvok6AB3LaFXAAETAuDEkCWGVWrHo9LATIKYnZnKKkAQfPYkNUWFRqPUFSOWJqiDe9keuisA2MDX0Nm1+IQ9n0mo+1IGuj0DUi0TpGGoRAgzNFHK5EB5KyY-PQiSdLpFRTFHqlPplmIVMiVGLl2PVw3QQV0kX6NNxI2Ntkaz1MxlNZMk1Id6CIsAAkjhcF7Mr7EmXK3gw8wI3Ko2jlZj43V9JF0JTzDYeu1Ig0s7Y-PZtHbtBZnNpfLT4j8MA2qxQgSCwRDobD4fWK1Xm9RW7R2zHKnG1T2+wPtbph85R-osxZrUZLG-6iY9dYSwIwAICAPHQRhUCFAAZaggOwKAaz5bJEgAoCQLAyDoIgWDj1PeUZEVMpOyvE4CXCPxU2-PVwl7M0s20Bd0DCM1wgsUxTX0P9lyQwDgNA8CGQAZVwAheFg+CfUQjBkJ4tCBKEkSsCgbDZTPPDowI2Njk0Akp20dBBhY4x9AMAJ7BJWj6MYsJLFY-R2Ksf9uNQviADkCDAqBIW5dJvTWP1JMc3ihVc9zPIgJTI1UjsNNVYiEHeOi9KGPMjKCBczLuBBIgsYx0F0Yw7QCB9TEmCYHJQwKGQAJUcigAHk+AAUWcgB9AA1csGoAdXwg5L002p2NMfshhnIs3iyyJaLsXL8tTRxjACEYvk4-zypk6qUIoZyAEF2oAcW2gAVBqevRPqYq0hBBuGmlUzGlMaSzZxDCnO0GhYwI6LK6S+I24CKAAMXLCCGuahrWXLQ7TsI-rEGu1jbvqbKHsmjLLFNJNqXqOjKWiXRvqcoUGsw-AFIocHIea1lauck61N6lVuzNXpnmyrLgmy+xaPJXLqWYpijNCEtGVdIoKqgmCye82sJPQEWg1wcWMKw6VlNw6Roei7sLiTN5SRpYwbFeW4umsXSLW1Oc9cmU1haFUXFfWmr6qatqOu6+mzsZ68el0qJstGa0F0mCxjRCQwnjsZnJFMGxSu+LBqAgOB1DQC9vdigBaF8Mszqx0DtQui6LnUSz+QgFjAdOu2vKdjSGSci20WPrXeUdYhWuX7YVkMJQgauiMu0y-EjkxJDtfQ7Dok3vBpAuiWb0Z6kXfMSwDB3e85fv1PO7sbF6A1JiMiwF0NvNjXMR5niLAw5qnks1zwAfYYQBbufzsk8z0WdbHszupK6AzGusUdJJhCDHXQxlpw3AvqZXWZJ6ikgnqYAmStJZQGfhdWoZghrPh8JAyIlgyTjjtAXBoVhWI+A+AtYwqCZKCWEiwWCmDuyt10s+awRYb62Rzl0AhfY8FPEMq9IW-8AoyWCqgDyW8WHXgMHlPS1p7ADBjuYEqT0KFJgmEMOi1FHAoLEWtX6jlZEgL1GAp45goGjg6GjLGmMT7N1xLOIkS4ZjoAARVYmKgFKmMujgshZpfApiIaSV8vhHimSXraN8U4SyYVgAQAARkQSAfjagjT6M0QIrwixvlDmjIYOVPzWmsGaPUUxO7y2RLgdJiAnj50PoESwp8KHGCzL2IwzwrIUKJCfDu7jqksjQZhXxO8M6XRcAfCYzT+ln3aRlHJSYdHsUkP0celg7bChqRVP6gCvbAMuiSXSh85zBJGDHBZXRm45ScMgz6WUiQdziEAA */
    id: 'mi',
    initial: 'initialize',
    predictableActionArguments: true,
    context: {
        langClient: null,
        errors: [],
        view: MACHINE_VIEW.Welcome
    },
    states: {
        initialize: {
            invoke: {
                id: 'checkProject',
                src: checkIfMiProject,
                onDone: [
                    {
                        target: 'projectDetected',
                        cond: (context, event) =>
                            // Assuming true means project detected
                            event.data.isProject === true && event.data.emptyProject === true,
                        actions: assign({
                            view: (context, event) => MACHINE_VIEW.ADD_ARTIFACT,
                            projectUri: (context, event) => event.data.projectUri,
                            isOldProject: (context, event) => false,
                            displayOverview: (context, event) => true,
                        })
                    },
                    {
                        target: 'projectDetected',
                        cond: (context, event) =>
                            // Assuming true means project detected
                            event.data.isProject === true && event.data.emptyProject === false,
                        actions: assign({
                            view: (context, event) => MACHINE_VIEW.Overview,
                            projectUri: (context, event) => event.data.projectUri,
                            isOldProject: (context, event) => false,
                            displayOverview: (context, event) => true,
                        })
                    },
                    {
                        target: 'oldProjectDetected',
                        cond: (context, event) =>
                            // Assuming true means old project detected
                            event.data.isOldProject === true && event.data.displayOverview === true,
                        actions: assign({
                            view: (context, event) => MACHINE_VIEW.UnsupportedProject,
                            projectUri: (context, event) => event.data.projectUri,
                            isOldProject: (context, event) => true,
                            displayOverview: (context, event) => true,
                        })
                    },
                    {
                        target: 'lsInit',
                        cond: (context, event) =>
                            // Integration Studio project with disabled overview
                            event.data.isOldProject === true && event.data.displayOverview === false,
                        actions: assign({
                            isOldProject: (context, event) => event.data.isOldProject,
                            displayOverview: (context, event) => event.data.displayOverview
                        })
                    },
                    {
                        target: 'newProject',
                        // Assuming false means new project
                        cond: (context, event) => event.data.isProject === false && event.data.isOldProject === false,
                        actions: assign({
                            view: (context, event) => MACHINE_VIEW.Welcome
                        })
                    }
                    // No need for an explicit action for the false case unless you want to assign something specific
                ],
                onError: {
                    target: 'disabled',
                    actions: assign({
                        view: (context, event) => MACHINE_VIEW.Disabled,
                        errors: (context, event) => event.data
                    })
                }
            }
        },
        projectDetected: {
            invoke: {
                src: 'activateProjectExplorer',
                onDone: {
                    target: 'projectExplorerActivated'
                }
            }
        },
        oldProjectDetected: {
            invoke: {
                src: 'openWebPanel',
                onDone: {
                    target: 'lsInit'
                }
            }
        },
        projectExplorerActivated: {
            invoke: {
                src: 'openWebPanel',
                onDone: {
                    target: 'lsInit'
                }
            }
        },
        lsInit: {
            invoke: {
                src: 'waitForLS',
                onDone: [
                    {
                        target: 'ready',
                        cond: (context, event) => context.displayOverview === true,
                        actions: assign({
                            langClient: (context, event) => event.data
                        })
                    },
                    {
                        target: 'ready.viewReady',
                        cond: (context, event) => context.displayOverview === false,
                        actions: assign({
                            langClient: (context, event) => event.data
                        })
                    }
                ],
                onError: {
                    target: 'disabled',
                    actions: assign({
                        view: (context, event) => MACHINE_VIEW.Disabled,
                        errors: (context, event) => event.data
                    })
                }
            }
        },
        ready: {
            initial: 'viewLoading',
            states: {
                viewLoading: {
                    invoke: {
                        src: 'openWebPanel',
                        onDone: {
                            target: 'viewFinding'
                        }
                    }
                },
                viewFinding: {
                    invoke: {
                        src: 'findView',
                        onDone: {
                            target: 'viewStacking',
                            actions: assign({
                                view: (context, event) => event.data.view,
                                stNode: (context, event) => event.data.stNode,
                                diagnostics: (context, event) => event.data.diagnostics,
                                dataMapperProps: (context, event) => event.data?.dataMapperProps
                            })
                        }
                    }
                },
                viewStacking: {
                    invoke: {
                        src: 'updateStack',
                        onDone: {
                            target: "viewNavigated"
                        }
                    }
                },
                viewUpdated: {
                    invoke: {
                        src: 'findView',
                        onDone: {
                            target: "viewNavigated",
                            actions: assign({
                                stNode: (context, event) => event.data.stNode,
                                diagnostics: (context, event) => event.data.diagnostics,
                                dataMapperProps: (context, event) => event.data?.dataMapperProps
                            })
                        }
                    }
                },
                viewNavigated: {
                    invoke: {
                        src: 'updateAIView',
                        onDone: {
                            target: "viewReady"
                        }
                    }
                },
                viewReady: {
                    on: {
                        OPEN_VIEW: {
                            target: "viewLoading",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view,
                                identifier: (context, event) => event.viewLocation.identifier,
                                documentUri: (context, event) => event.viewLocation.documentUri,
                                projectUri: (context, event) => event.viewLocation.projectUri,
                                position: (context, event) => event.viewLocation.position,
                                projectOpened: (context, event) => true,
                                customProps: (context, event) => event.viewLocation.customProps,
                                dataMapperProps: (context, event) => event.viewLocation.dataMapperProps,
                                stNode: (context, event) => undefined,
                                diagnostics: (context, event) => undefined,
                            })
                        },
                        NAVIGATE: {
                            target: "viewUpdated",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view,
                                identifier: (context, event) => event.viewLocation.identifier,
                                documentUri: (context, event) => event.viewLocation.documentUri,
                                position: (context, event) => event.viewLocation.position,
                                projectOpened: (context, event) => true,
                                customProps: (context, event) => event.viewLocation.customProps,
                                dataMapperProps: (context, event) => event.viewLocation.dataMapperProps
                            })
                        },
                        FILE_EDIT: {
                            target: "viewEditing"
                        }
                    }
                },
                viewEditing: {
                    on: {
                        EDIT_DONE: {
                            target: "viewReady"
                        }
                    }
                },
            }
        },
        disabled: {
            invoke: {
                src: 'disableExtension',
            },
        },
        newProject: {
            initial: "viewLoading",
            states: {
                viewLoading: {
                    invoke: {
                        src: 'openWebPanel',
                        onDone: {
                            target: 'viewReady'
                        }
                    }
                },
                viewReady: {
                    on: {
                        OPEN_VIEW: {
                            target: "viewLoading",
                            actions: assign({
                                view: (context, event) => event.viewLocation.view
                            })
                        }
                    }
                }
            }
        }
    }
}, {
    guards: {

    },
    services: {
        waitForLS: (context, event) => {
            // replace this with actual promise that waits for LS to be ready
            return new Promise(async (resolve, reject) => {
                try {
                    vscode.commands.executeCommand(COMMANDS.FOCUS_PROJECT_EXPLORER);
                    const instance = await MILanguageClient.getInstance(extension.context);
                    const errors = instance.getErrors();
                    if (errors.length) {
                        return reject(errors);
                    }
                    const ls = instance.languageClient;
                    vscode.commands.executeCommand('setContext', 'MI.status', 'projectLoaded');
                    // Activate the AI Panel State machine after LS is loaded.
                    StateMachineAI.initialize();
                    StateMachinePopup.initialize();

                    resolve(ls);
                } catch (error) {
                    reject(error);
                }
            });
        },
        activateProjectExplorer: (context, event) => {
            return new Promise(async (resolve, reject) => {
                await activateProjectExplorer(extension.context);
                resolve(true);
            });
        },
        openWebPanel: (context, event) => {
            // Get context values from the project storage so that we can restore the earlier state when user reopens vscode
            return new Promise((resolve, reject) => {
                if (!VisualizerWebview.currentPanel) {
                    VisualizerWebview.currentPanel = new VisualizerWebview(context.view!, extension.webviewReveal);
                    RPCLayer._messenger.onNotification(webviewReady, () => {
                        resolve(true);
                    });
                } else {
                    VisualizerWebview.currentPanel!.getWebview()?.reveal(extension.webviewReveal ? ViewColumn.Beside : ViewColumn.Active);
                    resolve(true);
                }
            });
        },
        findView: (context, event): Promise<VisualizerLocation> => {
            return new Promise(async (resolve, reject) => {
                const langClient = StateMachine.context().langClient!;
                const viewLocation = context;
                if (context.view?.includes("Form")) {
                    return resolve(viewLocation);
                }
                if (context.view === MACHINE_VIEW.DataMapperView) {
                    if (context.documentUri) {
                        const filePath = context.documentUri;
                        const functionName = DM_FUNCTION_NAME;

                        const [fnSource, interfacesSrc, localVariablesSrc] = getSources(filePath, functionName);
                        viewLocation.dataMapperProps = {
                            filePath: filePath,
                            functionName: functionName,
                            fileContent: fnSource,
                            interfacesSource: interfacesSrc,
                            localVariablesSource: localVariablesSrc,
                            configName: deriveConfigName(filePath)
                        };
                        viewLocation.view = MACHINE_VIEW.DataMapperView;
                    }
                    return resolve(viewLocation);
                }
                if (context.documentUri) {
                    try {
                        const response = await langClient.getSyntaxTree({
                            documentIdentifier: {
                                uri: context.documentUri!
                            },
                        });
                        if (response?.syntaxTree) {
                            const node: SyntaxTreeMi = response.syntaxTree;
                            switch (true) {
                                case !!node.api:
                                    viewLocation.view = MACHINE_VIEW.ServiceDesigner;
                                    viewLocation.stNode = node.api;
                                    if (context.identifier?.toString()) {
                                        viewLocation.view = MACHINE_VIEW.ResourceView;
                                        viewLocation.stNode = node.api.resource[context.identifier];
                                    }
                                    break;
                                case !!node.proxy:
                                    viewLocation.view = MACHINE_VIEW.ProxyView;
                                    viewLocation.stNode = node.proxy;
                                    break;
                                case !!node.sequence:
                                    viewLocation.view = MACHINE_VIEW.SequenceView;
                                    viewLocation.stNode = node.sequence;
                                    break;
                                case !!node.data_mapper:
                                    viewLocation.view = MACHINE_VIEW.DataMapperView;
                                    viewLocation.stNode = node.data_mapper;
                                    break;
                                case !!node.template:
                                    if (node.template.sequence) {
                                        viewLocation.view = MACHINE_VIEW.SequenceTemplateView;
                                        viewLocation.stNode = node.template;
                                        break;
                                    }
                                default:
                                    // Handle default case
                                    viewLocation.stNode = node as any as STNode;
                                    break;
                            }
                        }
                    } catch (error) {
                        viewLocation.stNode = undefined;
                        console.log("Error occured", error);
                    }
                }
                if (viewLocation.view === MACHINE_VIEW.ResourceView) {
                    const res = await langClient!.getDiagnostics({ documentUri: context.documentUri! });
                    if (res.diagnostics && res.diagnostics.length > 0) {
                        viewLocation.diagnostics = res.diagnostics;
                    }
                }
                updateProjectExplorer(viewLocation);
                resolve(viewLocation);
            });
        },
        updateStack: (context, event) => {
            return new Promise(async (resolve, reject) => {
                if (!context.view?.includes("Form")) {
                    history.push({
                        location: {
                            view: context.view,
                            documentUri: context.documentUri,
                            position: context.position,
                            identifier: context.identifier,
                            dataMapperProps: context?.dataMapperProps
                        }
                    });
                }
                StateMachinePopup.resetState();
                resolve(true);
            });
        },
        updateAIView: () => {
            return new Promise(async (resolve, reject) => {
                if (AiPanelWebview.currentPanel) {
                    openAIWebview();
                }
                resolve(true);
            });
        },
        disableExtension: (context, event) => {
            return new Promise(async (resolve, reject) => {
                vscode.commands.executeCommand('setContext', 'MI.status', 'disabled');
                updateProjectExplorer(context);
                resolve(true);
            });
        }
    }
});


// Create a service to interpret the machine
export const stateService = interpret(stateMachine);

// Define your API as functions
export const StateMachine = {
    initialize: () => stateService.start(),
    service: () => { return stateService; },
    context: () => { return stateService.getSnapshot().context; },
    state: () => { return stateService.getSnapshot().value as MachineStateValue; },
    sendEvent: (eventType: EVENT_TYPE) => { stateService.send({ type: eventType }); },
};

export function openView(type: EVENT_TYPE, viewLocation?: VisualizerLocation) {
    if (viewLocation?.documentUri) {
        viewLocation.documentUri = viewLocation.documentUri.startsWith("file") ? fileURLToPath(viewLocation.documentUri) : Uri.file(viewLocation.documentUri).fsPath;
    }
    // Set the projectUri If undefined.
    if (!viewLocation?.projectUri && vscode.workspace.workspaceFolders) {
        viewLocation!.projectUri = vscode.workspace.workspaceFolders![0].uri.fsPath;
    }
    updateProjectExplorer(viewLocation);
    const value = StateMachine.state();
    stateService.send({ type: type, viewLocation: viewLocation });
}

export function navigate(entry?: HistoryEntry) {
    const historyStack = history.get();
    if (historyStack.length === 0) {
        if (entry) {
            history.push({ location: entry.location });
            stateService.send({ type: "NAVIGATE", viewLocation: entry!.location });
        } else {
            history.push({ location: { view: MACHINE_VIEW.Overview } });
            stateService.send({ type: "NAVIGATE", viewLocation: { view: MACHINE_VIEW.Overview } });
        }
    } else {
        const location = historyStack[historyStack.length - 1].location;
        stateService.send({ type: "NAVIGATE", viewLocation: location });
    }
}

function updateProjectExplorer(location: VisualizerLocation | undefined) {
    if (location && location.documentUri) {
        const projectRoot = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(location.documentUri));
        if (projectRoot && !extension.preserveActivity) {
            location.projectUri = projectRoot.uri.fsPath;
            if (!StateMachine.context().isOldProject) {
                vscode.commands.executeCommand(COMMANDS.REVEAL_ITEM_COMMAND, location);
            }
        }
    }
    const webview = VisualizerWebview.currentPanel?.getWebview();
    if (webview) {
        if (location && location.view) {
            webview.title = location.view;
        }
    }
}

async function checkIfMiProject() {
    let isProject = false, isOldProject = false, displayOverview = true, emptyProject = false;
    let projectUri = '';
    try {
        // Check for pom.xml files excluding node_modules directory
        const pomFiles = await vscode.workspace.findFiles('pom.xml', '**/node_modules/**', 1);
        if (pomFiles.length > 0) {
            const pomContent = await vscode.workspace.openTextDocument(pomFiles[0]);
            if (pomContent.getText().includes('<projectType>integration-project</projectType>')) {
                isProject = true;
                log("MI project detected");
            }
        }

        // If not found, check for .project files
        if (!isProject) {
            const projectFiles = await vscode.workspace.findFiles('.project', '**/node_modules/**', 1);
            if (projectFiles.length > 0) {
                const projectContent = await vscode.workspace.openTextDocument(projectFiles[0]);
                if (projectContent.getText().includes('<nature>org.wso2.developerstudio.eclipse.mavenmultimodule.project.nature</nature>')) {
                    isOldProject = true;
                    log("Integration Studio project detected");
                }
            }
        }
    } catch (err) {
        console.error(err);
        throw err; // Rethrow the error to ensure the error handling flow is not broken
    }

    if (isProject) {
        // Check if the project is empty
        const files = await vscode.workspace.findFiles('src/main/wso2mi/artifacts/*/*.xml', '**/node_modules/**', 1);
        if (files.length === 0) {
            emptyProject = true;
        }

        projectUri = vscode.workspace.workspaceFolders![0].uri.fsPath;
        vscode.commands.executeCommand('setContext', 'MI.status', 'projectDetected');
        vscode.commands.executeCommand('setContext', 'MI.projectType', 'miProject'); // for command enablements
        await extension.context.workspaceState.update('projectType', 'miProject');
    } else if (isOldProject) {
        projectUri = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const displayState: boolean | undefined = extension.context.workspaceState.get('displayOverview');
        displayOverview = displayState === undefined ? true : displayState;
        vscode.commands.executeCommand('setContext', 'MI.status', 'projectDetected');
        vscode.commands.executeCommand('setContext', 'MI.projectType', 'oldProject'); // for command enablements
        await extension.context.workspaceState.update('projectType', 'oldProject');
    } else {
        vscode.commands.executeCommand('setContext', 'MI.status', 'unknownProject');
    }

    if (projectUri) {
        // Log project path
        log(`Current workspace path: ${projectUri}`);
    }

    // Register Project Creation command in any of the above cases
    vscode.commands.registerCommand(COMMANDS.CREATE_PROJECT_COMMAND, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ProjectCreationForm });
        console.log('Create New Project');
        log('Create New Project');
    });

    return {
        isProject,
        isOldProject,
        displayOverview,
        projectUri, // Return the path of the detected project
        emptyProject
    };
}
