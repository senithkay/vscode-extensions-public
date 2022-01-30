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
import React, { useContext } from "react";

import { ResourceAccessorDefinition } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { removeStatement } from "../../../../../utils/modification-util";
import { Context } from "../../../Context/diagram";
import { HeaderActions } from "../../../HeaderActions";
import { HeaderWrapper } from "../../../HeaderWrapper";

import { ResourceOtherParams } from "./ResourceOtherParams";
import { ResourceQueryParams } from "./ResourceQueryParams";
import "./style.scss";

interface ResourceHeaderProps {
    model: ResourceAccessorDefinition;
    onExpandClick: () => void;
    isExpanded: boolean;
}

export function ResourceHeader(props: ResourceHeaderProps) {
    const { model, onExpandClick, isExpanded } = props;

    const {
        api: {
            edit: {
                deleteComponent
            }
        },
    } = useContext(Context);

    const onDeleteClick = () => {
        deleteComponent(model);
    };

    return (
        <HeaderWrapper
            className={classNames("function-signature", model.functionName.value)}
            onClick={onExpandClick}
        >
            <div className={classNames("resource-badge", model.functionName.value)}>
                <p className={"text"}>{model.functionName.value.toUpperCase()}</p>
            </div>
            <div className="param-wrapper">
                <ResourceQueryParams
                    parameters={model.functionSignature.parameters}
                    relativeResourcePath={model.relativeResourcePath}
                />
                <ResourceOtherParams parameters={model.functionSignature.parameters} />
            </div>
            <HeaderActions
                model={model}
                deleteText="Are you sure you want to delete resource?"
                isExpanded={isExpanded}
                onExpandClick={onExpandClick}
                onConfirmDelete={onDeleteClick}
            />
        </HeaderWrapper >
    );
}
