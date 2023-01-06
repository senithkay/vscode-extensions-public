/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React, { useEffect, useState } from "react";

import { STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { Provider as ViewManagerProvider } from "../Contexts/Diagram";
import { STFindingVisitor } from "../Diagram/visitors/st-finder-visitor";
import { getSymbolInfo } from "../Diagram/visitors/symbol-finder-visitor";
import {
    getFunctionSyntaxTree,
    getLowcodeST,
    getSyntaxTree,
    isDeleteModificationAvailable,
    isUnresolvedModulesAvailable
} from "../DiagramGenerator/generatorUtil";
import { EditorProps, PALETTE_COMMANDS } from "../DiagramGenerator/vscode/Diagram";
import { OverviewDiagram } from "../OverviewDiagram";
import { LowCodeEditorProps, MESSAGE_TYPE, SelectedPosition } from "../types";

import { DiagramFocusActionTypes, useDiagramFocus } from "./hooks/diagram-focus";
import { NavigationBar } from "./NavigationBar";
import {
    CommandResponse,
    ComponentInfo,
    DiagramDiagnostic,
    DIAGRAM_MODIFIED,
    FunctionDef,
    getImportStatements,
    InsertorDelete,
    LineRange,
    LowcodeEvent,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { monaco } from "react-monaco-editor";
import { getLibrariesList, getLibrariesData, getLibraryData } from "../stories/story-utils";
import { Diagram } from "../Diagram";
import { ComponentViewInfo } from "../OverviewDiagram/util";
import { IntlProvider } from "react-intl";
import messages from '../lang/en.json';


/**
 * Handles the rendering of the Diagram views(lowcode, datamapper, service etc.)
 */
export function DiagramViewManager(props: EditorProps) {
    // ViewManager behavior:
    //  - should be able to handle switching to lowcode whatever the mode user interacts in
    //      - user can open a lowcode element by selecting a component from the component overview
    //      - user can open a lowcode element by clicking on the code lense in the code editor
    //      - if it's the code lense user will provide object with data specifying which file and which position
    //        through props(should alter the openInDiagram prop)
    //          structure:
    //              - filepath => string
    //              - position => NodePosition
    //      - if it is the through the view manager, a callback should be passed to that component notify the view
    //        manager to fetch the related syntax tree
    //
    // ToDo:
    //  - fetch syntaxtree for particular file
    //  - Handle switching between views based on type of the syntax tree fetched(datamapper, graphql, service designer)
    //  - Handle switching to code from standalone code segment
    //  - Implement top bar to handle navigation

    const {
        lastUpdatedAt,
        langClientPromise,
        experimentalEnabled,
        projectPaths,
        diagramFocus,
        getFileContent,
        getEnv,
        getBallerinaVersion,
        resolveMissingDependency,
        runCommand,
    } = props;

    const [diagramFocusState, diagramFocusSend] = useDiagramFocus();
    const [focusedST, setFocusedST] = useState<STNode>();
    const [completeST, setCompleteST] = useState<STNode>();
    const [lowCodeResourcesVersion, setLowCodeResourcesVersion] = React.useState(undefined);
    const [lowCodeEnvInstance, setLowCodeEnvInstance] = React.useState("");
    const [balVersion, setBalVersion] = React.useState("");
    const [currentFileContent, setCurrentFileContent] = useState<string>();


    async function showTryitView(serviceName: string) {
        runCommand(PALETTE_COMMANDS.TRY_IT, [diagramFocusState?.filePath, serviceName]);
    }

    async function showDocumentationView(url: string) {
        runCommand(PALETTE_COMMANDS.DOCUMENTATION_VIEW, [url]);
    }

    async function run(args: any[]) {
        runCommand(PALETTE_COMMANDS.RUN, args);
    }

    const showMessage: (message: string, type: MESSAGE_TYPE, isIgnorable: boolean, filePath?: string, fileContent?: string, bypassChecks?: boolean) => Promise<boolean> = props.showMessage;
    const runBackgroundTerminalCommand: (command: string) => Promise<CommandResponse> = props.runBackgroundTerminalCommand;
    const openExternalUrl: (url: string) => Promise<boolean> = props.openExternalUrl;

    React.useEffect(() => {
        (async () => {
            const version: string = await getBallerinaVersion();
            setBalVersion(version);
            // const isCodeServerInstance: string = await getEnv("CODE_SERVER_ENV");
            // setCodeServer(isCodeServerInstance === "true");
            // const sentryConfig: SentryConfig = await getSentryConfig();
            // if (sentryConfig) {
            //     init(sentryConfig);
            // }
        })();
    }, []);

    useEffect(() => {
        if (diagramFocusState) {
            const { filePath, position } = diagramFocusState;

            console.log('>>> useEffect', diagramFocusState);

            (async () => {
                try {
                    const langClient = await langClientPromise;
                    const generatedST = await getSyntaxTree(filePath, langClient);
                    const visitedST = await getLowcodeST(generatedST, filePath, langClient, experimentalEnabled);

                    const content = await getFileContent(filePath);
                    const resourceVersion = await getEnv("BALLERINA_LOW_CODE_RESOURCES_VERSION");
                    const envInstance = await getEnv("VSCODE_CHOREO_SENTRY_ENV");

                    const stFindingVisitor = new STFindingVisitor();
                    stFindingVisitor.setPosition(position);
                    traversNode(visitedST, stFindingVisitor);

                    // TODO: add performance data fetching logic here

                    setFocusedST(stFindingVisitor.getSTNode());
                    setCompleteST(visitedST);
                    setCurrentFileContent(content);
                    setLowCodeResourcesVersion(resourceVersion);
                    setLowCodeEnvInstance(envInstance);
                } catch (err) {
                    // tslint:disable-next-line: no-console
                    console.error(err);
                }
            })();
        }
    }, [lastUpdatedAt, diagramFocusState]);

    useEffect(() => {
        diagramFocusSend({ type: DiagramFocusActionTypes.UPDATE_STATE, payload: diagramFocus });
    }, [diagramFocus])

    const updateSelectedComponent = (componentDetails: ComponentViewInfo) => {
        console.log('componentSelected >>>', componentDetails);
        const { filePath, folderPath, startLine, startColumn, endLine, endColumn } = componentDetails;

        diagramFocusSend({
            type: DiagramFocusActionTypes.UPDATE_STATE,
            payload: {
                filePath: `${folderPath}${filePath}`.replace('file://', ''),
                position: {
                    startLine,
                    startColumn,
                    endLine,
                    endColumn
                }
            }
        });
    }

    const isOverviewDiagramVisible = !diagramFocusState;
    const isDiagramShown = !!diagramFocusState && !!focusedST;

    return (
        <div>

            <IntlProvider locale='en' defaultLocale='en' messages={messages}>
                <ViewManagerProvider
                    isReadOnly={false}
                    syntaxTree={focusedST}
                    environment={lowCodeEnvInstance}
                    stSymbolInfo={getSymbolInfo()}
                    // tslint:disable-next-line: jsx-no-multiline-js
                    currentFile={{
                        content: currentFileContent,
                        path: diagramFocusState?.filePath,
                        size: 1,
                    }}
                    importStatements={getImportStatements(completeST)}
                    experimentalEnabled={experimentalEnabled}
                    lowCodeResourcesVersion={lowCodeResourcesVersion}
                    ballerinaVersion={balVersion}
                    // tslint:disable-next-line: jsx-no-multiline-js
                    api={{
                        ls: {
                            getDiagramEditorLangClient: () => {
                                return langClientPromise;
                            },
                            getExpressionEditorLangClient: () => {
                                return langClientPromise as any;
                            }
                        },
                        insights: {
                            onEvent: (event: LowcodeEvent) => {
                                props.sendTelemetryEvent(event);
                            }
                        },
                        code: {
                            modifyDiagram: async (mutations: STModification[]) => {
                                const langClient = await langClientPromise;
                                const uri = monaco.Uri.file(diagramFocusState?.filePath).toString();
                                const { parseSuccess, source, syntaxTree: newST } = await langClient.stModify({
                                    astModifications: await InsertorDelete(mutations),
                                    documentIdentifier: {
                                        uri
                                    }
                                });
                                let visitedST: STNode;
                                if (parseSuccess) {
                                    // undoRedo.addModification(source);
                                    // setFileContent(source);
                                    props.updateFileContent(diagramFocusState?.filePath, source);
                                    visitedST = await getLowcodeST(newST, diagramFocusState?.filePath, langClient, experimentalEnabled, showMessage);
                                    const stFindingVisitor = new STFindingVisitor();
                                    stFindingVisitor.setPosition(diagramFocusState?.position);
                                    traversNode(visitedST, stFindingVisitor);

                                    // TODO: add performance data fetching logic here
                                    setFocusedST(stFindingVisitor.getSTNode());
                                    setCompleteST(visitedST);
                                    if (isDeleteModificationAvailable(mutations)) {
                                        showMessage("Undo your changes by using Ctrl + Z or Cmd + Z", MESSAGE_TYPE.INFO, true);
                                    }
                                    if (newST?.typeData?.diagnostics && newST?.typeData?.diagnostics?.length > 0) {
                                        const { isAvailable } = isUnresolvedModulesAvailable(newST?.typeData?.diagnostics as DiagramDiagnostic[]);
                                        if (isAvailable) {
                                            // setModulePullInProgress(true);
                                            // setLoaderText('Pulling packages...');
                                            const {
                                                parseSuccess: pullSuccess,
                                            } = await resolveMissingDependency(diagramFocusState?.filePath, source);
                                            if (pullSuccess) {
                                                // Rebuild the file At backend
                                                langClient.didChange({
                                                    textDocument: { uri, version: 1 },
                                                    contentChanges: [
                                                        {
                                                            text: source
                                                        }
                                                    ],
                                                });
                                                const {
                                                    syntaxTree: stWithoutDiagnostics
                                                } = await langClient.getSyntaxTree({ documentIdentifier: { uri } });
                                                visitedST = await getLowcodeST(
                                                    stWithoutDiagnostics,
                                                    diagramFocusState?.filePath,
                                                    langClient,
                                                    experimentalEnabled,
                                                    showMessage);
                                                setCompleteST(visitedST);
                                            }
                                            // setModulePullInProgress(false);
                                        }
                                    }

                                    // let newActivePosition: SelectedPosition = { ...selectedPosition };
                                    // for (const mutation of mutations) {
                                    //     if (mutation.type.toLowerCase() !== "import" && mutation.type.toLowerCase() !== "delete") {
                                    //         newActivePosition = getSelectedPosition(visitedST as ModulePart, mutation.startLine, mutation.startColumn);
                                    //         break;
                                    //     }
                                    // }
                                    // setSelectedPosition(newActivePosition.startColumn === 0 && newActivePosition.startLine === 0 && visitedST
                                    //     ? getDefaultSelectedPosition(visitedST as ModulePart)
                                    //     : newActivePosition);
                                } else {
                                    // TODO show error
                                }
                                // setMutationInProgress(false);
                                if (mutations.length > 0) {
                                    const event: LowcodeEvent = {
                                        type: DIAGRAM_MODIFIED,
                                        name: `${mutations[0].type}`
                                    };
                                    props.sendTelemetryEvent(event);
                                }
                                // TODO: Add perf data
                                // await addPerfData(visitedST);
                            },
                            gotoSource: (position: { startLine: number; startColumn: number; }) => {
                                props.gotoSource(diagramFocusState?.filePath, position);
                            },
                            getFunctionDef: async (lineRange: Range, defFilePath?: string) => {
                                const langClient = await langClientPromise;
                                // setMutationInProgress(true);
                                // setLoaderText('Fetching...');
                                const res: FunctionDef = await getFunctionSyntaxTree(
                                    defFilePath ? defFilePath : monaco.Uri.file(diagramFocusState?.filePath).toString(),
                                    lineRange,
                                    langClient
                                );
                                // setMutationInProgress(false);
                                return res;
                            },
                            updateFileContent: (content: string, skipForceSave?: boolean) => {
                                return props.updateFileContent(diagramFocusState?.filePath, content, skipForceSave);
                            },
                            // undo,
                            // isMutationInProgress,
                            // isModulePullInProgress,
                            // loaderText
                        },
                        // FIXME Doesn't make sense to take these methods below from outside
                        // Move these inside and get an external API for pref persistance
                        // against a unique ID (eg AppID) for rerender from prev state
                        // panNZoom: {
                        //     pan,
                        //     fitToScreen,
                        //     zoomIn,
                        //     zoomOut
                        // },
                        webView: {
                            showTryitView,
                            showDocumentationView
                        },
                        project: {
                            run
                        },
                        library: {
                            getLibrariesList,
                            getLibrariesData,
                            getLibraryData
                        },
                        runBackgroundTerminalCommand,
                        openExternalUrl
                    }}
                    originalSyntaxTree={undefined}
                    langServerURL={""}
                    configOverlayFormStatus={undefined}
                    configPanelStatus={undefined}
                    isCodeEditorActive={false}
                    isPerformanceViewOpen={false}
                    isLoadingSuccess={false}
                    isWaitingOnWorkspace={false}
                    isMutationProgress={false}
                    isCodeChangeInProgress={false}
                    zoomStatus={undefined}
                >
                    <NavigationBar />
                    {
                        isOverviewDiagramVisible && (
                            <OverviewDiagram
                                lastUpdatedAt={lastUpdatedAt}
                                projectPaths={projectPaths}
                                notifyComponentSelection={updateSelectedComponent}
                            />
                        )
                    }
                    {isDiagramShown && <Diagram />}
                </ViewManagerProvider>
            </IntlProvider>
        </div>
    )
}

// function getContextProviderProps(props: EditorProps,): LowCodeEditorProps {
//     // const {} = props;
//     // return {

//     // }
//     const { } = props;
//     return {
//         isReadOnly: false,
//     }
//     throw new Error("Function not implemented.");
// }

