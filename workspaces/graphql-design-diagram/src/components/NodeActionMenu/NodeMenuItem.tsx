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
import React, { useContext } from "react";

import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import {
    GraphqlMutationIcon,
    GraphqlQueryIcon,
    GraphqlSubscriptionIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../resources/model";

import { useStyles } from "./styles";

interface NodeMenuItemProps {
    position: Position;
    model: STNode;
    functionType: FunctionType;
}

export function NodeMenuItem(props: NodeMenuItemProps) {
    const { position, model, functionType } = props;
    const { functionPanel } = useContext(DiagramContext);

    const menuStyles = useStyles();

    // TODO : if not being used for all the graphql nodes, remove the  mutation type ones
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
            } else if (functionType === FunctionType.CLASS_RESOURCE) {
                functionPanel(lastMemberPosition, "ServiceClassResource");
            }
        }
    };

    const popupTitle = () => {
        if (functionType === FunctionType.QUERY) {
            return "Add Query";
        } else if (functionType === FunctionType.MUTATION) {
            return "Add Mutation";
        } else if (functionType === FunctionType.SUBSCRIPTION) {
            return "Add Subscription";
        } else if (functionType === FunctionType.CLASS_RESOURCE) {
            return "Add Field";
        }
    };

    const popupIcon = () => {
        if (functionType === FunctionType.QUERY || functionType === FunctionType.CLASS_RESOURCE) {
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
            <MenuItem onClick={() => openFunctionPanel()} className={menuStyles.menuItem}>
                <ListItemIcon className={menuStyles.menuIcon}>
                    {popupIcon()}
                </ListItemIcon>
                <ListItemText className={menuStyles.listItemText}>{popupTitle()}</ListItemText>
            </MenuItem>
            }
        </>
    );
}
