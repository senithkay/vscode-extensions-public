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
import { WorkspaceFolder } from "../DiagramGenerator/vscode/Diagram";

import { Filter as FilterComponent } from './components/Filter'
import * as Views from './components/ViewTypes';
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
    projectPaths: WorkspaceFolder[]
    notifyComponentSelection: (info: ComponentViewInfo) => void;
}



export function OverviewDiagram(props: OverviewDiagramProps) {
    const { api: { ls: { getDiagramEditorLangClient } } } = useDiagramContext();
    const { projectPaths, notifyComponentSelection, lastUpdatedAt } = props;
    const [projectComponents, updateProjectComponenets] = useState<BallerinaProjectComponents>();
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TYPE);
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [filterMap, setFilterMap] = useState({});
    const ref = useRef();
    const isProjectWorkspace: boolean = projectPaths.length > 0;

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
        projectPaths.forEach(path => {
            if (!filterMap[path.name]) {
                filterMap[path.name] = true;
            }
        })
        setFilterMap(filterMap);
    }, [projectPaths]);

    useEffect(() => {
        (async () => {
            try {
                const langClient = await getDiagramEditorLangClient();
                const filePaths: any = projectPaths
                    .filter(path => filterMap[path.name])
                    .map(path => ({ uri: path.uri.external }));
                // const requestPromises = filePaths.map((path: any) => {
                //     return langClient.getBallerinaProjectComponents({ documentIdentifiers: [path] });
                // });
                // Promise.all(requestPromises).then((response) => { console.log('>>> response', response) });
                const componentResponse: BallerinaProjectComponents = await langClient.getBallerinaProjectComponents({
                    documentIdentifiers: [...filePaths]
                });
                updateProjectComponenets(componentResponse);
            } catch (err) {
                // tslint:disable-next-line: no-console
                console.error(err);
            }
        })();
    }, [lastUpdatedAt, filterMap]);

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

    const handleFilterClick = () => {
        setIsFilterOpen(true);
    }

    const handleFilterClose = () => {
        setIsFilterOpen(false);
    }

    const handleMapChange = (obj: any) => {
        setFilterMap(obj);
    }

    const viewSelector = (
        <div className="overview-action-bar">
            <div
                style={{ display: 'flex', paddingLeft: 15 }}
                ref={ref}
                onClick={handleFilterClick}
            >
                <span className="label">Filter</span>
                <div>
                    <FilterList />
                    <Popover
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left', }}
                        title={'Filter'}
                        open={isFilterOpen}
                        anchorEl={ref ? ref.current : undefined}
                        onClose={handleFilterClose}
                    >
                        <FilterComponent
                            filterMap={filterMap}
                            updateFilterMap={handleMapChange}
                            handleFilterClose={handleFilterClose}
                        />
                    </Popover>
                </div>
            </div>
            <div>
                <span className="label">Group By</span>
                <select onChange={handleViewModeChange} value={viewMode}>
                    <option value={ViewMode.MODULE}>{ViewMode.MODULE}</option>
                    <option value={ViewMode.FILE}>{ViewMode.FILE}</option>
                    <option value={ViewMode.TYPE}>{ViewMode.TYPE}</option>
                </select>
            </div >
        </div>
    );


    return (
        <>
            {viewSelector}
            {renderView()}
        </>
    )
}
