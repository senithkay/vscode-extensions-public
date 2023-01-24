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
import { Provider as HistoryProvider } from './context/history';

import { MuiThemeProvider } from "@material-ui/core";
import { STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { Provider as ViewManagerProvider } from "../Contexts/Diagram";
import { Diagram } from "../Diagram";
import { DataMapperOverlay } from "../Diagram/components/DataMapperOverlay";
import { ServiceDesignOverlay } from "../Diagram/components/ServiceDesignOverlay";
import { FindNodeByUidVisitor } from "../Diagram/visitors/find-node-by-uid";
import { UIDGenerationVisitor } from "../Diagram/visitors/uid-generation-visitor";
import {
    getLowcodeST,
    getSyntaxTree
} from "../DiagramGenerator/generatorUtil";
import { EditorProps } from "../DiagramGenerator/vscode/Diagram";
import messages from '../lang/en.json';
import { OverviewDiagram } from "../OverviewDiagram";
import { ComponentViewInfo } from "../OverviewDiagram/util";

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
    } = props;

    const classes = useGeneratorStyles();
    const [diagramFocusState, setDiagramFocuState] = useState<DiagramFocusState>();
    const [focusedST, setFocusedST] = useState<STNode>();
    const [completeST, setCompleteST] = useState<STNode>();
    const [lowCodeResourcesVersion, setLowCodeResourcesVersion] = React.useState(undefined);
    const [lowCodeEnvInstance, setLowCodeEnvInstance] = React.useState("");
    const [balVersion, setBalVersion] = React.useState("");
    const [currentFileContent, setCurrentFileContent] = useState<string>();
    const [history, historyPush, historyPop, historyClear] = useComponentHistory();


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
        if (history.length > 0) {
            const {
                filePath, uid
            } = history[history.length - 1];
            // diagramFocusSend({
            //     type: DiagramFocusActionTypes.UPDATE_STATE, payload: {
            //         filePath,
            //         position
            //     }
            // })
            setDiagramFocuState({
                filePath,
                uid
            });
        } else {
            // diagramFocusSend({ type: DiagramFocusActionTypes.RESET_STATE })
            setDiagramFocuState(undefined);
        }
    }, [history[history.length - 1]]);

    const fetchST = () => {
        if (history.length > 0) {
            const componentDetails = history[history.length - 1];
            const { filePath, uid } = componentDetails;
            (async () => {
                try {
                    const langClient = await langClientPromise;
                    const generatedST = await getSyntaxTree(filePath, langClient);
                    const visitedST = await getLowcodeST(generatedST, filePath, langClient, experimentalEnabled);

                    const content = await getFileContent(filePath);
                    const resourceVersion = await getEnv("BALLERINA_LOW_CODE_RESOURCES_VERSION");
                    const envInstance = await getEnv("VSCODE_CHOREO_SENTRY_ENV");

                    const nodeFindingVisitor = new FindNodeByUidVisitor(uid);
                    traversNode(visitedST, nodeFindingVisitor);

                    setFocusedST(nodeFindingVisitor.getNode());
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
    }
    useEffect(() => {
        fetchST();
    }, [lastUpdatedAt]);


    useEffect(() => {
        fetchST();
    }, [diagramFocusState]);

    useEffect(() => {
        // diagramFocusSend({ type: DiagramFocusActionTypes.UPDATE_STATE, payload: diagramFocus });
        if (diagramFocus) {
            updateSelectedComponent({ filePath: diagramFocus.filePath, position: diagramFocus.position })
        }
    }, [diagramFocus])

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

    if (!diagramFocusState) {
        viewComponent.push((
            <OverviewDiagram
                lastUpdatedAt={lastUpdatedAt}
                projectPaths={projectPaths}
                notifyComponentSelection={updateSelectedComponent}
            />
        ));
    } else if (!!diagramFocusState && !!focusedST) {
        if (STKindChecker.isServiceDeclaration(focusedST)) {
            viewComponent.push((
                <ServiceDesignOverlay
                    model={focusedST}
                    targetPosition={{ ...focusedST.position, startColumn: 0, endColumn: 0 }}
                    onCancel={handleNavigationHome}
                />
            ));
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

    return (
        <div>
            <MuiThemeProvider theme={theme}>
                <div className={classes.lowCodeContainer}>
                    <IntlProvider locale='en' defaultLocale='en' messages={messages}>
                        <ViewManagerProvider
                            {...getDiagramProviderProps(focusedST, lowCodeEnvInstance, currentFileContent, diagramFocusState, completeST, lowCodeResourcesVersion, balVersion, props, setFocusedST, setCompleteST, setCurrentFileContent, updateSelectedComponent)}
                        >
                            <HistoryProvider
                                history={history}
                                historyPush={historyPush}
                                historyPop={historyPop}
                                historyReset={historyClear}
                            >
                                <NavigationBar />
                                <div id={'canvas-overlay'} className={"overlayContainer"} />
                                {viewComponent}
                            </HistoryProvider>
                        </ViewManagerProvider>
                    </IntlProvider>
                </div>
            </MuiThemeProvider>
        </div>
    )
}
