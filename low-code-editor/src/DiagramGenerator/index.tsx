import * as React from "react";
import { IntlProvider } from "react-intl";
import { monaco } from "react-monaco-editor";

import { FunctionDefinition, ModulePart, NodePosition, STKindChecker, STNode } from "@ballerina/syntax-tree";
import { MuiThemeProvider } from "@material-ui/core/styles";
import cloneDeep from "lodash.clonedeep";

import LowCodeEditor, { BlockViewState, getSymbolInfo, InsertorDelete } from "..";
import "../assets/fonts/Glimer/glimer.css";
import { WizardType } from "../ConfigurationSpec/types";
import { Connector, STModification, STSymbolInfo } from "../Definitions";
import { ConditionConfig } from "../Diagram/components/Portals/ConfigForm/types";
import { LowcodeEvent, TriggerType } from "../Diagram/models";
import messages from '../lang/en.json';
import { CirclePreloader } from "../PreLoader/CirclePreloader";

import { DiagramGenErrorBoundary } from "./ErrorBoundrary";
import { getDefaultSelectedPosition, getLowcodeST, getSyntaxTree } from "./generatorUtil";
import { useGeneratorStyles } from "./styles";
import { theme } from "./theme";
import { EditorProps } from "./vscode/Diagram";
export interface DiagramGeneratorProps extends EditorProps {
    scale: string;
    panX: string;
    panY: string;
}

const ZOOM_STEP = 0.1;
const MAX_ZOOM = 2;
const MIN_ZOOM = 0.6;
const undoStack: Map<string, string[]> = new Map();
const redoStack: Map<string, string[]> = new Map();
let currentFileContent = "";
let currentFilePath = "";

