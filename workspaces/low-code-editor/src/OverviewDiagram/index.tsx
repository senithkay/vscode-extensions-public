/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { BallerinaProjectComponents, FileListEntry } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useDiagramContext } from "../Contexts/Diagram";
import { WorkspaceFolder } from "../DiagramGenerator/vscode/Diagram";

import { TopLevelActionButton } from "./components/TopLevelActionButton";
import { CategoryView } from "./components/ViewTypes/CategoryView";
import './style.scss';
import { ComponentViewInfo } from "./util";

export const DEFAULT_MODULE_NAME = 'default';

export interface OverviewDiagramProps {
    lastUpdatedAt: string;
    currentProject: WorkspaceFolder;
    currentFile: string;
    currentFileName: string;
    notifyComponentSelection: (info: ComponentViewInfo) => void;
    updateCurrentFile: (filePath: string) => void;
    fileList: FileListEntry[];
}

export function OverviewDiagram(props: OverviewDiagramProps) {
    const { api: { ls: { getDiagramEditorLangClient } } } = useDiagramContext();
    const {
        currentProject, currentFile, notifyComponentSelection, lastUpdatedAt, updateCurrentFile, fileList,
        currentFileName
    } = props;
    const [projectComponents, updateProjectComponenets] = useState<BallerinaProjectComponents>();

    useEffect(() => {
        (async () => {
            try {
                if (currentProject) {
                    const langClient = await getDiagramEditorLangClient();
                    const componentResponse: BallerinaProjectComponents = await langClient.getBallerinaProjectComponents({
                        documentIdentifiers: [{ uri: currentProject.uri.external }]
                    });

                    updateProjectComponenets(componentResponse);
                }
            } catch (err) {
                // tslint:disable-next-line: no-console
                console.error(err);
            }
        })();
    }, [lastUpdatedAt, currentProject]);

    const hasProjectComponents = projectComponents && !!projectComponents.packages;

    const renderCategoryView = () => (
        <>
            <CategoryView
                projectComponents={projectComponents}
                currentFile={currentFile}
                currentFileName={currentFileName}
                updateSelection={notifyComponentSelection}
                updateCurrentFile={updateCurrentFile}
                fileList={fileList}
            />
            <TopLevelActionButton />
        </>
    )

    const renderEmptyProjectMessage = () => (
        <div className="empty-message" >No ballerina components detected.</div>
    );

    return (
        <div className="view-container">
            {hasProjectComponents && renderCategoryView()}
            {!hasProjectComponents && renderEmptyProjectMessage()}
        </div>
    )
}
