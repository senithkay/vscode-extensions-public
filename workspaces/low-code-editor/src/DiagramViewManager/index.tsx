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
import { IntlProvider } from "react-intl";

import { MuiThemeProvider } from "@material-ui/core";
import { NodePosition, STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { Provider as ViewManagerProvider } from "../Contexts/Diagram";
import { Diagram } from "../Diagram";
import { DataMapperOverlay } from "../Diagram/components/DataMapperOverlay";
import { GraphqlDiagramOverlay } from "../Diagram/components/GraphqlDiagramOverlay";
import { ServiceDesignOverlay } from "../Diagram/components/ServiceDesignOverlay";
import { FindNodeByUidVisitor } from "../Diagram/visitors/find-node-by-uid";
import { UIDGenerationVisitor } from "../Diagram/visitors/uid-generation-visitor";
import {
    getLowcodeST,
    getSyntaxTree
} from "../DiagramGenerator/generatorUtil";
import { EditorProps, FileListEntry, Uri, WorkspaceFolder } from "../DiagramGenerator/vscode/Diagram";
import messages from '../lang/en.json';
import { OverviewDiagram } from "../OverviewDiagram";
import { ComponentViewInfo } from "../OverviewDiagram/util";

import { Provider as HistoryProvider } from './context/history';
import { useComponentHistory } from "./hooks/history";
import { NavigationBar } from "./NavigationBar";
import { useGeneratorStyles } from './style';
import { theme } from "./theme";
import { getDiagramProviderProps } from "./utils";

interface DiagramFocusState {
    filePath: string;
    uid: string;
}

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
        workspaceName,
        getAllFiles
    } = props;
    const classes = useGeneratorStyles();

    const isWorkspace: boolean = projectPaths.length > 1;
    const [diagramFocusState, setDiagramFocuState] = useState<DiagramFocusState>();
    const [currentFileContent, setCurrentFileContent] = useState<string>();
    const [history, historyPush, historyPop, historyClear] = useComponentHistory();
    // const [folderName, setFolderName] = vte<string>();
    // const [filterMap, setFilterMap] = useState({});
    const [currentProject, setCurrentProject] = useState<WorkspaceFolder>();
    const [fileList, setFileList] = useState<FileListEntry[]>();
    const [focusFile, setFocusFile] = useState<FileListEntry>();
    const [focusUid, setFocusUid] = useState<string>();
    const [stMemberId, setStMemberId] = useState<string>();
    const [focusedST, setFocusedST] = useState<STNode>();
    const [lowCodeResourcesVersion, setLowCodeResourcesVersion] = React.useState(undefined);
    const [lowCodeEnvInstance, setLowCodeEnvInstance] = React.useState("");
    const [balVersion, setBalVersion] = React.useState("");
    const [completeST, setCompleteST] = useState<STNode>();

    useEffect(() => {
        if (currentProject) {
            (async () => {
                const response = await getAllFiles('**/*.bal');
                const fileListResponse: Uri[] = response.filter(fileUri => fileUri.path.includes(currentProject.uri.fsPath));
                const projectFiles: FileListEntry[] = fileListResponse.map(fileUri => ({
                    fileName: fileUri.path.replace(`${currentProject.uri.fsPath}/`, ''),
                    uri: fileUri
                }));
                setFileList(projectFiles);
                setFocusFile(undefined);
                setFocusedST(undefined);
            })();
        }
    }, [currentProject]);

    useEffect(() => {
        if (diagramFocus) {
            const { filePath, position } = diagramFocus;
            const currentProjectPath = projectPaths.find(projectPath => filePath.includes(projectPath.uri.fsPath));

            (async () => {
                const response = await getAllFiles('**/*.bal');
                const filteredFileList: Uri[] = response.filter(fileUri => fileUri.path.includes(currentProjectPath.uri.fsPath));
                const projectFiles: FileListEntry[] = filteredFileList.map(fileUri => ({
                    fileName: fileUri.path.replace(`${currentProjectPath.uri.fsPath}/`, ''),
                    uri: fileUri
                }));
                const currentFile = projectFiles.find(projectFile => projectFile.uri.path.includes(filePath));
                if (position) {
                    fetchST(filePath, { position });
                }
                setCurrentProject(currentProjectPath);
                setFileList(projectFiles);
                setFocusFile(currentFile);
            })();

        }
    }, [diagramFocus]);

    // useEffect(() => {
    //     setFocusUid(undefined);
    //     setFocusedST(undefined);
    // }, [focusFile]);

    // React.useEffect(() => {
    //     (async () => {
    //         const version: string = await getBallerinaVersion();
    //         setBalVersion(version);
    //         // const isCodeServerInstance: string = await getEnv("CODE_SERVER_ENV");
    //         // setCodeServer(isCodeServerInstance === "true");
    //         // const sentryConfig: SentryConfig = await getSentryConfig();
    //         // if (sentryConfig) {
    //         //     init(sentryConfig);
    //         // }
    //     })();
    // }, []);
    //
    // useEffect(() => {
    //     if (history.length > 0) {
    //         const {
    //             filePath, uid
    //         } = history[history.length - 1];
    //         // diagramFocusSend({
    //         //     type: DiagramFocusActionTypes.UPDATE_STATE, payload: {
    //         //         filePath,
    //         //         position
    //         //     }
    //         // })
    //         let dirName;
    //
    //         projectPaths.forEach(project => {
    //             if (projectPaths.length > 1 && filePath.includes(project.uri.fsPath)) {
    //                 dirName = project.name;
    //             }
    //         })
    //
    //         setFolderName(dirName);
    //         setDiagramFocuState({
    //             filePath,
    //             uid
    //         });
    //
    //     } else {
    //         // diagramFocusSend({ type: DiagramFocusActionTypes.RESET_STATE })
    //         setDiagramFocuState(undefined);
    //         setFolderName(undefined);
    //     }
    // }, [history[history.length - 1]]);
    //
    // useEffect(() => {
    //     projectPaths.forEach(path => {
    //         if (!filterMap[path.name]) {
    //             filterMap[path.name] = true;
    //         }
    //     })
    //     setFilterMap(filterMap);
    // }, [projectPaths]);

    // TODO: move to util file
    const fetchST = (filePath: string, options: { position?: NodePosition, uid?: string }) => {
        const { position, uid } = options;
        (async () => {
            try {
                const langClient = await langClientPromise;
                const generatedST = await getSyntaxTree(filePath, langClient);
                const visitedST = await getLowcodeST(generatedST, filePath, langClient, experimentalEnabled);
                const content = await getFileContent(filePath);
                const resourceVersion = await getEnv("BALLERINA_LOW_CODE_RESOURCES_VERSION");
                const envInstance = await getEnv("VSCODE_CHOREO_SENTRY_ENV");
                let selectedST;

                if (position) {
                    const uidGenVisitor = new UIDGenerationVisitor(position);
                    traversNode(visitedST, uidGenVisitor);
                    const generatedUid = uidGenVisitor.getUId();
                    const nodeFindingVisitor = new FindNodeByUidVisitor(generatedUid);
                    traversNode(visitedST, nodeFindingVisitor);
                    selectedST = nodeFindingVisitor.getNode();
                    setFocusUid(generatedUid);
                }

                if (uid) {
                    const nodeFindingVisitor = new FindNodeByUidVisitor(uid);
                    traversNode(visitedST, nodeFindingVisitor);
                    selectedST = nodeFindingVisitor.getNode();
                }

                setFocusedST(selectedST);
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

    useEffect(() => {
        if (!focusFile || !focusUid) return;
        fetchST(focusFile.uri.path, { uid: focusUid });
    }, [lastUpdatedAt]);
    //
    //
    // useEffect(() => {
    //     fetchST();
    // }, [diagramFocusState]);
    //
    // useEffect(() => {
    //     // diagramFocusSend({ type: DiagramFocusActionTypes.UPDATE_STATE, payload: diagramFocus });
    //     if (diagramFocus) {
    //         updateSelectedComponent({ filePath: diagramFocus.filePath, position: diagramFocus.position })
    //     }
    // }, [diagramFocus])
    const updateSelectedComponent = (componentDetails: ComponentViewInfo) => {
        const { filePath, position } = componentDetails;
        (async () => {
            try {
                const langClient = await langClientPromise;
                const generatedST = await getSyntaxTree(filePath, langClient);
                const visitedST = await getLowcodeST(generatedST, filePath, langClient, experimentalEnabled);

                const content = await getFileContent(filePath);
                const resourceVersion = await getEnv("BALLERINA_LOW_CODE_RESOURCES_VERSION");
                const envInstance = await getEnv("VSCODE_CHOREO_SENTRY_ENV");

                const uidGenVisitor = new UIDGenerationVisitor(position);
                traversNode(visitedST, uidGenVisitor);
                componentDetails.uid = uidGenVisitor.getUId();
                const nodeFindingVisitor = new FindNodeByUidVisitor(componentDetails.uid);
                traversNode(visitedST, nodeFindingVisitor);

                setDiagramFocuState({ filePath, uid: componentDetails.uid });
                setFocusedST(nodeFindingVisitor.getNode());
                setCompleteST(visitedST);
                setCurrentFileContent(content);
                setLowCodeResourcesVersion(resourceVersion);
                setLowCodeEnvInstance(envInstance);
                historyPush(componentDetails);
            } catch (err) {
                // tslint:disable-next-line: no-console
                console.error(err);
            }
        })();
    }

    const handleNavigationHome = () => {
        historyClear();
    }

    const viewComponent: React.ReactElement[] = [];

    if (!focusedST && currentProject) {

        viewComponent.push((
            <OverviewDiagram
                currentProject={currentProject}
                currentFile={focusFile}
                lastUpdatedAt={lastUpdatedAt}
                notifyComponentSelection={updateSelectedComponent}
            />
        ));
    } else if (focusedST) {
        if (STKindChecker.isServiceDeclaration(focusedST)) {
            if (focusedST.expressions.length > 0) {
                const listenerExpression = focusedST.expressions[0];
                const typeData = listenerExpression.typeData;
                const typeSymbol = typeData?.typeSymbol;
                const signature = typeSymbol?.signature;
                if (signature && signature.includes('http')) {
                    viewComponent.push((
                        <ServiceDesignOverlay
                            model={focusedST}
                            targetPosition={{ ...focusedST.position, startColumn: 0, endColumn: 0 }}
                            onCancel={handleNavigationHome}
                        />
                    ));
                } else if (signature && signature.includes('graphql')) {
                    viewComponent.push(
                        <GraphqlDiagramOverlay
                            model={focusedST}
                            targetPosition={focusedST.position}
                            ballerinaVersion={balVersion}
                            onCancel={handleNavigationHome}
                        />
                    );
                }
            }
        } else if (STKindChecker.isFunctionDefinition(focusedST)
            && STKindChecker.isExpressionFunctionBody(focusedST.functionBody)) {
            viewComponent.push((
                <DataMapperOverlay
                    targetPosition={{ ...focusedST.position, startColumn: 0, endColumn: 0 }}
                    model={focusedST}
                    ballerinaVersion={balVersion}
                    onCancel={handleNavigationHome}
                />
            ))
        } else {
            viewComponent.push(<Diagram />);
        }
    }
    //
    // if (!diagramFocusState) {
    //     viewComponent.push((
    //         <OverviewDiagram
    //             lastUpdatedAt={lastUpdatedAt}
    //             projectPaths={projectPaths}
    //             notifyComponentSelection={updateSelectedComponent}
    //             filterMap={filterMap}
    //             updateFilterMap={setFilterMap}
    //         />
    //     ));
    // } else if (!!diagramFocusState && !!focusedST) {
    //     if (STKindChecker.isServiceDeclaration(focusedST)) {
    //         if (focusedST.expressions.length > 0) {
    //             const listenerExpression = focusedST.expressions[0];
    //             const typeData = listenerExpression.typeData;
    //             const typeSymbol = typeData?.typeSymbol;
    //             const signature = typeSymbol?.signature;
    //             if (signature && signature.includes('http')) {
    //                 viewComponent.push((
    //                     <ServiceDesignOverlay
    //                         model={focusedST}
    //                         targetPosition={{ ...focusedST.position, startColumn: 0, endColumn: 0 }}
    //                         onCancel={handleNavigationHome}
    //                     />
    //                 ));
    //             } else if (signature && signature.includes('graphql')) {
    //                 viewComponent.push(
    //                     <GraphqlDiagramOverlay
    //                         model={focusedST}
    //                         targetPosition={focusedST.position}
    //                         ballerinaVersion={balVersion}
    //                         onCancel={handleNavigationHome}
    //                     />
    //                 );
    //             }
    //         }
    //     } else if (STKindChecker.isFunctionDefinition(focusedST)
    //         && STKindChecker.isExpressionFunctionBody(focusedST.functionBody)) {
    //         viewComponent.push((
    //             <DataMapperOverlay
    //                 targetPosition={{ ...focusedST.position, startColumn: 0, endColumn: 0 }}
    //                 model={focusedST}
    //                 ballerinaVersion={balVersion}
    //                 onCancel={handleNavigationHome}
    //             />
    //         ))
    //     } else {
    //         viewComponent.push(<Diagram />);
    //     }
    // }
    const navigateUptoParent = (position: NodePosition) => {
        if (!position) {
            return;
        }

        const currentHistoryEntry: ComponentViewInfo = structuredClone(history[history.length - 1]);
        currentHistoryEntry.uid = undefined;
        currentHistoryEntry.position = position;
        updateSelectedComponent(currentHistoryEntry);
    }

    //
    // const handleFolderClick = () => {
    //     Object.keys(filterMap).forEach((key) => {
    //         filterMap[key] = key === folderName;
    //     })
    //
    //     setFilterMap(filterMap);
    //     historyClear();
    // }
    //
    const handleFileChange = (entry: FileListEntry) => {
        setFocusFile(entry);
        setFocusUid(undefined);
        setFocusedST(undefined);
    }

    const updateActiveFile = (currentFile: FileListEntry) => {
        setFocusFile(currentFile);
        fetchST(currentFile.uri.path, {});
    };

    return (
        <div>
            <MuiThemeProvider theme={theme}>
                <div className={classes.lowCodeContainer}>
                    <IntlProvider locale='en' defaultLocale='en' messages={messages}>
                        <ViewManagerProvider
                            {...getDiagramProviderProps(focusedST, lowCodeEnvInstance, currentFileContent, focusFile, fileList, stMemberId, completeST, lowCodeResourcesVersion, balVersion, props, setFocusedST, setCompleteST, setCurrentFileContent, updateActiveFile, updateSelectedComponent, navigateUptoParent)}
                        >
                            <NavigationBar
                                workspaceName={workspaceName}
                                projectList={projectPaths}
                                fileList={fileList}
                                currentProject={currentProject}
                                currentFile={focusFile}
                                updateCurrentFile={handleFileChange}
                                updateCurrentProject={setCurrentProject}
                            />
                            {viewComponent}
                            <div id={'canvas-overlay'} className={"overlayContainer"} />
                        </ViewManagerProvider>
                    </IntlProvider>
                </div>
            </MuiThemeProvider>
        </div>
    )
    // {viewComponent}
}

