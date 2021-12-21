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

import { Divider } from "@material-ui/core";
import cn from "classnames";

import {
    LogIcon,
    PropertyIcon,
    AssignmentIcon,
    IfIcon,
    ForEachIcon,
    ReturnIcon,
    RespondIcon,
    CustomStatementIcon,
    DataMapperIcon,
    ConnectorIcon,
    ActionIcon,
} from "../../../../../../../../assets/icons";

import { Context } from "../../../../../../../../Contexts/Diagram";
import { PlusViewState } from "../../../../../ViewState";
import { Tooltip } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import "../../style.scss";
import While from "../../../../../../../../assets/icons/While";
import { FormattedMessage, useIntl } from "react-intl";
import {
    ADD_STATEMENT,
    LowcodeEvent
} from "../../../../../../../models";
import { HttpLogo } from "../../../../RenderingComponents/Connector/Icon/HttpLogo";

export const PROCESS_TYPES = [""];

export interface StatementOptionsProps {
    onSelect: (type: string) => void;
    viewState: PlusViewState;
    isResource?: boolean;
    isCallerAvailable?: boolean;
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
    const { props: { syntaxTree }, api: { insights: { onEvent }} } = useContext(Context);
    const intl = useIntl();
    const { onSelect, viewState, isCallerAvailable, isResource } = props;

