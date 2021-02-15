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
import React, { ReactNode, useContext, useState } from "react";

import { STKindChecker } from "@ballerina/syntax-tree";
import { Divider } from "@material-ui/core";
import cn from "classnames";

import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { isSTResourceFunction } from "../../../../../../../utils/st-util";
import { PlusViewState } from "../../../../../../../view-state/plus";
import Tooltip from "../../../../../ConfigForm/Elements/Tooltip";
import { tooltipMessages } from "../../../../../utils/constants";
import "../../style.scss";

export const PROCESS_TYPES = [""];

export interface StatementOptionsProps {
    onSelect: (type: string) => void;
    viewState: PlusViewState,
}

export interface StatementComponent {
    name: string;
    component: ReactNode;
    category: string;
}

export interface Statements {
    statement: StatementComponent[];
    selectedCompoent: string;
}

export function StatementOptions(props: StatementOptionsProps) {
    const { state } = useContext(DiagramContext);
    const { syntaxTree } = state;
    const isResource = STKindChecker.isFunctionDefinition(syntaxTree) && isSTResourceFunction(syntaxTree);
    const { onSelect, viewState } = props;
    const logStm: StatementComponent = {
        name: "log",
        category: 'process',
        component:
            (
                <Tooltip
                    title={tooltipMessages.logStatement.title}
                    placement="left"
                    arrow={true}
                    codeSnippet={true}
                    example={true}
                    interactive={true}
                    content={tooltipMessages.logStatement.content}
                >
                    <div className="sub-option enabled" data-testid="addLog" onClick={onSelect.bind(undefined, "Log")}>
                        <div className="icon-wrapper">
                            <img src="../../../../../../images/Log.svg" />
                        </div>
                        <div className="text-label">Log</div>
                    </div>
                </Tooltip>
            )
    }
    const propertyStm: StatementComponent = {
        name: "variable",
        category: 'process',
        component: (
            <Tooltip
                title={tooltipMessages.variableStatement.title}
                placement="right"
                arrow={true}
                example={true}
                codeSnippet={true}
                interactive={true}
                content={tooltipMessages.variableStatement.content}
            >
                <div className="sub-option enabled" data-testid="addVariable" onClick={onSelect.bind(undefined, "Variable")}>
                    <div className="icon-wrapper">
                        <img src="../../../../../../images/Property.svg" />
                    </div>
                    <div className="text-label">Variable</div>
                </div>
            </Tooltip>
        )
    }
    const ifStm: StatementComponent = {
        name: "if",
        category: 'condition',
        component: (
            <Tooltip
                title={tooltipMessages.ifStatement.title}
                placement="left"
                arrow={true}
                example={true}
                interactive={true}
                codeSnippet={true}
                content={tooltipMessages.ifStatement.content}
            >
                <div className="sub-option enabled" data-testid="addIf" onClick={onSelect.bind(undefined, "If")}>
                    <div className="icon-wrapper">
                        <img src="../../../../../../images/If.svg" />
                    </div>
                    <div className="text-label">If</div>
                </div>
            </Tooltip>
        )
    }
    const foreachStm: StatementComponent = {
        name: "foreach",
        category: 'condition',
        component: (
            <Tooltip
                title={tooltipMessages.foreachStatement.title}
                placement="right"
                arrow={true}
                example={true}
                codeSnippet={true}
                interactive={true}
                content={tooltipMessages.foreachStatement.content}
            >
                <div className="sub-option enabled" data-testid="addForeach" onClick={onSelect.bind(undefined, "ForEach")} >
                    <div className="icon-wrapper">
                        <img src="../../../../../../images/Foreach.svg" />
                    </div>
                    <div className="text-label">ForEach</div>
                </ div>
            </Tooltip>
        )
    }
    const returnStm: StatementComponent = {
        name: "return",
        category: 'stop',
        component: (
            <Tooltip
                title={tooltipMessages.returnStatement.title}
                placement="left"
                arrow={true}
                disabled={!(!isResource && viewState.isLast)}
                example={true}
                interactive={true}
                codeSnippet={true}
                content={tooltipMessages.returnStatement.content}
            >
                <div
                    data-testid="addReturn"
                    className={cn("sub-option", { enabled: !isResource && viewState.isLast })}
                    onClick={!isResource ? onSelect.bind(undefined, 'Return') : null}
                >
                    <div className="icon-wrapper">
                        <img src="../../../../../../images/Return.svg" />
                    </div>
                    <div className="text-label">Return</div>
                </div>
            </Tooltip>
        )
    }
    const respondStm: StatementComponent = {
        name: "respond",
        category: 'stop',
        component: (
            <Tooltip
                title={tooltipMessages.respondStatement.title}
                placement="right"
                arrow={true}
                disabled={!isResource}
                example={true}
                interactive={true}
                codeSnippet={true}
                content={tooltipMessages.respondStatement.content}
            >
                <div
                    className={cn("sub-option", "product-tour-stop-respond", { enabled: isResource })}
                    data-testid="addrespond"
                    onClick={isResource ? onSelect.bind(undefined, 'Respond') : null}
                >
                    <div className="icon-wrapper">
                        <img src="../../../../../../images/Respond.svg" />
                    </div>
                    <div className="text-label">Respond</div>
                </div>
            </Tooltip>
        )
    }

    const statements: StatementComponent[] = [];
    statements.push(logStm);
    statements.push(propertyStm);
    statements.push(ifStm);
    statements.push(foreachStm);
    statements.push(returnStm);
    statements.push(respondStm);

    const initStatements: Statements = {
        statement: statements,
        selectedCompoent: ""
    };
    const [selectedCompName, setSelectedCompName] = useState("");

    const handleSearchChange = (evt: any) => {
        setSelectedCompName(evt.target.value);
    };


    const processComp: ReactNode[] = [];
    const conditionComp: ReactNode[] = [];
    const stopComp: ReactNode[] = [];
    if (selectedCompName !== "") {
        const stmts: StatementComponent[] = initStatements.statement.filter(el => el.name.toLowerCase().includes(selectedCompName.toLowerCase()));
        stmts.forEach((stmt) => {
            if (stmt.category === "process") {
                processComp.push(stmt.component);
            } else if (stmt.category === "condition") {
                conditionComp.push(stmt.component);
            } else if (stmt.category === "stop") {
                stopComp.push(stmt.component);
            }
        });
    } else {
        initStatements.statement.forEach((stmt) => {
            if (stmt.category === "process") {
                processComp.push(stmt.component);
            } else if (stmt.category === "condition") {
                conditionComp.push(stmt.component);
            } else if (stmt.category === "stop") {
                stopComp.push(stmt.component);
            }
        });
    }

    return (
        <>
            <div className="search-options-wrapper">
                <label>Choose from list</label>

                <input
                    type="search"
                    placeholder="Search"
                    value={selectedCompName}
                    onChange={handleSearchChange}
                    className='search-wrapper'
                />
            </div>
            <div className="element-option-holder" >
                <div className="options-wrapper">
                    {(processComp.length > 0 ? <Divider /> : null)}
                    {processComp}
                    {(conditionComp.length > 0 ? <Divider /> : null)}
                    {conditionComp}
                    {(stopComp.length > 0 ? <Divider /> : null)}
                    {stopComp}
                </div>
            </div>
        </>
    );
}
