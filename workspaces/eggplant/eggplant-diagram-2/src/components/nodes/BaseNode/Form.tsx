/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import { Tooltip } from "@wso2-enterprise/ui-toolkit";
import { BaseNodeModel } from "./BaseNodeModel";
import { NodeStyles } from "./BaseNodeWidget";
import { generateEditor } from "../../editors/EditorFactory";
import { Expression, NodePropertyKey } from "../../../utils/types";
import { DiagramContext } from "../../DiagramContext";
import { debounce } from "lodash";

interface FormWidgetProps {
    model: BaseNodeModel;
}

export function FormWidget(props: FormWidgetProps) {
    const { model } = props;
    const { onNodeUpdate } = useContext(DiagramContext);

    const id = model.node.id;
    const required: React.JSX.Element[] = [];
    const opt: React.JSX.Element[] = [];
    let index = 0;

    const handleOnChange = (key: NodePropertyKey, expression: Expression) => {
        model.node.nodeProperties[key] = expression;
        onNodeUpdate(model.node);
    };

    const debouncedOnChange = debounce(handleOnChange, 300);

    
    for (const [key, expression] of Object.entries(model.node?.nodeProperties)) {
        const el = (
            <NodeStyles.Row key={key}>
                <Tooltip
                    content={expression.documentation}
                    sx={{
                        fontFamily: "GilmerRegular",
                        fontSize: "12px",
                    }}
                >
                    <NodeStyles.StyledText>{expression.label}</NodeStyles.StyledText>
                </Tooltip>
                {generateEditor(key, expression, id, index++, debouncedOnChange.bind(null, key as NodePropertyKey))}
            </NodeStyles.Row>
        );
        (expression.optional ? opt : required).push(el);
    }

    return (
        <>
            {required}
            {opt.length > 0 && <NodeStyles.Hr />}
            {opt}
        </>
    );
}
