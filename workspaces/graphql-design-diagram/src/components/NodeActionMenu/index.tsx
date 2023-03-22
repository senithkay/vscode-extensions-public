/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline
import React, { useContext, useEffect, useState } from "react";

import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import { GraphqlMutationIcon, GraphqlQueryIcon, GraphqlSubscriptionIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../resources/model";
import { getParentSTNodeFromRange } from "../utils/common-util";

import { useStyles } from "./styles";

interface AddFunctionWidgetProps {
    position: Position;
    functionType: FunctionType;
}

export function NodeActionMenu(props: AddFunctionWidgetProps) {
    const { position, functionType } = props;
    const { functionPanel, fullST } = useContext(DiagramContext);

    const [model, setModel] = useState<any>(null);

    const classes = useStyles();

    useEffect(() => {
        const nodePosition: NodePosition = {
            endColumn: position.endLine.offset,
            endLine: position.endLine.line,
            startColumn: position.startLine.offset,
            startLine: position.startLine.line
        };
        const parentNode = getParentSTNodeFromRange(nodePosition, fullST);
        setModel(parentNode);
    }, [position]);


    const openFunctionPanel = () => {
        if (model && STKindChecker.isClassDefinition(model)) {
            const lastMemberPosition: NodePosition = {
                endColumn: model.closeBrace.position.endColumn,
                endLine: model.closeBrace.position.endLine,
                startColumn: model.closeBrace.position.startColumn,
                startLine: model.closeBrace.position.startLine
            };
            if (functionType === FunctionType.QUERY) {
                functionPanel(lastMemberPosition, "GraphqlResource");
            } else if (functionType === FunctionType.MUTATION) {
                functionPanel(lastMemberPosition, "GraphqlMutation");
            } else if (functionType === FunctionType.SUBSCRIPTION) {
                functionPanel(lastMemberPosition, "GraphqlSubscription");
            }
        }
    };

    const popupTitle = () => {
        if (functionType === FunctionType.QUERY) {
            return "Add Query";
        } else if (functionType === FunctionType.MUTATION) {
            return "Add Mutation";
        } else {
            return "Add Subscription";
        }
    };

    const popupIcon = () => {
        if (functionType === FunctionType.QUERY) {
            return <GraphqlQueryIcon/>;
        } else if (functionType === FunctionType.MUTATION) {
            return <GraphqlMutationIcon/>;
        } else {
            return <GraphqlSubscriptionIcon/>;
        }
    };

    return (
        <>
            {position &&
            <MenuItem onClick={() => openFunctionPanel()} style={{paddingTop: "0px", paddingBottom: "0px"}}>
                <ListItemIcon style={{marginRight: "10px", minWidth: "0px"}}>
                    {popupIcon()}
                </ListItemIcon>
                <ListItemText className={classes.listItemText}>{popupTitle()}</ListItemText>
            </MenuItem>
            }
        </>
    );
}
