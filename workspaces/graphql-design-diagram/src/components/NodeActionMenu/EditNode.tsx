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
import {
    LabelEditIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../DiagramContext/GraphqlDiagramContext";
import { FunctionType } from "../resources/model";

interface EditNodeProps {
    model: STNode;
    functionType: FunctionType;
}

export function EditNode(props: EditNodeProps) {
    const { model, functionType } = props;
    const { functionPanel } = useContext(DiagramContext);

    const [isHovered, setIsHovered] = useState<boolean>(false);

    const openFunctionPanel = () => {
        if (STKindChecker.isResourceAccessorDefinition(model)) {
            if (functionType === FunctionType.QUERY) {
                functionPanel(model.position, "GraphqlResource", model);
            } else if (functionType === FunctionType.MUTATION) {
                functionPanel(model.position, "GraphqlMutation", model);
            } else if (functionType === FunctionType.SUBSCRIPTION) {
                functionPanel(model.position, "GraphqlSubscription", model);
            }
        }
    };


    return (
        <>
            {model &&
            <>
                <Tooltip
                    open={isHovered}
                    onClose={() => setIsHovered(false)}
                    title={"Edit Operation"}
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
                        <LabelEditIcon/>
                    </IconButton>
                </Tooltip>
            </>
            }
        </>
    );
}
