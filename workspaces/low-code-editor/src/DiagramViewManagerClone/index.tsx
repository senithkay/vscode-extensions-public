/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import React, { useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import { monaco } from "react-monaco-editor";

import { MuiThemeProvider } from "@material-ui/core";
import { BallerinaProjectComponents, ComponentViewInfo, FileListEntry, KeyboardNavigationManager } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { Provider as ViewManagerProvider } from "../Contexts/Diagram";
import { FindConstructByIndexVisitor } from "../Diagram/visitors/find-construct-by-index-visitor";
import { FindConstructByNameVisitor } from "../Diagram/visitors/find-construct-by-name-visitor";
import { FindNodeByUidVisitor } from "../Diagram/visitors/find-node-by-uid";
import { UIDGenerationVisitor } from "../Diagram/visitors/uid-generation-visitor";
import { getConstructBodyString } from "../Diagram/visitors/util";
import { getLowcodeST, getSyntaxTree } from "../DiagramGenerator/generatorUtil";
import { EditorProps, WorkspaceFolder } from "../DiagramGenerator/vscode/Diagram";
import messages from '../lang/en.json';
import { TextPreLoader } from "../PreLoader/TextPreLoader";

import { NavigationBar } from "./components/NavigationBar";
import { Provider as HistoryProvider } from './context/history';
import { useComponentHistory } from "./hooks/history";
import { useGeneratorStyles } from "./style";
import { theme } from './theme';
import { getDiagramProviderProps } from "./utils";
import { ComponentListView } from "./views";
import { DiagramView } from "./views/DiagramView";
import { UndoRedoManager } from "../Diagram/components/FormComponents/UndoRedoManager";

const undoRedoManager = new UndoRedoManager();

export function DiagramViewManager(props: EditorProps) {
    const {
        lastUpdatedAt,
        langClientPromise,
        experimentalEnabled,
        projectPaths,
        getFileContent,
        getEnv,
        getBallerinaVersion,
        workspaceName,
        diagramFocus
    } = props;

    const [
        history,
        historyPush,
        historyPop,
        historyClearAndPopulateWith,
        historySelect,
        historyClear,
        updateCurrentEntry
    ] = useComponentHistory();

    const classes = useGeneratorStyles();
    const [updatedTimeStamp, setUpdatedTimeStamp] = useState<string>();
    const [lowCodeResourcesVersion, setLowCodeResourcesVersion] = React.useState(undefined);
    const [lowCodeEnvInstance, setLowCodeEnvInstance] = React.useState("");
    const [balVersion, setBalVersion] = React.useState("");
    const [projectComponents, setProjectComponents] = React.useState<BallerinaProjectComponents>();
    const [fileList, setFileList] = React.useState([]);
    const [focusedST, setFocusedST] = useState<STNode>();
    const [completeST, setCompleteST] = useState<STNode>();
    const [currentFileContent, setCurrentFileContent] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const version: string = await getBallerinaVersion();
            setBalVersion(version);
        })();
    }, []);

    useEffect(() => {
        if (diagramFocus) {
            const { filePath, position } = diagramFocus;
            if (position) historyPush({ file: filePath, position });
            else historyPush({ file: filePath });
        }
    }, [diagramFocus]);

    useEffect(() => {
        setUpdatedTimeStamp(lastUpdatedAt);
    }, [lastUpdatedAt]);

    useEffect(() => {
        const mouseTrapClient = KeyboardNavigationManager.getClient();
        mouseTrapClient.bindNewKey(['command+z', 'ctrl+z'], async () => {
            // tslint:disable-next-line: no-console
            console.log("undo >>>");
            const lastsource = undoRedoManager.undo();
            if (lastsource) {
                console.log("undo >>>", lastsource);
                props.updateFileContent(history[history.length - 1].file, lastsource);
                setUpdatedTimeStamp(new Date().getTime().toString());
            }
        });

        mouseTrapClient.bindNewKey(['command+shift+z', 'ctrl+y'], async () => {
            // tslint:disable-next-line: no-console
            console.log("redo >>>");
            const lastsource = undoRedoManager.redo();
            if (lastsource) {
                console.log("redo >>>", lastsource);
                props.updateFileContent(history[history.length - 1].file, lastsource);
                setUpdatedTimeStamp(new Date().getTime().toString());
            }
        });

        return () => {
            mouseTrapClient.resetMouseTrapInstance();
        }
    }, [focusedST]);

    useEffect(() => {
        if (history.length > 0) {
            (async () => {
                setIsLoading(true);
                const { file, position, uid } = history[history.length - 1];
                const langClient = await langClientPromise;
                const componentResponse = await langClient.getBallerinaProjectComponents({
                    documentIdentifiers: [
                        {
                            uri: monaco.Uri.file(file).toString(),
                        }
                    ]
                });

                if (file.endsWith(".bal")) {
                    const generatedST = await getSyntaxTree(file, langClient);
                    const visitedST = await getLowcodeST(generatedST, file, langClient, experimentalEnabled);
                    const content = await getFileContent(file);
                    const resourceVersion = await getEnv("BALLERINA_LOW_CODE_RESOURCES_VERSION");
                    const envInstance = await getEnv("VSCODE_CHOREO_SENTRY_ENV");

                    let selectedST;

                    if (!uid && position) {
                        const uidGenVisitor = new UIDGenerationVisitor(position);
                        traversNode(visitedST, uidGenVisitor);
                        const generatedUid = uidGenVisitor.getUId();
                        const nodeFindingVisitor = new FindNodeByUidVisitor(generatedUid);
                        traversNode(visitedST, nodeFindingVisitor);
                        selectedST = nodeFindingVisitor.getNode();
                        updateCurrentEntry({ ...history[history.length - 1], uid: generatedUid });
                    }

                    if (uid && position) {
                        const nodeFindingVisitor = new FindNodeByUidVisitor(uid);
                        traversNode(visitedST, nodeFindingVisitor);

                        if (!nodeFindingVisitor.getNode()) {
                            const visitorToFindConstructByName = new FindConstructByNameVisitor(uid);
                            traversNode(visitedST, visitorToFindConstructByName);

                            if (visitorToFindConstructByName.getNode()) {
                                selectedST = visitorToFindConstructByName.getNode();

                                updateCurrentEntry({
                                    ...history[history.length - 1], uid: visitorToFindConstructByName.getUid()
                                });
                            } else {
                                const visitorToFindConstructByIndex =
                                    new FindConstructByIndexVisitor(uid, getConstructBodyString(focusedST));
                                traversNode(visitedST, visitorToFindConstructByIndex);
                                if (visitorToFindConstructByIndex.getNode()) {
                                    selectedST = visitorToFindConstructByIndex.getNode();

                                    updateCurrentEntry({
                                        ...history[history.length - 1], uid: visitorToFindConstructByIndex.getUid()
                                    });
                                } else {
                                    // TODO:  Add error message saying we can't find the construct
                                }
                            }

                        } else {
                            selectedST = nodeFindingVisitor.getNode();
                        }
                    }

                    if (selectedST && STKindChecker.isFunctionDefinition(selectedST)
                        && STKindChecker.isExpressionFunctionBody(selectedST.functionBody)) {
                        if (!history[history.length - 1].fromDataMapper) {
                            updateCurrentEntry({
                                ...history[history.length - 1],
                                fromDataMapper: true,
                                dataMapperDepth: 0,
                                name: selectedST.functionName.value
                            });
                        }
                    }

                    undoRedoManager.updateContent(file, content);
                    setFocusedST(selectedST);
                    setCompleteST(visitedST);
                    setCurrentFileContent(content);
                    setLowCodeResourcesVersion(resourceVersion);
                    setLowCodeEnvInstance(envInstance);
                } else {
                    setFocusedST(undefined);
                    setCompleteST(undefined);
                    setCurrentFileContent(undefined);
                }

                setProjectComponents(componentResponse);
                setIsLoading(false);
            })();
        }
    }, [history[history.length - 1], updatedTimeStamp]);

    useEffect(() => {
        // if (history.length > 0) {
        //     undoRedoManager.lear();
        // }
    }, [history[history.length - 1]?.file]);

    const updateActiveFile = (currentFile: FileListEntry) => {
        historyPush({ file: currentFile.uri.path });
    };

    const navigateUptoParent = (position: NodePosition): void => {
        const { file } = history[history.length - 1];
        historyPush({ file, position });
    }

    const updateSelectedComponent = (info: ComponentViewInfo): void => {
        const { filePath, position } = info;
        historyPush({ file: filePath, position });
    }

    const showOverviewMode: boolean = history.length > 0 && history[history.length - 1].file !== undefined
        && history[history.length - 1].position === undefined && !isLoading;
    const showSTMode: boolean = history.length > 0 && history[history.length - 1].file !== undefined
        && history[history.length - 1].position !== undefined && !!focusedST && !isLoading;


    const diagramProps = getDiagramProviderProps(
        focusedST,
        lowCodeEnvInstance,
        currentFileContent,
        history.length > 0 && history[history.length - 1].file,
        fileList,
        history.length > 0 && history[history.length - 1].uid,
        completeST,
        lowCodeResourcesVersion,
        balVersion,
        props,
        undoRedoManager,
        setFocusedST,
        setCompleteST,
        setCurrentFileContent,
        updateActiveFile,
        updateSelectedComponent,
        navigateUptoParent,
        setUpdatedTimeStamp
    );

    return (
        <MuiThemeProvider theme={theme}>
            <div className={classes.lowCodeContainer}>
                <IntlProvider locale='en' defaultLocale='en' messages={messages}>
                    <HistoryProvider
                        history={history}
                        historyPush={historyPush}
                        historyPop={historyPop}
                        historyClearAndPopulateWith={historyClearAndPopulateWith}
                        historySelect={historySelect}
                        historyReset={historyClear}
                        historyUpdateCurrentEntry={updateCurrentEntry}
                    >

                        <ViewManagerProvider
                            {...diagramProps}
                        >
                            <NavigationBar
                                workspaceName={workspaceName}
                                projectList={projectPaths}
                                projectInfo={projectComponents}
                            />
                            {!showOverviewMode && !showSTMode && <TextPreLoader position={'absolute'} />}
                            {showOverviewMode && <ComponentListView lastUpdatedAt={updatedTimeStamp} projectComponents={projectComponents} />}
                            {showSTMode && <DiagramView projectComponents={projectComponents} />}
                            <div id={'canvas-overlay'} className={"overlayContainer"} />
                        </ViewManagerProvider>
                    </HistoryProvider>
                </IntlProvider>
            </div>
        </MuiThemeProvider>
    )
}

