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

import React, { useState } from "react";

import { BallerinaProjectComponents, ComponentSummary } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { Diagram, EditorProps } from "../DiagramGenerator/vscode/Diagram";

import { NavigationBar } from "./components/NavigationBar";
import * as Views from './components/ViewTypes';
import { CategoryView } from "./components/ViewTypes/CategoryView";
import './style.scss';
import { ComponentCollection } from "./util";

export const DEFAULT_MODULE_NAME = 'default';

enum ViewMode {
    MODULE = 'Module',
    FILE = 'File',
    TYPE = 'Type'
}

export function OverviewDiagram(props: EditorProps) {
    const { langClientPromise, projectPaths, lastUpdatedAt, filePath, openInDiagram } = props;
    // const [components, updateProjectComponents] = useState<ComponentCollection>();
    const [projectComponents, updateProjectComponenets] = useState<BallerinaProjectComponents>();
    const [selectedFile, setSelectedFile] = useState<string>(filePath);
    const [focusPosition, setFocusPosition] = useState<NodePosition>();
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

    React.useEffect(() => {
        (async () => {
            try {
                const langClient = await langClientPromise;
                const filePaths: any = projectPaths.map(path => ({ uri: path.uri.external }))
                const projectCompResponse: BallerinaProjectComponents = await langClient.getBallerinaProjectComponents({
                    documentIdentifiers: [...filePaths]
                });

                updateProjectComponenets(projectCompResponse);
            } catch (err) {
                // TODO: do the error view diagram
                // tslint:disable-next-line: no-console
                console.error(err)
            }

        })();
    }, [lastUpdatedAt]);

    const handleUpdateSelection = (position: NodePosition, file: string) => {
        setSelectedFile(file);
        setFocusPosition(position);
    }

    const handleBackNavigation = () => {
        setFocusPosition(undefined);
    }

    const renderView = () => {
        const CurrentView = Views[viewMode];
        if (!CurrentView) return <></>;
        return (
            <CurrentView
                projectComponents={projectComponents}
                updateSelection={handleUpdateSelection}
            />
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

    const diagramRenderCondition: boolean = (!!openInDiagram && !!selectedFile && selectedFile.length > 0)
        || (!!focusPosition && !!selectedFile && selectedFile.length > 0);

    return (
        <>
            <NavigationBar diagramHasDepth={diagramRenderCondition} handleBackClick={handleBackNavigation} />
            {!diagramRenderCondition && viewSelector}
            {!diagramRenderCondition && renderView()}
            {diagramRenderCondition && <Diagram {...props} filePath={selectedFile} focusPosition={focusPosition} />}
        </>
    )
}
