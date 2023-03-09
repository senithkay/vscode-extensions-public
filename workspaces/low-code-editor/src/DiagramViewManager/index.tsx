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
import { ServiceInvalidOverlay } from "../Diagram/components/ServiceInvalidOverlay";
import { ServiceUnsupportedOverlay } from "../Diagram/components/ServiceUnsupported";
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
import { TextPreLoader } from "../PreLoader/TextPreLoader";

import { Provider as HistoryProvider } from './context/history';
import { useComponentHistory } from "./hooks/history";
import { NavigationBar } from "./NavigationBar";
import { useGeneratorStyles } from './style';
import { theme } from "./theme";
import { getDiagramProviderProps } from "./utils";

/**
 * Handles the rendering of the Diagram views(lowcode, datamapper, service etc.)
 */
export function DiagramViewManager(props: EditorProps) {
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

    const [currentFileContent, setCurrentFileContent] = useState<string>();
    const [history, historyPush, historyPop, historyClear] = useComponentHistory();
    const [updatedTimeStamp, setUpdatedTimeStamp] = useState<string>();
    const [currentProject, setCurrentProject] = useState<WorkspaceFolder>();
    const [fileList, setFileList] = useState<FileListEntry[]>();
    const [focusFile, setFocusFile] = useState<FileListEntry>();
    const [focusUid, setFocusUid] = useState<string>();
    const [focusedST, setFocusedST] = useState<STNode>();
    const [lowCodeResourcesVersion, setLowCodeResourcesVersion] = React.useState(undefined);
    const [lowCodeEnvInstance, setLowCodeEnvInstance] = React.useState("");
    const [balVersion, setBalVersion] = React.useState("");
    const [completeST, setCompleteST] = useState<STNode>();

    useEffect(() => {
        setUpdatedTimeStamp(lastUpdatedAt);
    }, [lastUpdatedAt]);

    useEffect(() => {
        if (!focusFile || !focusUid) return;
        fetchST(focusFile.uri.path, { uid: focusUid });
    }, [updatedTimeStamp]);

    useEffect(() => {
        if (history.length > 0) {
            const { project, file, position } = history[history.length - 1];
            fetchST(file.uri.path, { position });
            if (!currentProject || currentProject.name !== project.name) setCurrentProject(project);
            setFocusFile(file);
        } else {
            setFocusedST(undefined);
            setFocusUid(undefined);
        }
    }, [history[history.length - 1]]);

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
            })();
        }
    }, [currentProject?.name]);

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
                historyPush({ project: currentProjectPath, file: currentFile, position });
            })();

        }
    }, [diagramFocus]);


    React.useEffect(() => {
        (async () => {
            const version: string = await getBallerinaVersion();
            setBalVersion(version);
        })();
    }, []);

    // TODO: move to util file
    const fetchST = (filePath: string, options?: { position?: NodePosition, uid?: string }) => {
        (async () => {
            try {
                const langClient = await langClientPromise;
                const generatedST = await getSyntaxTree(filePath, langClient);
                const visitedST = await getLowcodeST(generatedST, filePath, langClient, experimentalEnabled);
                const content = await getFileContent(filePath);
                const resourceVersion = await getEnv("BALLERINA_LOW_CODE_RESOURCES_VERSION");
                const envInstance = await getEnv("VSCODE_CHOREO_SENTRY_ENV");
                let selectedST;

                if (options && options.position) {
                    const uidGenVisitor = new UIDGenerationVisitor(options.position);
                    traversNode(visitedST, uidGenVisitor);
                    const generatedUid = uidGenVisitor.getUId();
                    const nodeFindingVisitor = new FindNodeByUidVisitor(generatedUid);
                    traversNode(visitedST, nodeFindingVisitor);
                    selectedST = nodeFindingVisitor.getNode();
                    setFocusUid(generatedUid);
                }

                if (options && options.uid) {
                    const nodeFindingVisitor = new FindNodeByUidVisitor(options.uid);
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

    const updateSelectedComponent = (componentDetails: ComponentViewInfo) => {
        const { filePath, position } = componentDetails;
        const fileListEntry = fileList.find(file => file.uri.path === filePath);
        historyPush({
            file: fileListEntry,
            project: currentProject,
            position,
        });
    }

    const handleNavigationHome = () => {
        historyClear();
    }

    const viewComponent: React.ReactElement[] = [];

    if (history.length > 0 && history[history.length - 1].position && !focusedST) {
        viewComponent.push(<TextPreLoader position={'absolute'} />);
    } else if (!focusedST) {
        viewComponent.push((
            <OverviewDiagram
                currentProject={currentProject}
                currentFile={focusFile}
                notifyComponentSelection={updateSelectedComponent}
                updateCurrentFile={setFocusFile}
                fileList={fileList}
                lastUpdatedAt={updatedTimeStamp}
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
                } else if (experimentalEnabled && signature && signature.includes('graphql')) {
                    viewComponent.push(
                        <GraphqlDiagramOverlay
                            model={focusedST}
                            targetPosition={focusedST.position}
                            ballerinaVersion={balVersion}
                            onCancel={handleNavigationHome}
                        />
                    );
                } else if (signature && signature === "$CompilationError$") {
                    viewComponent.push((
                        <ServiceInvalidOverlay />
                    ));
                } else if (!experimentalEnabled) {
                    viewComponent.push(
                        <ServiceUnsupportedOverlay />
                    )
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
        } else if (STKindChecker.isTypeDefinition(focusedST)
            && STKindChecker.isRecordTypeDesc(focusedST.typeDescriptor)) {
            // Navigate to record composition view
            const recordST = {...focusedST}; // Clone focusedST
            const name = recordST.typeName.value;
            const module = recordST.typeData?.symbol?.moduleID;
            if (!(name && module)) {
                // TODO: Handle error properly
                // tslint:disable-next-line
                console.error('Couldn\'t generate record nodeId to open Architecture view', recordST);
            }else{
                const nodeId = `${module?.orgName}/${module?.moduleName}:${module?.version}:${name}`
                props.openArchitectureView(nodeId);
            }
            // Show file view, clear focus syntax tree
            setFocusedST(undefined);
            setFocusUid(undefined);
            handleNavigationHome();
        } else {
            viewComponent.push(<Diagram />);
        }
    }
    const navigateUptoParent = (position: NodePosition) => {
        if (!position) {
            return;
        }

        const currentHistoryEntry = structuredClone(history[history.length - 1]);
        currentHistoryEntry.position = position;
        historyPush(currentHistoryEntry);
    }

    const updateActiveFile = (currentFile: FileListEntry) => {
        setFocusFile(currentFile);
        fetchST(currentFile.uri.path);
    };

    const handleProjectChange = (project: WorkspaceFolder) => {
        setCurrentProject(project);
        setFocusFile(undefined);
        setFocusUid(undefined);
        setFocusedST(undefined);
        historyClear();
    }

    const diagramProps = getDiagramProviderProps(
        focusedST,
        lowCodeEnvInstance,
        currentFileContent,
        focusFile,
        fileList,
        focusUid,
        completeST,
        lowCodeResourcesVersion,
        balVersion,
        props,
        setFocusedST,
        setCompleteST,
        setCurrentFileContent,
        updateActiveFile,
        updateSelectedComponent,
        navigateUptoParent,
        setUpdatedTimeStamp
    )

    return (
        <div>
            <MuiThemeProvider theme={theme}>
                <div className={classes.lowCodeContainer}>
                    <IntlProvider locale='en' defaultLocale='en' messages={messages}>
                        <ViewManagerProvider
                            {...diagramProps}
                        >
                            <HistoryProvider
                                history={history}
                                historyPush={historyPush}
                                historyPop={historyPop}
                                historyReset={historyClear}
                            >
                                <NavigationBar
                                    workspaceName={workspaceName}
                                    projectList={projectPaths}
                                    currentProject={currentProject}
                                    updateCurrentProject={handleProjectChange}
                                />
                                {viewComponent}
                                <div id={'canvas-overlay'} className={"overlayContainer"} />
                            </HistoryProvider>
                        </ViewManagerProvider>
                    </IntlProvider>
                </div>
            </MuiThemeProvider>
        </div>
    )
}