    const plusHolderStatementTooltipMessages = {
        logStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.log.tooltip.title",
                defaultMessage: "A log statement logs an event with an information statement, an error that occurs in a service, or an integration. If the event has not yet occurred, you can view the logs from the 'Run & Test' console . If the event has occurred, you can view the logs from the Observability page."
            })},
        variableStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.variable.tooltip.title",
                defaultMessage: "A variable statement holds the value of a specific data type (string, integer, etc.) so that it can be used later in the logical process of the service or integration."
            })
        },
        assignmentStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.assignment.tooltip.title",
                defaultMessage: "An assignment statement lets you to assign a value to a variable that is already defined"
            })
        },
        ifStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.if.tooltip.title",
                defaultMessage: "An if statement lets you specify two blocks of logical components so that the system can decide which block to execute based on whether the provided condition is true or false."
        })},
        foreachStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.foreach.tooltip.title",
                defaultMessage: "A foreach statement is a control flow statement that can be used to iterate over a list of items.",
            })
        },
        whileStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.while.tooltip.title",
                defaultMessage: "A while statement executes a block of statements in a loop as long as the specified condition is true."
            })
        },
        returnStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.return.tooltip.title",
                defaultMessage: "A return statement stops executing the current path or returns a value back to the caller."
            })
        },
        respondStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.respond.tooltip.title",
                defaultMessage: "A respond statement sends the response from a service back to the client."
            })
        },
        customStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.customStatement.tooltip.title",
                defaultMessage: "A custom statement can be used to write a single or a multiline code snippet that is not supported by the low code diagram."
            })
        },
        httpConnectorStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.http.tooltip.title",
                defaultMessage: "An HTTP connector can be used to integrate with external applications."
            })
        },
        dataMapperStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.dataMapping.tooltip.title",
                defaultMessage: "A data mapping statement can be used to create an object using several other variables."
            })
        },
        connectorStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.connector.tooltip.title",
                defaultMessage: "A connector can be used to integrate with external applications."
            })
        },
        actionStatement: {
            title: intl.formatMessage({
                id: "lowcode.develop.plusHolder.plusElements.statements.action.tooltip.title",
                defaultMessage: "An action can be used to invoke operations of an existing connector."
            })
        }
    }

    const onSelectStatement = (type: string) => {
        const event: LowcodeEvent = {
            type: ADD_STATEMENT,
            name: type
        };
        onEvent(event);
        onSelect(type);
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
                    <div className="sub-option enabled" data-testid="addLog" onClick={onSelectStatement.bind(undefined, "Log")}>
                        <div className="icon-wrapper">
                            <LogIcon />
                        </div>
                        <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.log.title" defaultMessage="Log" /></div>
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
                <div className="sub-option enabled" data-testid="addVariable" onClick={onSelectStatement.bind(undefined, "Variable")}>
                    <div className="icon-wrapper">
                        <PropertyIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.variable.title" defaultMessage="Variable" /></div>
                </div>
            </Tooltip>
        )
    }
    const assignmentStm: StatementComponent = {
        name: "assignment",
        category: 'process',
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.assignmentStatement.title}
                placement="right"
                arrow={true}
                interactive={true}
            >
                <div
                    className="sub-option enabled"
                    data-testid="addAssignment"
                    onClick={onSelectStatement.bind(undefined, "AssignmentStatement")}
                >
                    <div className="icon-wrapper">
                        <AssignmentIcon />
                    </div>
                    <div className="text-label">
                        <FormattedMessage
                            id="lowcode.develop.plusHolder.plusElements.statements.assignment.title"
                            defaultMessage="Assignment"
                        />
                    </div>
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
                <div className="sub-option enabled" data-testid="addIf" onClick={onSelectStatement.bind(undefined, "If")}>
                    <div className="icon-wrapper">
                        <IfIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.if.title" defaultMessage="If" /></div>
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
                <div className="sub-option enabled" data-testid="addForeach" onClick={onSelectStatement.bind(undefined, "ForEach")} >
                    <div className="icon-wrapper">
                        <ForEachIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.foreach.title" defaultMessage="Foreach" /></div>
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
                <div className="sub-option enabled" data-testid="addWhile" onClick={onSelectStatement.bind(undefined, "While")} >
                    <div className="icon-wrapper">
                        <While />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.while.title" defaultMessage="While" /></div>
                </ div>
            </Tooltip>
        )
    }
    const connectorStatement: StatementComponent = {
        name: "connector",
        category: "connector",
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.connectorStatement.title}
                placement="left"
                arrow={true}
                interactive={true}
            >
                <div
                    className="sub-option enabled"
                    data-testid="addConnector"
                    onClick={onSelectStatement.bind(undefined, "Connector")}
                >
                    <div className="icon-wrapper">
                        <ConnectorIcon />
                    </div>
                    <div className="text-label">
                        <FormattedMessage
                            id="lowcode.develop.plusHolder.plusElements.statements.connector.title"
                            defaultMessage="Connector"
                        />
                    </div>
                </div>
            </Tooltip>
        ),
    };
    const actionStatement: StatementComponent = {
        name: "action",
        category: "connector",
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.actionStatement.title}
                placement="left"
                arrow={true}
                interactive={true}
            >
                <div
                    className="sub-option enabled"
                    data-testid="addAction"
                    onClick={onSelectStatement.bind(undefined, "Action")}
                >
                    <div className="icon-wrapper">
                        <ActionIcon />
                    </div>
                    <div className="text-label">
                        <FormattedMessage
                            id="lowcode.develop.plusHolder.plusElements.statements.action.title"
                            defaultMessage="Action"
                        />
                    </div>
                </div>
            </Tooltip>
        ),
    };
    const httpConnector: StatementComponent = {
        name: "httpConnector",
        category: 'connector',
        component: (
            <Tooltip
                title={plusHolderStatementTooltipMessages.httpConnectorStatement.title}
                placement="left"
                arrow={true}
                interactive={true}
            >
                <div
                    className={cn("sub-option enabled", { height: 'unset' })}
                    data-testid="addHttp"
                    onClick={onSelectStatement.bind(undefined, "HTTP")}
                >
                    <div className="icon-wrapper">
                        <HttpLogo />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.httpConnectorStatement.title" defaultMessage="HTTP" /></div>
                </div>
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
                disabled={!viewState.isLast}
                interactive={true}
            >
                <div
                    data-testid="addReturn"
                    className={cn("sub-option", { enabled: viewState.isLast })}
                    onClick={viewState.isLast ? onSelectStatement.bind(undefined, 'Return') : null}
                >
                    <div className="icon-wrapper">
                        <ReturnIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.return.title" defaultMessage="Return" /></div>
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
                    className={cn("sub-option", "product-tour-stop-respond", { enabled: isResource && isCallerAvailable })}
                    data-testid="addrespond"
                    onClick={isResource && isCallerAvailable ? onSelectStatement.bind(undefined, 'Respond') : null}
                >
                    <div className="icon-wrapper">
                        <RespondIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.respond.title" defaultMessage="Respond" /></div>
                </div>
            </Tooltip>
        )
    }
    // const datamappingStatement: StatementComponent = {
    //     name: "datamapper",
    //     category: 'process',
    //     component: (
    //         <Tooltip
    //             title={plusHolderStatementTooltipMessages.dataMapperStatement.title}
    //             placement="right"
    //             arrow={true}
    //             // example={false}
    //             // codeSnippet={true}
    //             interactive={true}
    //         >
    //             <div className="sub-option enabled" data-testid="addDataMapping" onClick={onSelect.bind(undefined, "DataMapper")}>
    //                 <div className="icon-wrapper">
    //                     <DataMapperIcon />
    //                 </div>
    //                 <div className="text-label">Data Mapping</div>
    //             </div>
    //         </Tooltip>
    //     )
    // }
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
                    className={cn("sub-option enabled", { height: 'unset' })}
                    data-testid="addcustom"
                    onClick={onSelectStatement.bind(undefined, "Custom")}
                >
                    <div className="icon-wrapper">
                        <CustomStatementIcon />
                    </div>
                    <div className="text-label"><FormattedMessage id="lowcode.develop.plusHolder.plusElements.statements.customStatement.title" defaultMessage="Other" /></div>
                </div>
            </Tooltip>
        )
    }

    const statements: StatementComponent[] = [];
    statements.push(connectorStatement);
    statements.push(actionStatement);
    statements.push(logStm);
    statements.push(propertyStm);
    statements.push(assignmentStm);
    statements.push(ifStm);
    statements.push(foreachStm);
    statements.push(whileStmt);
    statements.push(returnStm);
    statements.push(respondStm);
    // statements.push(datamappingStatement);
    statements.push(customStatement);
    statements.push(httpConnector);

    const initStatements: Statements = {
        statement: statements,
        selectedCompoent: ""
    };
    const [selectedCompName, setSelectedCompName] = useState("");

    const connectorComp: ReactNode[] = [];
    const processComp: ReactNode[] = [];
    const conditionComp: ReactNode[] = [];
    const stopComp: ReactNode[] = [];
    if (selectedCompName !== "") {
        const stmts: StatementComponent[] = initStatements.statement.filter(el => el.name.toLowerCase().includes(selectedCompName.toLowerCase()));
        stmts.forEach((stmt) => {
            if (stmt.category === "connector") {
                connectorComp.push(stmt.component);
            } else if (stmt.category === "process") {
                processComp.push(stmt.component);
            } else if (stmt.category === "condition") {
                conditionComp.push(stmt.component);
            } else if (stmt.category === "stop") {
                stopComp.push(stmt.component);
            }
        });
    } else {
        initStatements.statement.forEach((stmt) => {
            if (stmt.category === "connector") {
                connectorComp.push(stmt.component);
            } else if (stmt.category === "process") {
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
            <div className="element-option-holder" >
                <div className="options-wrapper">
                    {connectorComp}
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
