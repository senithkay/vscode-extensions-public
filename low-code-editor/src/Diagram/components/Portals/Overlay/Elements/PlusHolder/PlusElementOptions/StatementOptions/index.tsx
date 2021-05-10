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
// tslint:disable: jsx-no-multiline-js, ordered-imports
import React, { ReactNode, useContext, useState } from "react";

import { STKindChecker } from "@ballerina/syntax-tree";
import { Divider } from "@material-ui/core";
import cn from "classnames";

import { LogIcon, PropertyIcon, IfIcon, ForEachIcon, ReturnIcon, RespondIcon, CustomStatementIcon } from "../../../../../../../../assets/icons";

import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { isSTResourceFunction } from "../../../../../../../utils/st-util";
import { PlusViewState } from "../../../../../../../view-state/plus";
import Tooltip from "../../../../../../../../components/Tooltip";
import "../../style.scss";
import While from "../../../../../../../../assets/icons/While";
import { FormattedMessage, useIntl } from "react-intl";

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
    const intl = useIntl();
    const { syntaxTree } = state;
    const isResource = STKindChecker.isFunctionDefinition(syntaxTree) && isSTResourceFunction(syntaxTree);
    const { onSelect, viewState } = props;

    const plusHolderStatementTooltipMessages = {
        logStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.log.tooltip.title",
                defaultMessage: "A log statement  logs an event with an information statement or an error that occurs in a service or an integration. If the event has not yet occured, you can view the logs from the Run and Test  console. If the event has occured, you can view ithe logs from the Observability page."
            })},
        variableStatement: {
        title: intl.formatMessage({
            id: "lowcode.develop.plusHolder.plusElements.statements.variable.tooltip.title",
            defaultMessage: "A variable statement holds a value of a specific data type (string, integer, etc.,) so that it can be used later in the logical process of the service/integration."
        })},
        ifStatement: {
        title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.if.tooltip.title",
                defaultMessage: "An IF statement allows you to specifiy two blocks of logical components so that the system can decide which block to execute based on whether the provided condition is true or false."
        })},
        foreachStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.foreach.tooltip.title",
                defaultMessage: "A foreach statement is a control flow statement that can be used to iterate over a list of items.",
            })},
        whileStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.while.tooltip.title",
                defaultMessage: "A while statement executes a block of statements in a loop as long as the specified condition is true."
            })},
        returnStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.return.tooltip.title",
                defaultMessage: "A return statement stops executing the current path or returns a value back to the caller."
            })},
        respondStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.respond.tooltip.title",
                defaultMessage: "A respond statement sends the response of a service back to the client."
            })},
        customStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.customStatement.tooltip.title",
                defaultMessage: "A custom statement can be used to write a single or a multiline code snippet that is not supported by the low code diagram."
            }),
    }
    }

    const logStm: StatementComponent = {
        name: "log",
        category: 'process',
        component:
            (
                <Tooltip
                    title={plusHolderStatementTooltipMessages.logStatement.title}
                    placement="left"
                    arrow={true}
                    interactive={true}
                >
                    <div className="sub-option enabled" data-testid="addLog" onClick={onSelect.bind(undefined, "Log")}>
                        <div className="icon-wrapper">
                            <LogIcon />
                        </div>
                        <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.log.title" defaultMessage="Log"/></div>
                    </div>
                </Tooltip>
            )
    }
    const propertyStm: StatementComponent = {
        name: "variable",
        category: 'process',
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.variableStatement.title}
                placement="right"
                arrow={true}
                interactive={true}
            >
                <div className="sub-option enabled" data-testid="addVariable" onClick={onSelect.bind(undefined, "Variable")}>
                    <div className="icon-wrapper">
                        <PropertyIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.variable.title" defaultMessage="Variable"/></div>
                </div>
            </Tooltip>
        )
    }
    const ifStm: StatementComponent = {
        name: "if",
        category: 'condition',
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.ifStatement.title}
                placement="left"
                arrow={true}
                interactive={true}
            >
                <div className="sub-option enabled" data-testid="addIf" onClick={onSelect.bind(undefined, "If")}>
                    <div className="icon-wrapper">
                        <IfIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.if.title" defaultMessage="If"/></div>
                </div>
            </Tooltip>
        )
    }
    const foreachStm: StatementComponent = {
        name: "foreach",
        category: 'condition',
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.foreachStatement.title}
                placement="right"
                arrow={true}
                interactive={true}
            >
                <div className="sub-option enabled" data-testid="addForeach" onClick={onSelect.bind(undefined, "ForEach")} >
                    <div className="icon-wrapper">
                        <ForEachIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.foreach.title" defaultMessage="ForEach"/></div>
                </ div>
            </Tooltip>
        )
    }
    const whileStmt: StatementComponent = {
        name: "while",
        category: 'condition',
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.whileStatement.title}
                placement="left"
                arrow={true}
                interactive={true}
            >
                <div className="sub-option enabled" data-testid="addWhile" onClick={onSelect.bind(undefined, "While")} >
                    <div className="icon-wrapper">
                        <While />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.while.title" defaultMessage="While"/></div>
                </ div>
            </Tooltip>
        )
    }

    const returnStm: StatementComponent = {
        name: "return",
        category: 'stop',
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.returnStatement.title}
                placement="left"
                arrow={true}
                disabled={!(!isResource && viewState.isLast)}
                interactive={true}
            >
                <div
                    data-testid="addReturn"
                    className={cn("sub-option", { enabled: !isResource && viewState.isLast })}
                    onClick={!isResource ? onSelect.bind(undefined, 'Return') : null}
                >
                    <div className="icon-wrapper">
                        <ReturnIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.return.title" defaultMessage="Return"/></div>
                </div>
            </Tooltip>
        )
    }
    const respondStm: StatementComponent = {
        name: "respond",
        category: 'stop',
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.respondStatement.title}
                placement="right"
                arrow={true}
                disabled={!isResource}
                interactive={true}
            >
                <div
                    className={cn("sub-option", "product-tour-stop-respond", { enabled: isResource })}
                    data-testid="addrespond"
                    onClick={isResource ? onSelect.bind(undefined, 'Respond') : null}
                >
                    <div className="icon-wrapper">
                        <RespondIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.respond.title" defaultMessage="Respond"/></div>
                </div>
            </Tooltip>
        )
    }
    const customStatement: StatementComponent = {
        name: "customStatement",
        category: 'process',
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.customStatement.title}
                placement="left"
                arrow={true}
                interactive={true}
            >
                <div
                    className={cn("sub-option enabled", {height: 'unset'})}
                    data-testid="addcustom"
                    onClick={onSelect.bind(undefined, "Custom")}
                >
                    <div className="icon-wrapper">
                        <CustomStatementIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.customStatement.title" defaultMessage="Other"/></div>
                </div>
            </Tooltip>
        )
    }

    const statements: StatementComponent[] = [];
    statements.push(logStm);
    statements.push(propertyStm);
    statements.push(ifStm);
    statements.push(foreachStm);
    statements.push(whileStmt);
    statements.push(returnStm);
    statements.push(respondStm);
    statements.push(customStatement);

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

    const searchPlaceholder = intl.formatMessage({
        id : "lowcode.develop.plusHolder.plusElements.statements.search.placeholder",
        defaultMessage: "Search"
    })

    return (
        <>
            <div className="search-options-wrapper">
                <label><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.chooseFromList.label" defaultMessage="Select from list"/></label>

                <input
                    type="search"
                    placeholder={searchPlaceholder}
                    value={selectedCompName}
                    onChange={handleSearchChange}
                    className='search-wrapper'
                />
            </div>
            <div className="element-option-holder" >
                <div className="options-wrapper">
                    {/* {(processComp.length > 0 ? <Divider /> : null)} */}
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
