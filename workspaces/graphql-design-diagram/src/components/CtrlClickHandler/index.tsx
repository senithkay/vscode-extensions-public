/**
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
import React from "react";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { CtrlClickWrapper } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components"
import { useGraphQlContext } from "../DiagramContext/GraphqlDiagramContext";

interface CtrlClickHandlerProps {
    filePath: string;
    position: NodePosition;
}

export function CtrlClickHandler(props: React.PropsWithChildren<CtrlClickHandlerProps>) {
    const { filePath, position, children } = props;
    const { goToSource } = useGraphQlContext();
    const handleOnClick = () => {
        goToSource(filePath, position);
    };

    return (
        <CtrlClickWrapper onClick={handleOnClick}>
            {children}
        </CtrlClickWrapper>
    )
}

