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
// tslint:disable: jsx-no-multiline-js
import React, { useMemo } from "react";

import { ClickAwayListener, Popover } from "@material-ui/core";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { Apps, ArrowBack, ArrowDropDown, Description } from "@material-ui/icons";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { PackageIcon } from "../../../assets/icons";
import { WorkspaceFolder } from "../../../DiagramGenerator/vscode/Diagram";
import { useHistoryContext } from "../../context/history";
import { extractFilePath, getFileNameFromPath, isPathEqual } from "../../utils";

import { NavButtonGroup } from "./NavButtonGroup";
import useStyles from './style';
import './style.scss';

interface NavigationBarProps {
    workspaceName: string;
    projectList: WorkspaceFolder[];
    projectInfo: BallerinaProjectComponents;
}

export function NavigationBar(props: NavigationBarProps) {
    const {
        workspaceName,
        projectList,
        projectInfo
    } = props;
    const classes = useStyles();
    const { history, historySelect, historyPush, historyClearAndPopulateWith } = useHistoryContext();
    const currentHistoryEntry = history.length > 0 ? history[history.length - 1] : undefined;
    const currentProject = projectList && projectList.length > 0
        && projectList.find(project => currentHistoryEntry?.file.includes(extractFilePath(project.uri.path))) || undefined;

    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = React.useState(false);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    const treatAsWorkspace = projectList && projectList.length > 1 && currentProject;

    const isRootDataMapper = history.length > 0
        && history[history.length - 1].fromDataMapper
        && history[history.length - 1].dataMapperDepth === 0;

    const handleProjectChange = (selectedProject: WorkspaceFolder) => {
        if (currentProject && isPathEqual(selectedProject.uri.path, currentProject.uri.path)) return;
        historyPush({ file: extractFilePath(selectedProject.uri.path) });
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
                <PackageIcon className={'icon'} />
                <Typography variant="h4">{currentProject?.name || ''}</Typography>
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

    const renderWorkspaceNameComponent = () => {
        const handleOnClick = () => {
            if (projectInfo?.packages && projectInfo?.packages.length > 0) {
                historyClearAndPopulateWith({ file: extractFilePath(projectInfo?.packages[0]?.filePath) });
            }
        }

        let nameContent: string = workspaceName;
        let icon: React.ReactElement = <Apps className={'workspace-icon'} />;

        if (!treatAsWorkspace) {
            icon = <PackageIcon className={'icon'} />;
            const packageInformation = projectInfo?.packages[0];
            const packageName = packageInformation?.name;
            const packagePath = packageInformation?.filePath;
            if (packageName === '.' && packagePath.endsWith('.bal')) {
                nameContent = getFileNameFromPath(packagePath);
                icon = <Description className={'icon'} />;
            } else if (packageName) {
                nameContent = packageName;
            }
        }

        return (
            <div className="btn-container" onClick={handleOnClick} >
                {icon}
                <Typography variant="h4">
                    {nameContent}
                </Typography>
            </div>
        )
    };


    const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        const index: number = +event.currentTarget.getAttribute('data-index');
        historySelect(index);
    };

    const [activeLink, links] = useMemo(() => {
        if (isRootDataMapper && history.length > 0) {
            if (history.length === 1) {
                // TODO: Fix with the proper function name when updating the history entry
                history[0].name = 'Data Mapper Root';
            }
            let label = history[history.length - 1]?.name;
            const selectedLink = (
                <Typography className={classes.active}>
                    {label}
                </Typography>
            );

            const restLinks = history.length > 1 && (
                history.slice(0, -1).map((node, index) => {
                    label = node?.name;
                    return (
                        <Link
                            data-index={index}
                            key={index}
                            underline="hover"
                            onClick={handleClick}
                            className={classes.link}
                            data-testid={`dm-header-breadcrumb-${index}`}
                        >
                            {label}
                        </Link>
                    );
                })
            );

            return [selectedLink, restLinks];
        }
        return [undefined, undefined];
    }, [history, isRootDataMapper]);

    return (
        <div id="nav-bar-main" className="header-bar">
            {<NavButtonGroup currentProjectPath={projectInfo?.packages[0]?.filePath} />}
            {renderWorkspaceNameComponent()}
            {treatAsWorkspace && <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center' }} >/</div>}
            {treatAsWorkspace && renderProjectSelectorComponent()}
            {isRootDataMapper ? (
                <Breadcrumbs
                    maxItems={3}
                    separator={<NavigateNextIcon fontSize="small" />}
                    className={classes.breadcrumb}
                >
                    {links}
                    {activeLink}
                </Breadcrumbs>
            ) :
                (
                    <div className="component-details" />
                )
            }
        </div>
    );

}

