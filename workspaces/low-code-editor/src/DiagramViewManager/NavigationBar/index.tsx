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

import { FormControl, InputLabel, Select } from "@material-ui/core";
import { Apps, ArrowBack, Folder, Home } from "@material-ui/icons";

import { useHistoryContext } from "../context/history";

import useStyles from './style';
import './style.scss';
import { FileListEntry, WorkspaceFolder } from "../../DiagramGenerator/vscode/Diagram";

interface NavigationBarProps {
    projectList: WorkspaceFolder[];
    fileList: FileListEntry[];
    currentProject: WorkspaceFolder;
    currentFile: FileListEntry;
    updateCurrentProject: (project: WorkspaceFolder) => void;
    updateCurrentFile: (file: FileListEntry) => void;
    // projectName: string;
    // isWorkspace: boolean;
    // folderName?: string;
    // onFolderClick?: () => void;
}

const ALL_FILES: string = 'All';

export function NavigationBar(props: NavigationBarProps) {
    // const { projectName, folderName, isWorkspace, onFolderClick } = props;
    const { projectList, fileList, currentProject, currentFile, updateCurrentProject } = props;
    const classes = useStyles();

    const projectSelectorOptions: React.ReactElement[] = [];
    const fileSelectorOptions: React.ReactElement[] = [];

    fileSelectorOptions.push(
        <option value={ALL_FILES}>{ALL_FILES}</option>
    );
    if (projectList && projectList.length > 0) {
        projectList.forEach(project => {
            projectSelectorOptions.push(
                <option value={project.name}>{project.name}</option>
            );
        });
    }

    if (fileList && fileList.length > 0) {
        fileList.forEach(fileEntry => [
            fileSelectorOptions.push(
                <option value={fileEntry.fileName}>{fileEntry.fileName}</option>
            )
        ])
    }

    const handleProjectChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        const currentProject = projectList.find(project => project.name === evt.target.value);
        updateCurrentProject(currentProject);
    }

    const renderProjectSelectorComponent = () => {
        return (
            <FormControl variant="outlined" className={classes.selectorComponent} >
                <InputLabel htmlFor="outlined-age-native-simple">Project</InputLabel>
                <Select
                    native={true}
                    value={currentProject?.name || ''}
                    label="Project"
                    inputProps={{ name: 'age', id: 'outlined-age-native-simple', }}
                    onChange={handleProjectChange}
                >
                    {projectSelectorOptions}
                </Select>
            </FormControl>
        )
    }
    const renderFileSelector = () => {
        return (
            <FormControl variant="outlined" className={classes.selectorComponent} >
                <InputLabel htmlFor="outlined-age-native-simple">File</InputLabel>
                <Select
                    native={true}
                    value={currentFile ? currentFile.fileName : ALL_FILES}
                    label="File"
                    inputProps={{ name: 'age', id: 'outlined-age-native-simple', }}
                >
                    {fileSelectorOptions}
                </Select>
            </FormControl>
        )
    }

    // {renderWorkspaceNameComponent(isWorkspace)}
    return (
        <div id="nav-var-main" className="header-bar">
            {renderProjectSelectorComponent()}
            <div className={classes.componentSeperator} >/</div>
            {renderFileSelector()}
            <div className="component-details" />
        </div>
    );
}

