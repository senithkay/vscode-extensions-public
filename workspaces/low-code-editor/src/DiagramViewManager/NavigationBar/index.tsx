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
import React from "react";

import { ClickAwayListener, Popover } from "@material-ui/core";
import { Apps, ArrowBack, ArrowDropDown,  Home } from "@material-ui/icons";

import { WorkspaceFolder } from "../../DiagramGenerator/vscode/Diagram";
import { useHistoryContext } from "../context/history";

import useStyles from './style';
import './style.scss';
import { PackageIcon } from "../../assets/icons";

interface NavigationBarProps {
    workspaceName: string;
    projectList: WorkspaceFolder[];
    currentProject: WorkspaceFolder;
    updateCurrentProject: (project: WorkspaceFolder) => void;
}


export function NavigationBar(props: NavigationBarProps) {
    const {
        workspaceName,
        projectList,
        currentProject,
        updateCurrentProject,
    } = props;
    const classes = useStyles();
    const { history, historyPop, historyReset } = useHistoryContext();

    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = React.useState(false);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    const isWorkspace = projectList.length > 1;

    const handleProjectChange = (selectedProject: WorkspaceFolder) => {
        updateCurrentProject(selectedProject);
    }

    const renderProjectSelectorComponent = () => {
        const projectSelectorOptions: React.ReactElement[] = [];
        const handlePojectSelectorClose = () => {
            setIsProjectSelectorOpen(false);
        }

        const handlePojectSelectorOpen = () => {
            setIsProjectSelectorOpen(true);
        }

        const handleOptionSelect = (project: WorkspaceFolder) => {
            handlePojectSelectorClose();
            handleProjectChange(project);
        }

        if (projectList && projectList.length > 0) {
            projectList.forEach(project => {
                const handleOptionClick = () => {
                    handleOptionSelect(project);
                }

                projectSelectorOptions.push(
                    <div className={classes.projectSelectorOption} onClick={handleOptionClick}>
                        <span>{project.name}</span>
                    </div>
                );
            });
        }


        return (
            <div className="btn-container" ref={popoverRef} onClick={handlePojectSelectorOpen} >
                <PackageIcon className={'icon'}/>
                <span className="icon-text">{currentProject?.name || ''}</span>
                <ArrowDropDown />
                <Popover
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left', }}
                    title={'Filter'}
                    open={isProjectSelectorOpen}
                    anchorEl={popoverRef ? popoverRef.current : undefined}
                    onClose={handlePojectSelectorClose}
                >
                    <ClickAwayListener
                        mouseEvent="onMouseDown"
                        touchEvent="onTouchStart"
                        onClickAway={handlePojectSelectorClose}
                    >
                        <div className="project-selector-container">
                            {projectSelectorOptions}
                        </div>
                    </ClickAwayListener>
                </Popover>
            </div>
        )
    }

    const renderWorkspaceNameComponent = () => (
        <div className="btn-container" >
            {isWorkspace ? <Apps /> : <PackageIcon className={'icon'} />}
            <span className="icon-text">{`${workspaceName}`}</span>
        </div>
    );

    const renderNavigationButtons = () => {
        return (
            <>
                <div className="btn-container" onClick={historyPop} >
                    <ArrowBack />
                </div>
                <div className="btn-container" onClick={historyReset} >
                    <Home />
                </div>
            </>
        );
    }

    // {renderWorkspaceNameComponent(isWorkspace)}
    return (
        <div id="nav-bar-main" className="header-bar">
            {history.length > 0 && renderNavigationButtons()}
            {renderWorkspaceNameComponent()}
            {isWorkspace && <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center' }} >/</div>}
            {isWorkspace && renderProjectSelectorComponent()}
            <div className="component-details" />
        </div>
    );
}

