import { CommandResponse, DiagramDiagnostic, DIAGRAM_MODIFIED, FunctionDef, getImportStatements, InsertorDelete, LowcodeEvent, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode, traversNode } from "@wso2-enterprise/syntax-tree";
import { monaco } from "react-monaco-editor";
import { STFindingVisitor } from "../../Diagram/visitors/st-finder-visitor";
import { getSymbolInfo } from "../../Diagram/visitors/symbol-finder-visitor";
import { getFunctionSyntaxTree, getLowcodeST, isDeleteModificationAvailable, isUnresolvedModulesAvailable } from "../../DiagramGenerator/generatorUtil";
import { EditorProps, PALETTE_COMMANDS } from "../../DiagramGenerator/vscode/Diagram";
import { DEFAULT_MODULE_NAME } from "../../OverviewDiagram";
import { ComponentViewInfo } from "../../OverviewDiagram/util";
import { LowCodeEditorProps, MESSAGE_TYPE } from "../../types";
import { DiagramFocusState } from "../hooks/diagram-focus";

export function getDiagramProviderProps(
    focusedST: STNode,
    lowCodeEnvInstance: string,
    currentFileContent: string,
    diagramFocusState: DiagramFocusState,
    completeST: STNode,
    lowCodeResourcesVersion: any,
    balVersion: string,
    props: EditorProps,
    setFocusedST: React.Dispatch<React.SetStateAction<STNode>>,
    setCompleteST: React.Dispatch<React.SetStateAction<STNode>>,
): LowCodeEditorProps {
    const { langClientPromise, resolveMissingDependency, runCommand, experimentalEnabled,
            getLibrariesData, getLibrariesList, getLibraryData } = props;


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
    return {
        syntaxTree: focusedST,
        environment: lowCodeEnvInstance,
        stSymbolInfo: getSymbolInfo(),
        currentFile: {
            content: currentFileContent,
            path: diagramFocusState?.filePath,
            size: 1,
        },
        importStatements: getImportStatements(completeST),
        experimentalEnabled,
        lowCodeResourcesVersion,
        ballerinaVersion: balVersion,
        api: {
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
        },
        originalSyntaxTree: undefined,
        langServerURL: "",
        configOverlayFormStatus: undefined,
        configPanelStatus: undefined,
        isCodeEditorActive: false,
        isPerformanceViewOpen: false,
        isLoadingSuccess: false,
        isWaitingOnWorkspace: false,
        isMutationProgress: false,
        isCodeChangeInProgress: false,
        zoomStatus: undefined,
        isReadOnly: false
    };
}
