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

import { ClickAwayListener, FormControl, InputLabel, Popover, Select } from "@material-ui/core";
import { Apps, ArrowBack, ArrowDropDown, Folder, Home } from "@material-ui/icons";
import classNames from "classnames";

import { FileListEntry, WorkspaceFolder } from "../../DiagramGenerator/vscode/Diagram";
import { useHistoryContext } from "../context/history";

import useStyles from './style';
import './style.scss';

interface NavigationBarProps {
    workspaceName: string;
    projectList: WorkspaceFolder[];
    fileList: FileListEntry[];
    currentProject: WorkspaceFolder;
    currentFile: FileListEntry;
    updateCurrentProject: (project: WorkspaceFolder) => void;
    updateCurrentFile: (file: FileListEntry) => void;
}

const ALL_FILES: string = 'All';

export function NavigationBar(props: NavigationBarProps) {
    // const { projectName, folderName, isWorkspace, onFolderClick } = props;
    const {
        workspaceName, projectList, fileList, currentProject, currentFile, updateCurrentProject, updateCurrentFile
    } = props;
    const classes = useStyles();

    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = React.useState(false);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    const isWorkspace = projectList.length > 1;
    const fileSelectorOptions: React.ReactElement[] = [];

    fileSelectorOptions.push(
        <option value={ALL_FILES}>{ALL_FILES}</option>
    );

    if (fileList && fileList.length > 0) {
        fileList.forEach(fileEntry => [
            fileSelectorOptions.push(
                <option value={fileEntry.fileName}>{fileEntry.fileName}</option>
            )
        ])
    }

    const handleProjectChange = (selectedProject: WorkspaceFolder) => {
        updateCurrentProject(selectedProject);
    }

    const handleFileChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        if (evt.target.value === ALL_FILES) {
            updateCurrentFile(undefined);
        } else {
            const selectedFile = fileList.find(file => file.fileName === evt.target.value);
            updateCurrentFile(selectedFile);
        }
    }

    const renderProjectSelectorComponent = () => {
        // <FormControl variant="outlined" className={classes.selectorComponent} >
        //     <InputLabel htmlFor="outlined-age-native-simple">Project</InputLabel>
        //     <Select
        //         native={true}
        //         value={currentProject?.name || ''}
        //         label="Project"
        //         inputProps={{ name: 'age', id: 'outlined-age-native-simple', }}
        //         onChange={handleProjectChange}
        //     >
        //         {projectSelectorOptions}
        //     </Select>
        // </FormControl>

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
                <Folder />
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
    // const renderFileSelector = () => {
    //     return (
    //         <FormControl variant="outlined" className={classes.selectorComponent} >
    //             <InputLabel htmlFor="outlined-age-native-simple">File</InputLabel>
    //             <Select
    //                 native={true}
    //                 value={currentFile ? currentFile.fileName : ALL_FILES}
    //                 label="File"
    //                 inputProps={{ name: 'age', id: 'outlined-age-native-simple', }}
    //                 onChange={handleFileChange}
    //             >
    //                 {fileSelectorOptions}
    //             </Select>
    //         </FormControl>
    //     )
    // }

    const backButton = (
        <div className="btn-container">
            <ArrowBack />
        </div>
    );

    // const showBackButton: boolean = history.length > 0;
    const renderWorkspaceNameComponent = () => (
        <div className="btn-container" >
            {isWorkspace ? <Apps /> : <Folder />}
            <span className="icon-text">{`${workspaceName}`}</span>
        </div>
    );

    // {renderWorkspaceNameComponent(isWorkspace)}
    return (
        <div id="nav-var-main" className="header-bar">
            {renderWorkspaceNameComponent()}
            {isWorkspace && <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center' }} >/</div>}
            {isWorkspace && renderProjectSelectorComponent()}
            <div className="component-details" />
        </div>
    );
}

