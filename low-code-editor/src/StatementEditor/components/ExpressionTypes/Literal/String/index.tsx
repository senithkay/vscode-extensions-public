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
import React, {useRef, useState} from "react";

import {STNode, StringLiteral} from "@ballerina/syntax-tree";

import * as c from "../../../../constants";
import {addExpression, SuggestionItem} from "../../../../utils/utils";
import {statementEditorStyles} from "../../../ViewContainer/styles";

interface LiteralProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void
}

export function StringLiteralC(props: LiteralProps) {
    const overlayClasses = statementEditorStyles();
    const {model, callBack} = props;

    const [isDoubleClick, setIsDoubleClick] = useState(false);
    const [literal, setLiteral] = useState("");
    const inputRef = useRef(null);

    let literalModel: StringLiteral;
    let value: any;

    if (model.kind === "StringLiteral") {
        literalModel = model as StringLiteral;
        value = literalModel.literalToken.value;
    }

    const doubleClickHandler = () => {
        setIsDoubleClick(false);
    };

    const inputBlurHandler = () => {
        if (literal !== "") {
            addExpression(model, c.LITERAL, literal)
            callBack([], model, false);
        }
    };

    const inputChangeHandler = (event: React.KeyboardEvent<HTMLSpanElement>) => {

        setLiteral(event.currentTarget.textContent ? event.currentTarget.textContent : "");
    };

    const inputEnterHandler = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (event.code === "Enter" || event.code === "Tab") {
            addExpression(model, c.LITERAL, event.currentTarget.textContent);
            callBack([], model, false);
        }

    };

    return (
        <>
            {isDoubleClick ? (
                <span
                    className={`${overlayClasses.AppExpressionBlock } ${overlayClasses.AppExpressionBlockElement}`}
                    onDoubleClick={doubleClickHandler}
                >
                    {value}
                </span>
            ) : (
                <span
                    onKeyDown={inputEnterHandler}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={inputBlurHandler}
                    onInput={inputChangeHandler}
                    ref={inputRef}
                >
                    {value}
                </span>
            )}
        </>
    );
}
