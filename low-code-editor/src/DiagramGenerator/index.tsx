import * as React from "react";
import { IntlProvider } from "react-intl";

import { FunctionDefinition, ModulePart, NodePosition, STKindChecker, STNode } from "@ballerina/syntax-tree";
import Grid from "@material-ui/core/Grid";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { StringValueNode } from "graphql";
import cloneDeep from "lodash.clonedeep";

import LowCodeEditor, { BlockViewState, getSymbolInfo, InsertorDelete } from "..";
import { AiSuggestionsReq, ModelCodePosition, OauthProviderConfig } from "../api/models";
import "../assets/fonts/Glimer/glimer.css";
import { WizardType } from "../ConfigurationSpec/types";
import { Connector, ExpressionEditorLangClientInterface, STModification, STSymbolInfo } from "../Definitions";
import { DiagramEditorLangClientInterface } from "../Definitions/diagram-editor-lang-client-interface";
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
                const vistedSyntaxTree: STNode = getLowcodeST(genSyntaxTree);
                if (!vistedSyntaxTree) {
                    return (<div><h1>Parse error...!</h1></div>);
                }
                setSyntaxTree(vistedSyntaxTree);
                const content = await props.getFileContent(filePath);
                setFileContent(content);
            } catch (err) {
                throw err;
            }
        })();
    }, [lastUpdatedAt]);


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
                                tour: {
                                    goToNextTourStep: (step: string) => undefined,
                                },
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
                                    trackTriggerSelection: (trigger: string) => undefined,
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
                                            const vistedSyntaxTree: STNode = getLowcodeST(newST);
                                            setSyntaxTree(vistedSyntaxTree);
                                            setFileContent(source);
                                            props.updateFileContent(filePath, source);
                                        } else {
                                            // TODO show error
                                        }

                                    },
                                    onMutate: (type: string, options: any) => undefined,
                                    modifyTrigger: (
                                        triggerType: TriggerType,
                                        model?: any,
                                        configObject?: any
                                    ) => undefined,
                                    dispatchCodeChangeCommit: () => Promise.resolve(),
                                    dispatchFileChange: (content: string, callback?: () => undefined) => Promise.resolve(),
                                    hasConfigurables: (templateST: ModulePart) => false,
                                    setCodeLocationToHighlight: (position: ModelCodePosition) => undefined,
                                    gotoSource: (position: { startLine: number, startColumn: number }) => {
                                        props.gotoSource(filePath, position);
                                    }
                                },
                                connections: {
                                    createManualConnection: (orgHandle: string, displayName: string, connectorName: string,
                                                             userAccountIdentifier: string,
                                                             tokens: { name: string; value: string }[],
                                                             selectedType: string) => {
                                                             return {} as any;
                                    },
                                    updateManualConnection: (activeConnectionId: string, orgHandle: string, displayName: string, connectorName: string,
                                                             userAccountIdentifier: string, tokens: { name: string; value: string }[],
                                                             type?: string, activeConnectionHandler?: string) => {
                                        return {} as any;
                                    },
                                    getAllConnections: (
                                        orgHandle: string,
                                        connector?: string
                                    ) => {
                                        return {} as any;
                                    },
                                },
                                ai: {
                                    getAiSuggestions: (params: AiSuggestionsReq) => {
                                        return {} as any;
                                    }
                                },
                                splitPanel: {
                                    maximize: (view: string, orientation: string, appId: number | string) => undefined,
                                    minimize: (view: string, orientation: string, appId: number | string) => undefined,
                                    setPrimaryRatio: (view: string, orientation: string, appId: number | string) => undefined,
                                    setSecondaryRatio: (view: string, orientation: string, appId: number | string) => undefined,
                                    handleRightPanelContent: (viewName: string) => undefined
                                },
                                data: {
                                    getGsheetList: (orgHandle: string, handler: string) => {
                                        return {} as any;
                                    },
                                    getGcalendarList: (orgHandle: string, handler: string) => {
                                        return {} as any;
                                    },
                                    getGithubRepoList: (orgHandle: string, handler: string, username: string) => {
                                        return {} as any;
                                    },
                                },
                                oauth: {
                                    oauthSessions: {},
                                    dispatchGetAllConfiguration: (orgHandle?: string) => {
                                        return {} as any;
                                    },
                                    dispatchFetchConnectionList: (connector: string, sessionId: string) => undefined,
                                    dispatchInitOauthSession: (sessionId: string, connector: string, oauthProviderConfig?: OauthProviderConfig) => undefined,
                                    dispatchResetOauthSession: (sessionId: string) => undefined,
                                    dispatchTimeoutOauthRequest: (sessionId: string) => undefined,
                                    dispatchDeleteOauthSession: (sessionId: string) => undefined,
                                    oauthProviderConfigs: {} as any,
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