export function DiagramGenerator(props: DiagramGeneratorProps) {
    const { langClient, filePath, startLine, startColumn, lastUpdatedAt, scale, panX, panY } = props;
    const classes = useGeneratorStyles();
    const defaultScale = scale ? Number(scale) : 1;
    const defaultPanX = panX ? Number(panX) : 0;
    const defaultPanY = panY ? Number(panY) : 0;

    const defaultZoomStatus = {
        scale: defaultScale,
        panX: defaultPanX,
        panY: defaultPanY,
    };

    const [syntaxTree, setSyntaxTree] = React.useState(undefined);
    const [zoomStatus, setZoomStatus] = React.useState(defaultZoomStatus);
    const [fileContent, setFileContent] = React.useState("");

    React.useEffect(() => {
        (async () => {
            try {
                const genSyntaxTree = await getSyntaxTree(filePath, langClient);
                const pfSession = await props.getPFSession();
                const vistedSyntaxTree: STNode = await getLowcodeST(genSyntaxTree, filePath,
                    langClient, pfSession,
                    props.showPerformanceGraph, props.showMessage);
                if (!vistedSyntaxTree) {
                    return (<div><h1>Parse error...!</h1></div>);
                }
                setSyntaxTree(vistedSyntaxTree);
                const content = await props.getFileContent(filePath);
                setFileContent(content);
                currentFilePath = filePath;
                currentFileContent = content;
            } catch (err) {
                throw err;
            }
        })();
    }, [lastUpdatedAt]);

    React.useEffect(() => {
        const keyPress = (e: any) => {
            const evtobj = e;
            if (evtobj.keyCode === 90 && (evtobj.ctrlKey || evtobj.metaKey)) {
                undo();
            } else if (evtobj.keyCode === 89 && (evtobj.ctrlKey || evtobj.metaKey)) {
                redo();
            }
        }
        document.onkeydown = keyPress;
        return () => {
            document.onkeydown = undefined;
        };
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

    const undo = async () => {
        if (undoStack.get(currentFilePath)?.length) {
            const uri = monaco.Uri.file(currentFilePath).toString();

            const redoSourceStack = redoStack.get(currentFilePath);
            if (!redoSourceStack) {
                redoStack.set(currentFilePath, [currentFileContent]);
            } else {
                redoSourceStack.push(currentFileContent);
                if (redoSourceStack.length >= 100) {
                    redoSourceStack.shift();
                }
                redoStack.set(currentFilePath, redoSourceStack);
            }
            const lastsource = undoStack.get(currentFilePath).pop();

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
<<<<<<< HEAD
            const genSyntaxTree = await getSyntaxTree(filePath, langClient);
            const pfSession = await props.getPFSession();
            const vistedSyntaxTree: STNode = await getLowcodeST(genSyntaxTree, filePath,
                                                                langClient, pfSession,
                                                                props.showPerformanceGraph, props.showMessage);
=======
            const genSyntaxTree = await getSyntaxTree(currentFilePath, langClient);
            const vistedSyntaxTree: STNode = getLowcodeST(genSyntaxTree);
>>>>>>> 6eddd6a3... Add variable for path and content change
            setSyntaxTree(vistedSyntaxTree);
            setFileContent(lastsource);
            currentFileContent = lastsource;
            props.updateFileContent(currentFilePath, lastsource);
        }
    }

    const redo = async () => {
        if (redoStack.get(currentFilePath)?.length) {
            const uri = monaco.Uri.file(currentFilePath).toString();

            const undoSourceStack = undoStack.get(currentFilePath);
            undoSourceStack.push(currentFileContent);
            if (undoSourceStack.length >= 100) {
                undoSourceStack.shift();
            }
            undoStack.set(currentFilePath, undoSourceStack);

            const lastUndoSource = redoStack.get(currentFilePath).pop();

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
<<<<<<< HEAD
            const genSyntaxTree = await getSyntaxTree(filePath, langClient);
            const pfSession = await props.getPFSession();
            const vistedSyntaxTree: STNode = await getLowcodeST(genSyntaxTree, filePath,
                langClient, pfSession,
                props.showPerformanceGraph, props.showMessage);
=======
            const genSyntaxTree = await getSyntaxTree(currentFilePath, langClient);
            const vistedSyntaxTree: STNode = getLowcodeST(genSyntaxTree);
>>>>>>> 6eddd6a3... Add variable for path and content change
            setSyntaxTree(vistedSyntaxTree);
            setFileContent(lastUndoSource);
            currentFileContent = lastUndoSource;
            props.updateFileContent(currentFilePath, lastUndoSource);
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

    const selectedPosition = startColumn === 0 && startLine === 0 // TODO: change to use undefined for unselection
        ? getDefaultSelectedPosition(syntaxTree)
        : {
            startLine,
            startColumn
        }
    return (
        <MuiThemeProvider theme={theme}>
            <div className={classes.lowCodeContainer}>
                <IntlProvider locale='en' defaultLocale='en' messages={messages}>
                    <DiagramGenErrorBoundary>
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
                                    getDiagramEditorLangClient: (url: string) => {
                                        return Promise.resolve(langClient);
                                    },
                                    getExpressionEditorLangClient: (url: string) => {
                                        return Promise.resolve(langClient);
                                    }
                                },
                                insights: {
                                    onEvent: (event: LowcodeEvent) => undefined,
                                },
                                code: {
                                    modifyDiagram: async (mutations: STModification[], options?: any) => {
                                        const { parseSuccess, source, syntaxTree: newST } = await langClient.stModify({
                                            astModifications: await InsertorDelete(mutations),
                                            documentIdentifier: {
                                                uri: `file://${filePath}`
                                            }
                                        });
                                        if (parseSuccess) {
                                            const sourcestack = undoStack.get(filePath);
                                            if (!sourcestack) {
                                                undoStack.set(filePath, [fileContent]);
                                            } else {
                                                sourcestack.push(fileContent);
                                                if (sourcestack.length >= 100) {
                                                    sourcestack.shift();
                                                }
                                                undoStack.set(filePath, sourcestack);
                                            }
                                            const pfSession = await props.getPFSession();
                                            const vistedSyntaxTree: STNode = await getLowcodeST(newST, filePath,
                                                                                                langClient, pfSession,
                                                                                                props.showPerformanceGraph, props.showMessage);
                                            setSyntaxTree(vistedSyntaxTree);
                                            setFileContent(source);
                                            currentFileContent = source;
                                            props.updateFileContent(filePath, source);
                                        } else {
                                            // TODO show error
                                        }

                                    },
                                    onMutate: (type: string, options: any) => undefined,
                                    setCodeLocationToHighlight: (position: NodePosition) => undefined,
                                    gotoSource: (position: { startLine: number, startColumn: number }) => {
                                        props.gotoSource(filePath, position);
                                    }
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
                                    dispactchConfigOverlayForm: (type: string, targetPosition: NodePosition,
                                                                 wizardType: WizardType, blockViewState?: BlockViewState, config?: ConditionConfig,
                                                                 symbolInfo?: STSymbolInfo, model?: STNode) => undefined,
                                    closeConfigOverlayForm: () => undefined,
                                    configOverlayFormPrepareStart: () => undefined,
                                    closeConfigPanel: () => undefined,
                                }
                            }}
                        />
                    </DiagramGenErrorBoundary>
                </IntlProvider>
            </div>
        </MuiThemeProvider>
    );
}

