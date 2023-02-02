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
import React, { useContext, useState } from "react";

import { IconButton, Tooltip } from "@material-ui/core";
import { GraphqlMutationIcon, GraphqlQueryIcon, GraphqlSubscriptionIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../../../../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../../../../resources/model";

interface AddFunctionWidgetProps {
    position: Position;
    functionType: FunctionType;
}

export function AddFunctionWidget(props: AddFunctionWidgetProps) {
    const { position, functionType } = props;
    const { functionPanel, model } = useContext(DiagramContext);

    const [isHovered, setIsHovered] = useState<boolean>(false);

    const openFunctionPanel = () => {
        if (STKindChecker.isServiceDeclaration(model)) {
            const lastMemberPosition: NodePosition = {
                endColumn: model.closeBraceToken.position.endColumn,
                endLine: model.closeBraceToken.position.endLine,
                startColumn: model.closeBraceToken.position.startColumn,
                startLine: model.closeBraceToken.position.startLine
            };
            // TODO: enable form rendering functionality
            functionPanel(lastMemberPosition, "ResourceForm");
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
            <>
                <Tooltip
                    open={isHovered}
                    onClose={() => setIsHovered(false)}
                    title={popupTitle()}
                    arrow={true}
                    placement="right"
                >
                    <IconButton
                        onClick={() => openFunctionPanel()}
                        onMouseOver={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            backgroundColor: isHovered ? '#ffaf4d' : '',
                            borderRadius: '50%',
                            color: isHovered ? 'whitesmoke' : '#ffaf4d',
                            cursor: 'pointer',
                            fontSize: '22px',
                            padding: '2px'
                        }}
                    >
                        {popupIcon()}
                    </IconButton>
                </Tooltip>
            </>
            }
        </>
    );
}
