/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { TypeWithIdentifier, VarIcon } from "@wso2-enterprise/ballerina-core";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { VariableTree } from "./VariablesTree";
import styled from "@emotion/styled";
import { useState } from "react";
import { IconContainer, VariableComponent, VariableName, VariableType } from "../VariablesView";
import { getTypeName } from "./utils";

interface RecordTypeTreeProps {
    variable: TypeWithIdentifier;
    depth: number;
    handleOnClick: (variable: string) => void;
    parentValue?: string;
}

namespace VariableStyles {
    export const SubList = styled.div`
        margin-left: 20px;
        margin-bottom: 8px;
        padding-left: 20px;
        flex-direction: column;
    `;
}


export function RecordTypeTree(props: RecordTypeTreeProps) {
    const { variable, depth, handleOnClick, parentValue } = props;

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleFieldClick = (fieldName: string) => {
        handleOnClick(fieldName);
    };

    const renderFields = () => {
        if (depth > 1 && !isExpanded) {
            return null;
        }

        return (
            <VariableStyles.SubList>
                {variable.type.fields.map((field, index) => {
                    const fullPath = parentValue ? `${parentValue}.${field.name}` : `${variable.name}.${field.name}`;
                    if (field.typeName && field.name && field.typeName !== 'record') {
                        return (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <VariableComponent onClick={() => handleFieldClick(`${fullPath}`)}>
                                    <IconContainer>
                                        <Codicon name="symbol-field" iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
                                    </IconContainer>
                                    <VariableName>
                                        {field.name}
                                    </VariableName>
                                    <VariableType>
                                        {getTypeName(field)}
                                    </VariableType>
                                </VariableComponent>
                            </div>
                        );
                    } else {
                        return (
                            <div key={index}>
                                <VariableTree variable={{ name: field.name, type: field }} depth={depth + 1} parentValue={fullPath} handleOnSelection={handleOnClick} />
                            </div>
                        );
                    }
                })}
            </VariableStyles.SubList>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

                <VariableComponent onClick={() => handleFieldClick(parentValue ? `${parentValue}` : `${variable.name}`)}>

                    {!parentValue &&
                        <IconContainer>
                            <VarIcon />
                        </IconContainer>
                    }
                    {parentValue &&
                        <IconContainer>
                            <Codicon name="symbol-field" iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
                        </IconContainer>
                    }
                    <VariableName>
                        {variable.name}
                    </VariableName>
                    <VariableType>
                        {getTypeName(variable.type)}
                    </VariableType>
                </VariableComponent>
                {depth > 1 && (
                    <Button appearance="icon" onClick={toggleExpand} >
                        {isExpanded ? <Codicon name="chevron-up" /> : <Codicon name="chevron-down" />}
                    </Button>
                )}
            </div>
            {variable.type.fields.length > 0 && renderFields()}
        </div>
    );
}
