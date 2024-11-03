/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, Dropdown, TextField, Tooltip, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Parameter as P, ReferenceObject as R } from '../../../Definitions/ServiceDefinitions';
import { BaseTypes } from '../../../constants';
import SectionHeader from '../SectionHeader/SectionHeader';
import { Parameter } from '../Parameter/Parameter';
import { ReferenceObject } from '../ReferenceObject/ReferenceObject';

export const PanelBody = styled.div`
    height: calc(100% - 87px);
    overflow-y: auto;
    padding: 16px;
    gap: 15px;
    display: flex;
    flex-direction: column;
`;

interface ParameterProps {
    parameters: (P | R) [];
    paramTypes?: string[];
    currentReferences?: R[];
    title?: string;
    onParametersChange: (parameter: (P | R) []) => void;
}
const ButtonWrapperParams = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 40px;
    flex-grow: 1;
    gap: 5px;
    justify-content: flex-end;
`;

function isReferenceObject(obj: (P | R)): obj is R {
    return obj && typeof obj === 'object' && '$ref' in obj;
}

// Title, Vesrion are mandatory fields
export function Parameters(props: ParameterProps) {
    const { parameters, paramTypes = BaseTypes, title, currentReferences, onParametersChange } = props;

    const handleParameterChange = (parameters: (P | R)[]) => {
        onParametersChange(parameters);
    };

    const addNewParam = () => {
        const parameterCopy = [...parameters];
        const newParam: P = {
            name: `param${parameters.length + 1}`,
            in: "query",
            required: true,
            description: "",
            schema: {
                type: "string"
            }
        };
        parameterCopy.push(newParam);
        handleParameterChange([...parameterCopy]);
    };
    const getAddParamButton = () => (
        <Button appearance="icon" onClick={() => addNewParam()}>
            <Codicon sx={{ marginRight: 5 }} name="add" />
            Add Parameter
        </Button>
    );
    const addNewReferenceObject = () => {
        const parameterCopy = [...parameters];
        const newParam: R = {
            $ref: currentReferences?.[0]?.$ref || "",
            summary: "",
            description: ""
        };
        parameterCopy.push(newParam);
        handleParameterChange([...parameterCopy]);
    }
    const getAddReferenceObjectButton = () => (
        <Button appearance="icon" onClick={() => addNewReferenceObject()}>
            <Codicon sx={{ marginRight: 5 }} name="add" />
            Add Reference
        </Button>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <SectionHeader title={title} actionButtons={[getAddParamButton(), getAddReferenceObjectButton()]} />
            {parameters.map((parameter, index) => {
                if (isReferenceObject(parameter)) {
                    return (
                        <ReferenceObject
                            key={index}
                            id={index}
                            referenceObject={parameter}
                            referenceObjects={currentReferences?.map((item) => item.$ref)}
                            onRemoveReferenceObject={(id) => {
                                const parametersCopy = [...parameters];
                                parametersCopy.splice(id, 1);
                                handleParameterChange(parametersCopy as P[]);
                            }}
                            onRefernceObjectChange={(parameter) => {
                                const parametersCopy = [...parameters];
                                parametersCopy[index] = parameter;
                                handleParameterChange(parametersCopy as P[]);
                            }}
                        />
                    );
                } else {
                    return (
                        <Parameter
                            key={index}
                            id={index}
                            parameter={parameter}
                            paramTypes={paramTypes}
                            onRemoveParameter={(id) => {
                                const parametersCopy = [...parameters];
                                parametersCopy.splice(id, 1);
                                handleParameterChange(parametersCopy as P[]);
                            }}
                            onParameterChange={(parameter) => {
                                const parametersCopy = [...parameters];
                                parametersCopy[index] = parameter;
                                handleParameterChange(parametersCopy as P[]);
                            }}
                        />
                    );
                }
            })}
        </div>
    )
}
