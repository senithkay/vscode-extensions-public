/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline
import React, { useContext } from "react";

import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import { GraphqlMutationIcon, GraphqlQueryIcon, GraphqlSubscriptionIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../../../../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../../../../resources/model";

import { useStyles } from "./styles";

interface AddFunctionWidgetProps {
    position: Position;
    functionType: FunctionType;
}

export function AddFunctionWidget(props: AddFunctionWidgetProps) {
    const { position, functionType } = props;
    const { functionPanel, model } = useContext(DiagramContext);

    const classes = useStyles();

    const openFunctionPanel = () => {
        if (STKindChecker.isServiceDeclaration(model)) {
            const lastMemberPosition: NodePosition = {
                endColumn: model.closeBraceToken.position.endColumn,
                endLine: model.closeBraceToken.position.endLine,
                startColumn: model.closeBraceToken.position.startColumn,
                startLine: model.closeBraceToken.position.startLine
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
