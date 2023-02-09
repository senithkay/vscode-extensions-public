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

interface NavigationBarProps {
    projectName: string;
    isWorkspace: boolean;
    folderName?: string;
    onFolderClick?: () => void;
}

export function NavigationBar(props: NavigationBarProps) {
    const { projectName, folderName, isWorkspace, onFolderClick } = props;
    const classes = useStyles();

    const renderProjectSelectorComponent = () => {
        return (
            <FormControl variant="outlined" className={classes.selectorComponent} >
                <InputLabel htmlFor="outlined-age-native-simple">Project</InputLabel>
                <Select
                    native={true}
                    value={'10'}
                    label="Project"
                    inputProps={{ name: 'age', id: 'outlined-age-native-simple', }}
                >
                    <option aria-label="None" value="" />
                    <option value={10}>Ten</option>
                    <option value={20}>Twenty</option>
                    <option value={30}>Thirty</option>
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
                    value={'10'}
                    label="File"
                    inputProps={{ name: 'age', id: 'outlined-age-native-simple', }}
                >
                    <option aria-label="None" value="" />
                    <option value={10}>Ten</option>
                    <option value={20}>Twenty</option>
                    <option value={30}>Thirty</option>
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
            <div className="component-details"/>
        </div>
    );
}

