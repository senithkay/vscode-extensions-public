/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useEffect, useState } from "react";

import { Tooltip } from "@material-ui/core";
import {
    DesignViewIcon, EditIcon, ErrorIcon, LabelDeleteIcon, LabelEditIcon, STModification, WarningIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ComponentExpandButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, ResourceAccessorDefinition } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { useDiagramContext } from "../../../../Contexts/Diagram";
import { useHistoryContext } from "../../../../DiagramViewManager/context/history";
import { ComponentViewInfo } from "../../../../OverviewDiagram/util";
import "../style.scss";

import { ResourceQueryParams } from "./ResourceQueryParams";

interface ResourceHeaderProps {
    id: number;
    model: ResourceAccessorDefinition;
    onExpandClick: () => void;
    isExpanded: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export function ResourceHeader(props: ResourceHeaderProps) {
    const { id, model, onExpandClick, isExpanded, onEdit, onDelete } = props;
    const { history } = useHistoryContext();
    const { api: { navigation: { updateSelectedComponent } } } = useDiagramContext();

    const handleResourceHeaderClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        const currentElementInfo = history[history.length - 1];
        const componentViewInfo: ComponentViewInfo = {
            filePath: currentElementInfo.file,
            position: model.position
        }
        updateSelectedComponent(componentViewInfo);
    }

    return (
        <div
            className={classNames("function-signature", model.functionName.value)}
            onClick={onExpandClick}
            data-testid={`resource-header-${id}`}
        >
            <div className={classNames("resource-badge", model.functionName.value)} data-testid={`resource-type-${id}`}>
                <p className={"text"}><b> {model.functionName.value.toUpperCase()} </b></p>
            </div>
            <div className="param-wrapper" data-testid={`resource-query-params-${id}`}>
                <ResourceQueryParams
                    id={id}
                    parameters={model.functionSignature.parameters}
                    relativeResourcePath={model.relativeResourcePath}
                />
            </div>
            <Tooltip title="Low-Code view" placement="right" enterDelay={1000} enterNextDelay={1000}>
                <div className="menu-option" onClick={handleResourceHeaderClick}>
                    <div className={classNames("icon", "icon-adjust")} data-testid={`design-view-icon-${id}`}>
                        <DesignViewIcon />
                    </div>
                </div>
            </Tooltip>
            <Tooltip title="Edit resource" placement="right" enterDelay={1000} enterNextDelay={1000}>
                <div className="menu-option" onClick={onEdit}>
                    <div className={classNames("icon", "icon-adjust")} data-testid={`resource-edit-icon-${id}`}>
                        <LabelEditIcon />
                    </div>
                </div>
            </Tooltip>
            <Tooltip title="Delete resource" placement="right" enterDelay={1000} enterNextDelay={1000}>
                <div
                    onClick={onDelete}
                    className={classNames("menu-option", "right")}
                    id="delete-button"
                >
                    <div className={classNames("icon", "icon-adjust")} data-testid={`resource-delete-icon-${id}`}>
                        <LabelDeleteIcon />
                    </div>
                </div>
            </Tooltip>
            <div className="menu-option" data-testid={`resource-expand-button-${id}`}>
                <ComponentExpandButton
                    isExpanded={isExpanded}
                    onClick={onExpandClick}
                />
            </div>
        </div >
    );
}
