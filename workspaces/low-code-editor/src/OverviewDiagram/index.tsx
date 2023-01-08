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

import { BallerinaProjectComponents, ComponentInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { WorkspaceFolder } from "../DiagramGenerator/vscode/Diagram";

import * as Views from './components/ViewTypes';
import './style.scss';
import { useDiagramContext } from "../Contexts/Diagram";

export const DEFAULT_MODULE_NAME = 'default';

enum ViewMode {
    MODULE = 'Module',
    FILE = 'File',
    TYPE = 'Type'
}


export interface OverviewDiagramProps {
    lastUpdatedAt: string;
    notifyComponentSelection: (info: ComponentInfo) => void;
    projectPaths: WorkspaceFolder[]
}

export function OverviewDiagram(props: OverviewDiagramProps) {
    const { api: { ls: { getDiagramEditorLangClient } } } = useDiagramContext();
    const { projectPaths, notifyComponentSelection, lastUpdatedAt } = props;
    const [projectComponents, updateProjectComponenets] = useState<BallerinaProjectComponents>();
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TYPE);

    const handleViewModeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        switch (evt.target.value) {
            case ViewMode.MODULE:
                setViewMode(ViewMode.MODULE);
                break;
            case ViewMode.FILE:
                setViewMode(ViewMode.FILE);
                break;
            case ViewMode.TYPE:
                setViewMode(ViewMode.TYPE);
                break;
            default:
            // ignored
        }
    }

    useEffect(() => {
        (async () => {
            try {
                const langClient = await getDiagramEditorLangClient();
                const filePaths: any = projectPaths.map(path => ({ uri: path.uri.external }));
                const componentResponse: BallerinaProjectComponents = await langClient.getBallerinaProjectComponents({
                    documentIdentifiers: [...filePaths]
                });

                updateProjectComponenets(componentResponse);
            } catch (err) {
                // tslint:disable-next-line: no-console
                console.error(err);
            }
        })();
    }, [lastUpdatedAt]);

    const renderView = () => {
        const CurrentView = Views[viewMode];
        if (!CurrentView) return <></>;
        return (
            <div className="view-container">
                <CurrentView
                    projectComponents={projectComponents}
                    updateSelection={notifyComponentSelection}
                />
            </div>
        )
    }


    const viewSelector = (
        <div className="overview-action-bar">
            <div>
                <span className="label">Group By</span>
                <select onChange={handleViewModeChange} value={viewMode}>
                    <option value={ViewMode.MODULE}>{ViewMode.MODULE}</option>
                    <option value={ViewMode.FILE}>{ViewMode.FILE}</option>
                    <option value={ViewMode.TYPE}>{ViewMode.TYPE}</option>
                </select>
            </div >
        </div>
    )

    return (
        <>
            {viewSelector}
            {renderView()}
        </>
    )
}
