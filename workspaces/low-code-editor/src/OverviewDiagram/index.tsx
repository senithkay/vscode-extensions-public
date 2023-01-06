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

import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { Diagram, EditorProps } from "../DiagramGenerator/vscode/Diagram";

import { NavigationBar } from "./components/NavigationBar";
import * as Views from './components/ViewTypes';
import { OverviewDiagramContextProvider } from "./context/overview-diagram";
import { NavigationHistoryManager } from "./navigation-manager";
import './style.scss';
import { ComponentViewInfo, generateFileLocation } from "./util";

export const DEFAULT_MODULE_NAME = 'default';

enum ViewMode {
    MODULE = 'Module',
    FILE = 'File',
    TYPE = 'Type'
}

const navigationHistoryManager = new NavigationHistoryManager();

export function OverviewDiagram(props: EditorProps) {
    // const { langClientPromise, projectPaths, lastUpdatedAt, filePath, openInDiagram } = props;
    // const [selectedComponent, updateSelectedComponent] = useState<ComponentViewInfo>();
    // const [projectComponents, updateProjectComponenets] = useState<BallerinaProjectComponents>();
    // const [selectedFile, setSelectedFile] = useState<string>(filePath);
    // const [focusPosition, setFocusPosition] = useState<NodePosition>();
    // const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TYPE);

    // const handleViewModeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    //     switch (evt.target.value) {
    //         case ViewMode.MODULE:
    //             setViewMode(ViewMode.MODULE);
    //             break;
    //         case ViewMode.FILE:
    //             setViewMode(ViewMode.FILE);
    //             break;
    //         case ViewMode.TYPE:
    //             setViewMode(ViewMode.TYPE);
    //             break;
    //         default:
    //         // ignored
    //     }
    // }

    // React.useEffect(() => {
    //     (async () => {
    //         try {
    //             const langClient = await langClientPromise;
    //             const filePaths: any = projectPaths.map(path => ({ uri: path.uri.external }))
    //             const projectCompResponse: BallerinaProjectComponents = await langClient.getBallerinaProjectComponents({
    //                 documentIdentifiers: [...filePaths]
    //             });

    //             updateProjectComponenets(projectCompResponse);
    //         } catch (err) {
    //             // TODO: do the error view diagram
    //             // tslint:disable-next-line: no-console
    //             console.error(err)
    //         }

    //     })();
    // }, [lastUpdatedAt]);

    // const handleUpdateSelection = (info: ComponentViewInfo) => {
    //     const { filePath: fileName, folderPath, moduleName, name, ...position } = info;
    //     setSelectedFile(generateFileLocation(moduleName, folderPath.replace('file://', ''), fileName));
    //     updateSelectedComponent(info);
    //     setFocusPosition(position);
    // }

    // const addToHistoryStack = (info: ComponentViewInfo) => {
    //     navigationHistoryManager.push(info);
    // }

    // const navigateBack = () => {
    //     const previousComponentInfo = navigationHistoryManager.pop();
    //     if (previousComponentInfo) {
    //         const { filePath: fileName, folderPath, moduleName, name, ...position } = previousComponentInfo;
    //         setSelectedFile(generateFileLocation(moduleName, folderPath.replace('file://', ''), fileName));
    //         updateSelectedComponent(previousComponentInfo);
    //         setFocusPosition(position);
    //     } else {
    //         setFocusPosition(undefined);
    //     }
    // }

    // const resetToOverviewDiagram = () => {
    //     navigationHistoryManager.clear();
    //     setFocusPosition(undefined);
    //     updateSelectedComponent(undefined);
    // }

    // const renderView = () => {
    //     const CurrentView = Views[viewMode];
    //     if (!CurrentView) return <></>;
    //     return (
    //         <div className="view-container">
    //             <CurrentView
    //                 projectComponents={projectComponents}
    //                 updateSelection={handleUpdateSelection}
    //             />
    //         </div>
    //     )
    // }

    // const isHistoryStackEmpty = () => navigationHistoryManager.isStackEmpty();

    // const viewSelector = (
    //     <div className="overview-action-bar">
    //         <div>
    //             <span className="label">Group By</span>
    //             <select onChange={handleViewModeChange} value={viewMode}>
    //                 <option value={ViewMode.MODULE}>{ViewMode.MODULE}</option>
    //                 <option value={ViewMode.FILE}>{ViewMode.FILE}</option>
    //                 <option value={ViewMode.TYPE}>{ViewMode.TYPE}</option>
    //             </select>
    //         </div >
    //     </div>
    // )

    // const diagramRenderCondition: boolean = (!!openInDiagram && !!selectedFile && selectedFile.length > 0)
    //     || (!!focusPosition && !!selectedFile && selectedFile.length > 0);

    // return (
    //     <OverviewDiagramContextProvider
    //         currentComponent={selectedComponent}
    //         addToHistoryStack={addToHistoryStack}
    //         navigateBack={navigateBack}
    //         navigateToMain={resetToOverviewDiagram}
    //         isHistoryStackEmpty={isHistoryStackEmpty}
    //     >
    //         <NavigationBar
    //             diagramHasDepth={diagramRenderCondition}
    //             handleHomeClick={navigateBack}
    //             selectedComponent={selectedComponent}
    //         />
    //         {!diagramRenderCondition && viewSelector}
    //         {!diagramRenderCondition && renderView()}
    //         {/* {diagramRenderCondition && <Diagram {...props} filePath={selectedFile} focusPosition={focusPosition} />} */}
    //     </OverviewDiagramContextProvider>
    // )

    return (
        <div>Overview Diagram</div>
    )
}
