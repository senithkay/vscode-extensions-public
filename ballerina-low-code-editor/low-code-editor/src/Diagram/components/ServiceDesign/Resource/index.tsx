/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useState } from "react";
import { useIntl } from "react-intl";


import { Divider } from "@material-ui/core";
import { ConfigOverlayFormStatus, createResource, getSource, updateResourceSignature } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ConfigPanelSection, SelectDropdownWithButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, RequiredParam, ResourceAccessorDefinition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { Context } from "../../../../Contexts/Diagram";
import { useStyles } from "../style";

import { ResourceHeader } from "./ResourceHeader";

export interface ResourceBodyProps {
    model: ResourceAccessorDefinition;
    handleDiagramEdit: (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
}

export function ResourceBody(props: ResourceBodyProps) {
    const { model, handleDiagramEdit } = props;
    const classes = useStyles();
    const intl = useIntl();

    const [isExpanded, setIsExpanded] = useState(false);

    const handleIsExpand = () => {
        setIsExpanded(!isExpanded)
    }

    const onEdit = (e?: React.MouseEvent) => {
        e.stopPropagation();
        const lastMemberPosition: NodePosition = {
            endColumn: model.position.endColumn,
            endLine: model.position.endLine - 1,
            startColumn: model.position.startColumn,
            startLine: model.position.startLine - 1
        }
        handleDiagramEdit(model, lastMemberPosition, { formType: "ResourceAccessorDefinition", isLoading: false });
    }

    const {
        props: { currentFile, stSymbolInfo, importStatements, syntaxTree: lowcodeST },
        api: {
            code: { modifyDiagram, updateFileContent },
            ls: { getDiagramEditorLangClient, getExpressionEditorLangClient },
            library,
        },
    } = useContext(Context);


    const bodyArgs: any[] = [];

    model.functionSignature.parameters.forEach((param, i) => {
        if (STKindChecker.isRequiredParam(param) && param.source.includes("Payload")) {
            bodyArgs.push(
                <div key={i} className={"signature-param"}>
                    {param.source}
                </div>
            )
        }
    });


    const paramArgs: any[] = [];

    model.functionSignature.parameters.forEach((param, i) => {
        if (STKindChecker.isRequiredParam(param) && !param.source.includes("Payload")) {
            paramArgs.push(
                <div key={i} className={"signature-param"}>
                    {param.source}
                </div>
            )
        }
    });

    const responseArgs: any[] = [];

    model.functionSignature.returnTypeDesc.type.source.split("|").forEach((value, i) => {
        responseArgs.push(
            <div key={i} className={"signature-param"}>
                {value}
            </div>
        )
    })

    const body = (
        <div className="service-member">

            <Divider className="resource-divider" />

            <ConfigPanelSection title={"Parameters"}>
                {paramArgs}
            </ConfigPanelSection>

            <Divider className="resource-divider" />

            <ConfigPanelSection title={"Body"}>
                {bodyArgs}
            </ConfigPanelSection>

            <Divider className="resource-divider" />

            <ConfigPanelSection title={"Responses"}>
                {responseArgs}
            </ConfigPanelSection>

        </div>
    )

    return (
        <div className={classNames("function-box", model.functionName.value)}>
            <ResourceHeader isExpanded={isExpanded} onExpandClick={handleIsExpand} model={model} onEdit={onEdit} />
            {isExpanded && body}
        </div>
    );
}
