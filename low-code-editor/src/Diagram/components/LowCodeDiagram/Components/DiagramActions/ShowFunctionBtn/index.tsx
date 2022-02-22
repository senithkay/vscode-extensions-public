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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useState } from "react";

import { STModification } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { FunctionDefinition, IdentifierToken, SimpleNameReference, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../Contexts/Diagram";
import { StatementViewState } from "../../../ViewState";
import { FunctionBody } from "../../RenderingComponents/FunctionBody";

import { HideFunctionSVG } from "./HideFunctionSVG";
import { ShowFunctionSVG } from "./ShowFunctionSVG";
import "./style.scss";

export interface ShowFunctionBtnProps {
    x: number;
    y: number;
    model: STNode;
    functionName: SimpleNameReference;
    toolTipTitle?: string;
    isButtonDisabled?: boolean;
    onDraftDelete?: () => void;
    createModifications?: (model: STNode) => STModification[];
}

export function ShowFuntionBtn(props: ShowFunctionBtnProps) {
    const {
        props: { isReadOnly, stSymbolInfo, syntaxTree },
        api: { code: { getFunctionDef } },
        actions: { diagramRedraw }
    } = useContext(Context);

    const { model, onDraftDelete, createModifications, toolTipTitle, isButtonDisabled, functionName, ...xyProps } = props;

    const [isConfirmDialogActive, setConfirmDialogActive] = useState(false);
    const [, setBtnActive] = useState(false);
    const [functionBlock, setFunctionBlock] = useState(null);
    // const [functionBBox, setFunctionBBox] = useState(null);
    const nodeViewState: StatementViewState = model.viewState;



    // const modifications: STModification[] = [];

    // const onMouseEnter = () => {
    //     setBtnActive(true);
    // };

    // const onMouseLeave = () => {
    //     // if confirm dialog is active keep btn active,
    //     // else hide on mouse leave
    //     setBtnActive(isConfirmDialogActive);
    //     // setConfirmDialogActive(false);
    // };

    const onBtnClick = async () => {
        if (isConfirmDialogActive) {
            nodeViewState.functionNodeExpanded = false;
            diagramRedraw(syntaxTree);
            setConfirmDialogActive(false);
        } else {

            // setFunctionBBox(model.viewState.bBox);
            const functionDiagram: FunctionDefinition = (syntaxTree as any).members
                .filter((member: any) => STKindChecker.isFunctionDefinition(member)
                    && member.functionName.value === functionName.value)[0];
            // const funcViewState: FunctionViewState = functionDiagram.viewState;
            // console.log("functionDiagram viewState", funcViewState.bBox);
            // console.log("nodeViewState viewState", nodeViewState.bBox);
            const def = getFunctionDef(functionName);
            console.log("Boom", def);



            // model.viewState.bBox = funcViewState.bBox;
            nodeViewState.functionNode = functionDiagram;
            nodeViewState.functionNodeExpanded = true;
            diagramRedraw(syntaxTree);
            setConfirmDialogActive(true);
            setFunctionBlock(functionDiagram);
        }

    };

    const closeConfirmDialog = () => {
        setConfirmDialogActive(false);
        // setBtnActive(false);
    };

    // const onDeleteConfirm = () => {
    //     // delete logic
    //     if (model) {



    //     } else if (onDraftDelete) {
    //         onDraftDelete();
    //     }
    // };

    // const callStatement: CallStatement = model as CallStatement;
    // const stmtFunctionCall: FunctionCall = callStatement.expression as FunctionCall;
    // const nameRef: SimpleNameReference = stmtFunctionCall.functionName as SimpleNameReference;


    // const functionBlock: FunctionBodyBlock = block.functionBody as FunctionBodyBlock;

    // const viewState: BlockViewState = {}
    return (
        <svg className="expand-expression">
            <g>
                {!isReadOnly &&
                    <g>
                        <g
                            className="expand-icon-show"
                            data-testid="func-expand-btn"
                            onClick={onBtnClick}
                        >
                            {!isConfirmDialogActive ? <ShowFunctionSVG {...xyProps} /> : <HideFunctionSVG {...xyProps} />}
                        </g>

                        {isConfirmDialogActive &&
                            <g>
                                <FunctionBody model={functionBlock} onClose={closeConfirmDialog} {...xyProps} />
                            </g>
                        }
                    </g>
                }
            </g>
        </svg>
    );
}
