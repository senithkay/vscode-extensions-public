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
import React from "react";

import {
    AnyTypeDesc,
    CommaToken,
    DefaultableParam,
    DotToken,
    IdentifierToken,
    IncludedRecordParam,
    RequiredParam,
    ResourcePathRestParam,
    ResourcePathSegmentParam,
    RestParam,
    SlashToken,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import "./style.scss";

interface ResourceQueryParamsProps {
    id: number;
    parameters: (
        | CommaToken
        | DefaultableParam
        | IncludedRecordParam
        | RequiredParam
        | RestParam
    )[];
    relativeResourcePath: (DotToken | IdentifierToken | ResourcePathRestParam | ResourcePathSegmentParam | SlashToken)[];
}

export function ResourceQueryParams(props: ResourceQueryParamsProps) {
    const { id, parameters, relativeResourcePath } = props;

    const pathElements = relativeResourcePath.map((node, index) => {
        if (STKindChecker.isIdentifierToken(node) || STKindChecker.isSlashToken(node)) {
            return node.value
        } else if (STKindChecker.isResourcePathSegmentParam(node) || STKindChecker.isResourcePathRestParam(node)) {
            return (
                <div data-testid={`resource-${id}-path-param-${index}`}>
                    [<span className={'type-descriptor'} data-testid={`resource-${id}-path-param-${index}-type-desc`}>
                        {`${(node as any).typeDescriptor?.name?.value} `}
                    </span>
                    {STKindChecker.isResourcePathRestParam(node) ? '...' : ''}{(node as any).paramName?.value}]
                </div>
            );
        } else if (STKindChecker.isDotToken(node)) {
            return (<>/</>);
        }
    });

    const queryParamComponents = parameters
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
                <sub className={'type-descriptor'}>{(param.typeName as AnyTypeDesc)?.name?.value}</sub>
            </span>
        ));

    return (
        <div className={"param-container"}>
            <p className={"path-text"} data-testid={`resource-${id}-relative-resource-path`}>
                {pathElements.length === 1 && pathElements[0] === '.' ? "/" : pathElements}
                <span>&nbsp;</span>
            </p>
        </div>
    );
}
