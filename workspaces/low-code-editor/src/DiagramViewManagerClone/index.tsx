/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { MuiThemeProvider } from "@material-ui/core";
import { BallerinaProjectComponents, ComponentViewInfo, FileListEntry } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import React, { useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import { EditorProps, WorkspaceFolder } from "../DiagramGenerator/vscode/Diagram";
import { Provider as HistoryProvider } from './context/history';
import { useComponentHistory } from "./hooks/history";
import { useGeneratorStyles } from "./style";
import messages from '../lang/en.json';
import { theme } from './theme';
import { NavigationBar } from "./components/NavigationBar";
import { ComponentListView } from "./views";
import { TextPreLoader } from "../PreLoader/TextPreLoader";
import { ComponentCollection } from "../OverviewDiagram/util";
import { getLowcodeST, getSyntaxTree } from "../DiagramGenerator/generatorUtil";
import { NodePosition, STNode, traversNode } from "@wso2-enterprise/syntax-tree";
import { UIDGenerationVisitor } from "../Diagram/visitors/uid-generation-visitor";
import { FindNodeByUidVisitor } from "../Diagram/visitors/find-node-by-uid";
import { FindConstructByNameVisitor } from "../Diagram/visitors/find-construct-by-name-visitor";
import { FindConstructByIndexVisitor } from "../Diagram/visitors/find-construct-by-index-visitor";
import { getConstructBodyString } from "../Diagram/visitors/util";
import { getDiagramProviderProps } from "./utils";
import { Provider as ViewManagerProvider } from "../Contexts/Diagram";
import { DiagramView } from "./views/DiagramView";

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
        if (history.length > 0) {
            (async () => {
                const { file, position, uid } = history[history.length - 1];
                const langClient = await langClientPromise;
                const componentResponse = await langClient.getBallerinaProjectComponents({
                    documentIdentifiers: [
                        {
                            uri: file.startsWith("file://") ? file : `file://${file}`,
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
                                // setFocusUid(visitorToFindConstructByName.getUid());
                                updateCurrentEntry({
                                    ...history[history.length - 1], uid: visitorToFindConstructByName.getUid()
                                });
                            } else {
                                const visitorToFindConstructByIndex =
                                    new FindConstructByIndexVisitor(uid, getConstructBodyString(focusedST));
                                traversNode(visitedST, visitorToFindConstructByIndex);
                                if (visitorToFindConstructByIndex.getNode()) {
                                    selectedST = visitorToFindConstructByIndex.getNode();
                                    // setFocusUid(visitorToFindConstructByIndex.getUid());
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

                console.log("componentResponse >>>", componentResponse);
                setProjectComponents(componentResponse);
            })();
        }
    }, [history[history.length - 1], updatedTimeStamp]);

    const handleProjectChange = (project: WorkspaceFolder): void => {
        throw new Error("Function not implemented.");
    }

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
        && history[history.length - 1].position === undefined;
    const showSTMode: boolean = history.length > 0 && history[history.length - 1].file !== undefined
        && history[history.length - 1].position !== undefined && !!focusedST;


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
                            {showSTMode && <DiagramView projectComponents={projectComponents}/>}
                            <div id={'canvas-overlay'} className={"overlayContainer"} />
                        </ViewManagerProvider>
                    </HistoryProvider>
                </IntlProvider>
            </div>
        </MuiThemeProvider>
    )
}

