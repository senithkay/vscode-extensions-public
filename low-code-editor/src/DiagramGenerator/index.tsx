import * as React from "react";
import { IntlProvider } from "react-intl";
import { monaco } from "react-monaco-editor";

import { MuiThemeProvider } from "@material-ui/core/styles";
import { Connector, DiagramDiagnostic, DiagramEditorLangClientInterface, STModification, STSymbolInfo, WizardType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, ModulePart, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import cloneDeep from "lodash.clonedeep";
import Mousetrap from 'mousetrap';

import LowCodeEditor, { BlockViewState, getSymbolInfo, InsertorDelete } from "..";
import "../assets/fonts/Glimer/glimer.css";
import { ConditionConfig } from "../Diagram/components/FormComponents/Types";
import { UndoRedoManager } from "../Diagram/components/FormComponents/UndoRedoManager";
import { DIAGRAM_MODIFIED, LowcodeEvent } from "../Diagram/models";
import messages from '../lang/en.json';
import { CirclePreloader } from "../PreLoader/CirclePreloader";
import { MESSAGE_TYPE } from "../types";

import { DiagramGenErrorBoundary } from "./ErrorBoundrary";
import {
    getDefaultSelectedPosition, getLowcodeST, getSyntaxTree, isDeleteModificationAvailable,
    isUnresolvedModulesAvailable
} from "./generatorUtil";
import { addPerformanceData } from "./performanceUtil";
import { useGeneratorStyles } from "./styles";
import { theme } from "./theme";
import { EditorProps, PALETTE_COMMANDS } from "./vscode/Diagram";
export interface DiagramGeneratorProps extends EditorProps {
    scale: string;
    panX: string;
    panY: string;
}

const ZOOM_STEP = 0.1;
const MAX_ZOOM = 2;
const MIN_ZOOM = 0.6;
const undoRedo = new UndoRedoManager();
const debounceTime: number = 5000;
let lastPerfUpdate = 0;

export function DiagramGenerator(props: DiagramGeneratorProps) {
    const { langClientPromise, filePath, startLine, startColumn, lastUpdatedAt, scale, panX, panY, resolveMissingDependency, experimentalEnabled } = props;
    const classes = useGeneratorStyles();
    const defaultScale = scale ? Number(scale) : 1;
    const defaultPanX = panX ? Number(panX) : 0;
    const defaultPanY = panY ? Number(panY) : 0;
    const runCommand: (command: PALETTE_COMMANDS, args: any[]) => Promise<boolean> = props.runCommand;
    const showMessage: (message: string, type: MESSAGE_TYPE, isIgnorable: boolean) => Promise<boolean> = props.showMessage;

    const defaultZoomStatus = {
        scale: defaultScale,
        panX: defaultPanX,
        panY: defaultPanY,
    };

    const [syntaxTree, setSyntaxTree] = React.useState(undefined);
    const [zoomStatus, setZoomStatus] = React.useState(defaultZoomStatus);
    const [fileContent, setFileContent] = React.useState("");
    const [isMutationInProgress, setMutationInProgress] = React.useState<boolean>(false);
    const [isModulePullInProgress, setModulePullInProgress] = React.useState<boolean>(false);
    const [loaderText, setLoaderText] = React.useState<string>('Loading...');
    const [performanceData, setPerformanceData] = React.useState(undefined);

    React.useEffect(() => {
        (async () => {
            try {
                const langClient = await langClientPromise;
                const genSyntaxTree: ModulePart = await getSyntaxTree(filePath, langClient);
                const content = await props.getFileContent(filePath);
                // if (genSyntaxTree?.typeData?.diagnostics && genSyntaxTree?.typeData?.diagnostics?.length > 0) {
                //     resolveMissingDependency(filePath, content);
                // }
                const vistedSyntaxTree: STNode = await getLowcodeST(genSyntaxTree, filePath, langClient);
                if (!vistedSyntaxTree) {
                    return (<div><h1>Parse error...!</h1></div>);
                }
                setSyntaxTree(vistedSyntaxTree);
                undoRedo.updateContent(filePath, content);
                setFileContent(content);

                // Add performance data
                await addPerfData(vistedSyntaxTree);

            } catch (err) {
                throw err;
            }
        })();
    }, [lastUpdatedAt]);

    React.useEffect(() => {
        Mousetrap.bind(['command+z', 'ctrl+z'], () => {
            undo();
            return false;
        });
        Mousetrap.bind(['command+shift+z', 'ctrl+y'], () => {
            redo();
            return false;
        });
    }, []);

    function zoomIn() {
        const newZoomStatus = cloneDeep(zoomStatus);
        newZoomStatus.scale = (zoomStatus.scale + ZOOM_STEP >= MAX_ZOOM) ? MAX_ZOOM : zoomStatus.scale + ZOOM_STEP;
        setZoomStatus(newZoomStatus);
    }

    function zoomOut() {
        const newZoomStatus = cloneDeep(zoomStatus);
        newZoomStatus.scale = (zoomStatus.scale - ZOOM_STEP <= MIN_ZOOM) ? MIN_ZOOM : zoomStatus.scale - ZOOM_STEP;
        setZoomStatus(newZoomStatus);
    }

    function fitToScreen() {
        setZoomStatus(defaultZoomStatus);
    }

    function pan(newPanX: number, newPanY: number) {
        const newZoomStatus = cloneDeep(zoomStatus);
        newZoomStatus.panX = newPanX;
        newZoomStatus.panY = newPanY;
        setZoomStatus(newZoomStatus);
    }

    async function showSwaggerView(serviceName: string) {
        runCommand(PALETTE_COMMANDS.SWAGGER_VIEW, [serviceName, filePath]);
    }

    async function showDocumentationView(url: string) {
        runCommand(PALETTE_COMMANDS.DOCUMENTATION_VIEW, [url]);
    }

    async function run(args: any[]) {
        runCommand(PALETTE_COMMANDS.RUN_WITH_CONFIGS, args);
    }

    const undo = async () => {
        const path = undoRedo.getFilePath();
        const uri = monaco.Uri.file(path).toString();
        const lastsource = undoRedo.undo();
        const langClient = await langClientPromise;
        if (lastsource) {
            langClient.didChange({
                contentChanges: [
                    {
                        text: lastsource
                    }
                ],
                textDocument: {
                    uri,
                    version: 1
                }
            });
            const genSyntaxTree = await getSyntaxTree(path, langClient);
            const vistedSyntaxTree: STNode = await getLowcodeST(genSyntaxTree, path,
                langClient);
            setSyntaxTree(vistedSyntaxTree);
            setFileContent(lastsource);
            props.updateFileContent(path, lastsource);

            await addPerfData(vistedSyntaxTree);

        }
    }

    const redo = async () => {
        const path = undoRedo.getFilePath();
        const uri = monaco.Uri.file(path).toString();
        const lastUndoSource = undoRedo.redo();
        const langClient = await langClientPromise;
        if (lastUndoSource) {
            langClient.didChange({
                contentChanges: [
                    {
                        text: lastUndoSource
                    }
                ],
                textDocument: {
                    uri,
                    version: 1
                }
            });
            const genSyntaxTree = await getSyntaxTree(path, langClient);
            const vistedSyntaxTree: STNode = await getLowcodeST(genSyntaxTree, path,
                langClient);
            setSyntaxTree(vistedSyntaxTree);
            setFileContent(lastUndoSource);
            props.updateFileContent(path, lastUndoSource);

            await addPerfData(vistedSyntaxTree);

        }
    }

    if (!syntaxTree) {
        return (<div className={classes.loaderContainer}><CirclePreloader position="relative" /></div>);
    }

    if (syntaxTree && STKindChecker.isFunctionDefinition(syntaxTree)) {
        const vst: FunctionDefinition = syntaxTree as FunctionDefinition;
        if (STKindChecker.isExternalFunctionBody(vst.functionBody)) {
            return (<div className={classes.errorMessageDialog}><h4>Sorry...! External Function Body is not supported yet.</h4></div>);
        }
    }

    // FIXME: Doing this to make main branch build pass so others can continue merging changes
    // on top of typed context
    const missingProps: any = {};

    const selectedPosition = startColumn === 0 && startLine === 0 ? // TODO: change to use undefined for unselection
        getDefaultSelectedPosition(syntaxTree)
        : { startLine, startColumn }

    return (
        <MuiThemeProvider theme={theme}>
            <div className={classes.lowCodeContainer}>
                <IntlProvider locale='en' defaultLocale='en' messages={messages}>
                    <DiagramGenErrorBoundary lastUpdatedAt={lastUpdatedAt}>
                        <LowCodeEditor
                            {...missingProps}
                            selectedPosition={selectedPosition}
                            isReadOnly={false}
                            syntaxTree={syntaxTree}
                            zoomStatus={zoomStatus}
                            stSymbolInfo={getSymbolInfo()}
                            // tslint:disable-next-line: jsx-no-multiline-js
                            currentFile={{
                                content: fileContent,
                                path: filePath,
                                size: 1,
                                type: "File"
                            }}
                            performanceData={performanceData}
                            experimentalEnabled={experimentalEnabled}
                            // tslint:disable-next-line: jsx-no-multiline-js
                            api={{
                                helpPanel: {
                                    openConnectorHelp: (connector?: Partial<Connector>, method?: string) => undefined,
                                },
                                notifications: {
                                    triggerErrorNotification: (msg: Error | string) => undefined,
                                    triggerSuccessNotification: (msg: Error | string) => undefined,
                                },
                                ls: {
                                    getDiagramEditorLangClient: () => {
                                        return langClientPromise;
                                    },
                                    getExpressionEditorLangClient: () => {
                                        return langClientPromise;
                                    }
                                },
                                insights: {
                                    onEvent: (event: LowcodeEvent) => {
                                        props.sendTelemetryEvent(event);
                                    }
                                },
                                code: {
                                    modifyDiagram: async (mutations: STModification[], options?: any) => {
                                        const langClient = await langClientPromise;
                                        setMutationInProgress(true);
                                        setLoaderText('Updating...');
                                        const { parseSuccess, source, syntaxTree: newST } = await langClient.stModify({
                                            astModifications: await InsertorDelete(mutations),
                                            documentIdentifier: {
                                                uri: monaco.Uri.file(filePath).toString()
                                            }
                                        });
                                        let vistedSyntaxTree: STNode;
                                        if (parseSuccess) {
                                            undoRedo.addModification(source);
                                            setFileContent(source);
                                            props.updateFileContent(filePath, source);
                                            vistedSyntaxTree = await getLowcodeST(newST, filePath,
                                                langClient);
                                            setSyntaxTree(vistedSyntaxTree);
                                            if (isDeleteModificationAvailable(mutations)) {
                                                showMessage("Undo your changes by using Ctrl + Z or Cmd + Z", MESSAGE_TYPE.INFO, true);
                                            }
                                            if (newST?.typeData?.diagnostics && newST?.typeData?.diagnostics?.length > 0) {
                                                const { isAvailable } = isUnresolvedModulesAvailable(newST?.typeData?.diagnostics as DiagramDiagnostic[]);
                                                if (isAvailable) {
                                                    setModulePullInProgress(true);
                                                    setLoaderText('Pulling packages...');
                                                    await resolveMissingDependency(filePath, source);
                                                    setModulePullInProgress(false);
                                                }
                                            }
                                        } else {
                                            // TODO show error
                                        }
                                        setMutationInProgress(false);
                                        if (mutations.length > 0) {
                                            const event: LowcodeEvent = {
                                                type: DIAGRAM_MODIFIED,
                                                name: `${mutations[0].type}`
                                            };
                                            props.sendTelemetryEvent(event);
                                        }
                                        await addPerfData(vistedSyntaxTree);
                                    },
                                    onMutate: (type: string, options: any) => undefined,
                                    setCodeLocationToHighlight: (position: NodePosition) => undefined,
                                    gotoSource: (position: { startLine: number, startColumn: number }) => {
                                        props.gotoSource(filePath, position);
                                    },
                                    isMutationInProgress,
                                    isModulePullInProgress,
                                    loaderText
                                },
                                // FIXME Doesn't make sense to take these methods below from outside
                                // Move these inside and get an external API for pref persistance
                                // against a unique ID (eg AppID) for rerender from prev state
                                panNZoom: {
                                    pan,
                                    fitToScreen,
                                    zoomIn,
                                    zoomOut
                                },
                                configPanel: {
                                    dispactchConfigOverlayForm: (type: string, targetPosition: NodePosition, wizardType: WizardType, blockViewState?: BlockViewState, config?: ConditionConfig, symbolInfo?: STSymbolInfo, model?: STNode) => undefined,
                                    closeConfigOverlayForm: () => undefined,
                                    configOverlayFormPrepareStart: () => undefined,
                                    closeConfigPanel: () => undefined,
                                },
                                webView: {
                                    showSwaggerView,
                                    showDocumentationView
                                },
                                project: {
                                    run
                                }
                            }}
                        />
                    </DiagramGenErrorBoundary>
                </IntlProvider>
            </div>
        </MuiThemeProvider>
    );

    async function addPerfData(vistedSyntaxTree: STNode) {
        const currentTime: number = Date.now();
        const langClient = await langClientPromise;
        if (currentTime - lastPerfUpdate > debounceTime) {
            const pfSession = await props.getPFSession();
            if (!pfSession) {
                return;
            }
            const perfData = await addPerformanceData(vistedSyntaxTree, filePath, langClient, pfSession, props.showPerformanceGraph, props.getPerfDataFromChoreo);
            setPerformanceData(perfData);
            lastPerfUpdate = currentTime;
        }
    }
}
