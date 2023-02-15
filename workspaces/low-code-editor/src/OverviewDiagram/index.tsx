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
import React, { useEffect, useRef, useState } from "react";

import { Popover } from "@material-ui/core";
import { FilterList } from "@material-ui/icons";
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useDiagramContext } from "../Contexts/Diagram";
import { FileListEntry, WorkspaceFolder } from "../DiagramGenerator/vscode/Diagram";

import { Filter as FilterComponent } from './components/Filter'
import { TopLevelActionButton } from "./components/TopLevelActionButton";
import * as Views from './components/ViewTypes';
import { CategoryView } from "./components/ViewTypes/CategoryView";
import './style.scss';
import { ComponentViewInfo } from "./util";

export const DEFAULT_MODULE_NAME = 'default';

enum ViewMode {
    MODULE = 'Module',
    FILE = 'File',
    TYPE = 'Type'
}

export interface OverviewDiagramProps {
    lastUpdatedAt: string;
    currentProject: WorkspaceFolder;
    currentFile: FileListEntry;
    notifyComponentSelection: (info: ComponentViewInfo) => void;
    updateCurrentFile: (file: FileListEntry) => void;
    fileList: FileListEntry[];
}

export function OverviewDiagram(props: OverviewDiagramProps) {
    const { api: { ls: { getDiagramEditorLangClient } } } = useDiagramContext();
    const { currentProject, currentFile, notifyComponentSelection, lastUpdatedAt, updateCurrentFile, fileList } = props;
    const [projectComponents, updateProjectComponenets] = useState<BallerinaProjectComponents>();
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TYPE);
    // const [filterMap, setFilterMap] = useState({});

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


    // const handleFilterClick = () => {
    //     setIsFilterOpen(true);
    // }
    //
    // const handleFilterClose = () => {
    //     setIsFilterOpen(false);
    // }
    //
    // const handleMapChange = (obj: any) => {
    //     updateFilterMap(obj);
    // }

    // const viewSelector = (
    //     <div className="overview-action-bar">
    //         <div
    //             style={{ display: 'flex', paddingLeft: 15 }}
    //             ref={ref}
    //             onClick={handleFilterClick}
    //         >
    //             <span className="label">Filter</span>
    //             <div>
    //                 {isProjectWorkspace && <FilterList />}
    //                 <Popover
    //                     anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
    //                     transformOrigin={{ vertical: 'top', horizontal: 'left', }}
    //                     title={'Filter'}
    //                     open={isFilterOpen}
    //                     anchorEl={ref ? ref.current : undefined}
    //                     onClose={handleFilterClose}
    //                 >
    //                     <FilterComponent
    //                         filterMap={filterMap}
    //                         updateFilterMap={handleMapChange}
    //                         handleFilterClose={handleFilterClose}
    //                     />
    //                 </Popover>
    //             </div>
    //         </div>
    //         <div>
    //             <span className="label">Group By</span>
    //             <select onChange={handleViewModeChange} value={viewMode}>
    //                 <option value={ViewMode.MODULE}>{ViewMode.MODULE}</option>
    //                 <option value={ViewMode.FILE}>{ViewMode.FILE}</option>
    //                 <option value={ViewMode.TYPE}>{ViewMode.TYPE}</option>
    //             </select>
    //         </div >
    //     </div>
    // );

    return (
        <div className="view-container">
            <CategoryView
                projectComponents={projectComponents}
                currentFile={currentFile}
                updateSelection={notifyComponentSelection}
                updateCurrentFile={updateCurrentFile}
                fileList={fileList}
            />
             <TopLevelActionButton />
        </div>
    )
}
