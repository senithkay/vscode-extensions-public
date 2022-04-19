/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { getFormComponent } from "../../utils";

export interface FormRendererProps {
    type: string;
    model: STNode;
    targetPosition: NodePosition;
    onChange: (code: string) => void;
    onCancel: () => void;
}

export function FormRenderer(props: FormRendererProps) {
    const { type, model, targetPosition, onChange, onCancel } = props;

    const component = getFormComponent(type, model, targetPosition, onChange, onCancel);

    return (
       <>
            {component}
       </>
    );
}
