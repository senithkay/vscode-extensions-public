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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React from "react";

import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { ArrayType } from "../../constants";
import { ExpressionComponent } from "../Expression";
import { ExpressionArrayElementComponent } from "../ExpressionArrayElement";
import { TokenComponent } from "../Token";

export interface ExpressionArrayProps {
    expressions: STNode[];
    modifiable?: boolean;
    arrayType?: ArrayType
}

export function ExpressionArrayComponent(props: ExpressionArrayProps) {
    const { expressions, modifiable, arrayType } = props;

    const [hoverIndex, setHoverIndex] = React.useState(null);

    const onMouseEnter = (e: React.MouseEvent , index: number) => {
        setHoverIndex(index);
        e.preventDefault();
    }

    const onMouseLeave = (e: React.MouseEvent) => {
        setHoverIndex(null);
        e.preventDefault();
    }

    return (
        <span onMouseLeave={onMouseLeave}>
            { expressions.map((expression: STNode, index: number) => {
                return (STKindChecker.isCommaToken(expression))
                ? (
                     <TokenComponent key={index} model={expression} />
                ) : (
                    <ExpressionArrayElementComponent
                        expression={expression}
                        modifiable={modifiable}
                        arrayType={arrayType}
                        index={index}
                        length={expressions.length}
                        onMouseEnterCallback={onMouseEnter}
                        isHovered={hoverIndex === index}
                    >
                        <ExpressionComponent
                            key={index}
                            model={expression}
                        />
                    </ExpressionArrayElementComponent>
                )
            })}
        </span>
    );
}
