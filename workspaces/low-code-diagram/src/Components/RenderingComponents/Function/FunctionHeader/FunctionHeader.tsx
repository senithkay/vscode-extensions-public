/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { SettingsIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    RequiredParam,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { useDiagramContext } from "../../../../Context/diagram";
import { useFunctionContext } from "../../../../Context/Function";

import "./style.scss";


export function FunctionHeader() {
    const { functionNode } = useFunctionContext();
    const diagramContext = useDiagramContext();
    const diagramApi = diagramContext?.api;
    const editApi = diagramApi?.edit;
    const renderEditForm = editApi?.renderEditForm;

    const titleComponents: React.ReactElement[] = [];
    const argumentComponents: React.ReactElement[] = [];

    const handleConfigFormClick = () => {
        renderEditForm(functionNode, functionNode.position, { formType: functionNode.kind, isLoading: false });
    }

    if (STKindChecker.isFunctionDefinition(functionNode)) {
        // TODO: handle general funciton
        titleComponents.push(
            <div className="title-components">{`Function Design - ${functionNode.functionName.value}`}</div>
        );

        functionNode.functionSignature.parameters
            .forEach(param => {
                if (STKindChecker.isRequiredParam(param)
                    || STKindChecker.isDefaultableParam(param)
                    || STKindChecker.isRestParam(param)) {

                    argumentComponents.push(
                        <div className={'argument-item'}>
                            <span className="type-name">{param.typeName.source.trim()}</span>
                            <span className="argument-name">{param.paramName.value}</span>
                        </div>
                    );
                }
            });
    } else if (STKindChecker.isResourceAccessorDefinition(functionNode)) {
        // TODO: handle resource function
        const resourceTitleContent: React.ReactElement[] = [];
        resourceTitleContent.push(
            <span className={classNames("resource-badge", functionNode.functionName.value)}>
                {functionNode.functionName.value.toUpperCase()}
            </span>
        )

        functionNode.relativeResourcePath.forEach(node => {
            if (STKindChecker.isIdentifierToken(node) || STKindChecker.isSlashToken(node)) {
                resourceTitleContent.push(
                    node.value
                );
            } else if (STKindChecker.isResourcePathSegmentParam(node) || STKindChecker.isResourcePathRestParam(node)) {
                resourceTitleContent.push(
                    <>
                        [<span className={'type-descriptor'}>
                            {`${(node as any).typeDescriptor?.name?.value} `}
                        </span>
                        {STKindChecker.isResourcePathRestParam(node) ? '...' : ''}{(node as any).paramName?.value}]
                    </>
                );
            } else if (STKindChecker.isDotToken(node)) {
                resourceTitleContent.push(<>/</>);
            }
        });

        const queryParamComponents: React.ReactElement[] = functionNode.functionSignature.parameters
            .filter((param) => !STKindChecker.isCommaToken(param))
            .filter(
                (param) =>
                    STKindChecker.isRequiredParam(param) &&
                    (STKindChecker.isStringTypeDesc(param.typeName) ||
                        STKindChecker.isIntTypeDesc(param.typeName) ||
                        STKindChecker.isBooleanTypeDesc(param.typeName) ||
                        STKindChecker.isFloatTypeDesc(param.typeName) ||
                        STKindChecker.isDecimalTypeDesc(param.typeName))
            )
            .map((param: RequiredParam, i) => (
                <span key={i}>
                    {i !== 0 ? "&" : ""}
                    {param.paramName.value}
                    <sub className={'type-descriptor'}>{(param.typeName as any)?.name?.value}</sub>
                </span>
            ));

        if (queryParamComponents.length > 0) {
            resourceTitleContent.push(<span>?</span>);
            resourceTitleContent.push(...queryParamComponents);
        }

        titleComponents.push(
            <div className="title-components">
                <div className="content">
                    {resourceTitleContent}
                </div>
            </div>
        )
    } else if (STKindChecker.isObjectMethodDefinition(functionNode)) {
        titleComponents.push(
            <div className="title-components">{`${functionNode.functionName.value}`}</div>
        );

        functionNode.functionSignature.parameters
            .forEach(param => {
                if (STKindChecker.isRequiredParam(param)
                    || STKindChecker.isDefaultableParam(param)
                    || STKindChecker.isRestParam(param)) {

                    argumentComponents.push(
                        <div className={'argument-item'}>
                            <span className="type-name">{param.typeName.source.trim()}</span>
                            <span className="argument-name">{param.paramName.value}</span>
                        </div>
                    );
                }
            });
    }

    titleComponents.push(
        <div className="config-form-icon" onClick={handleConfigFormClick}>
            <SettingsIcon />
            <div className="config-form-icon-text">Configure Interface</div>
        </div>
    );

    return (
        <>
            <div className="title-container">
                {titleComponents}
            </div>
            <div className="argument-container">{argumentComponents}</div>
        </>
    )
}

