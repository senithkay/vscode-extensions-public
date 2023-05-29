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
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Provider as ViewManagerProvider } from "../Contexts/Diagram";
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
        getAllFiles,
        gotoSource,
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
    const [currentComponents, setCurrentComponents] = React.useState<ComponentCollection>(undefined);

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
                const { file } = history[history.length - 1];
                const langClient = await langClientPromise;
                const componentResponse = await langClient.getBallerinaProjectComponents({
                    documentIdentifiers: [
                        {
                            uri: file.startsWith("file://") ? file : `file://${file}`,
                        }
                    ]
                });

                console.log("componentResponse >>>", componentResponse);
                setProjectComponents(componentResponse);
            })();
        }
    }, [history[history.length - 1], updatedTimeStamp]);

    const handleProjectChange = (project: WorkspaceFolder): void => {
        throw new Error("Function not implemented.");
    }

    const showOverviewMode: boolean = history.length > 0 && history[history.length - 1].file !== undefined
        && history[history.length - 1].position === undefined;
    const showSTMode: boolean = history.length > 0 && history[history.length - 1].file !== undefined
        && history[history.length - 1].position !== undefined;

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
                        <NavigationBar
                            workspaceName={workspaceName}
                            projectList={projectPaths}
                            projectInfo={projectComponents}
                        />
                        {!showOverviewMode && !showSTMode && <TextPreLoader position={'absolute'} />}
                        {showOverviewMode && <ComponentListView lastUpdatedAt={updatedTimeStamp} projectComponents={projectComponents} />}
                        <div id={'canvas-overlay'} className={"overlayContainer"} />
                    </HistoryProvider>
                </IntlProvider>
            </div>
        </MuiThemeProvider>
    )
}

