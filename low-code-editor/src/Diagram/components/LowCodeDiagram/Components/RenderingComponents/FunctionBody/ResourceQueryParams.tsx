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
    IdentifierToken,
    IncludedRecordParam,
    RequiredParam,
    RestParam,
    SlashToken,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import "./style.scss";

interface ResourceQueryParamsProps {
    parameters: (
        | CommaToken
        | DefaultableParam
        | IncludedRecordParam
        | RequiredParam
        | RestParam
    )[];
    relativeResourcePath: (IdentifierToken | SlashToken)[];
}

export function ResourceQueryParams(props: ResourceQueryParamsProps) {
    const { parameters, relativeResourcePath } = props;

    const pathElements = relativeResourcePath.map(relativePath => {
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
                return relativePath.value
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
            <p className={"path-text"}>
                {pathElements.length === 1 && pathElements[0] === '.' ? "/" : pathElements}
                {queryParamComponents.length > 0 ? "?" : ""}
                {queryParamComponents}
            </p>
        </div>
    );
}
