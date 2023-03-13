/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import React from "react";

import {
    DesignViewIcon,
    GraphqlMutationIcon,
    GraphqlQueryIcon,
    GraphqlSubscriptionIcon,
    LabelDeleteIcon,
    LabelEditIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ComponentExpandButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ObjectMethodDefinition, ResourceAccessorDefinition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { useHistoryContext } from "../../../../../../DiagramViewManager/context/history";
import { ComponentViewInfo } from "../../../../../../OverviewDiagram/util";


interface OperationHeaderProps {
    model: ResourceAccessorDefinition | ObjectMethodDefinition;
    onExpandClick: () => void;
    isExpanded: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export function OperationHeader(props: OperationHeaderProps) {
    const { model, onExpandClick, isExpanded, onEdit, onDelete } = props;

    const { history } = useHistoryContext();
    const { api: { navigation: { updateSelectedComponent } } } = useDiagramContext();

    const handleResourceHeaderClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        const currentElementInfo = history[history.length - 1];
        const componentViewInfo: ComponentViewInfo = {
            filePath: currentElementInfo.file,
            position: model.position
        };
        updateSelectedComponent(componentViewInfo);
    };

    const pathElements = model.relativeResourcePath.map((relativePath: { kind: any; value: any; }) => {
        switch (relativePath.kind) {
            case 'ResourcePathSegmentParam':
                return (
                    <>
                        [<span className={'type-descriptor'}>
                            {`${(relativePath as any).typeDescriptor?.name?.value} `}
                        </span>
                        {(relativePath as any).paramName?.value}]
                    </>
                );
            default:
                return relativePath.value;
        }
    });

    const headerIcon = () => {
        if (STKindChecker.isResourceAccessorDefinition(model)) {
            if (model.functionName.value === "subscribe") {
                return <GraphqlSubscriptionIcon/>;
            } else {
                return <GraphqlQueryIcon/>;
            }
        } else {
            return <GraphqlMutationIcon/>;
        }
    };


    return (
        <div
            className={classNames("function-signature", model.functionName.value)}
            onClick={onExpandClick}
        >
            <div className="param-wrapper">
                <div className={"param-container"}>
                    <p className={"path-text"}>
                        {headerIcon()}
                    </p>
                    <p className={"path-text"}>
                        {
                            STKindChecker.isObjectMethodDefinition(model) ? model.functionName.value :
                                (pathElements.length === 1 && pathElements[0] === '.' ? "/" : pathElements)
                        }
                        <span>&nbsp;</span>
                    </p>
                </div>
            </div>
            <div className="menu-option" onClick={handleResourceHeaderClick}>
                <div className={classNames("icon", "icon-adjust")}>
                    <DesignViewIcon/>
                </div>
            </div>
            <div className="menu-option" onClick={onEdit}>
                <div className={classNames("icon", "icon-adjust")}>
                    <LabelEditIcon/>
                </div>
            </div>
            <div
                onClick={onDelete}
                className={classNames("menu-option", "right")}
                id="delete-button"
            >
                <div className={classNames("icon", "icon-adjust")}>
                    <LabelDeleteIcon/>
                </div>
            </div>
            <ComponentExpandButton
                isExpanded={isExpanded}
                onClick={onExpandClick}
            />
        </div>
    );
}
