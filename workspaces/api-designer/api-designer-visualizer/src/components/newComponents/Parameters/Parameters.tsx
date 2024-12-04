/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Parameter as P, ReferenceObject as R } from '../../../Definitions/ServiceDefinitions';
import { BaseTypes } from '../../../constants';
import SectionHeader from '../SectionHeader/SectionHeader';
import { Parameter } from '../Parameter/Parameter';
import { ReferenceObject } from '../ReferenceObject/ReferenceObject';
import { getUpdatedObjects } from '../Utils/OpenAPIUtils';
import { PullUpButton } from '../../PullUpButton/PullUPButton';
import { useContext, useState } from 'react';
import { APIDesignerContext } from '../../../NewAPIDesignerContext';

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
    type: "query" | "header" | "path" | "cookie";
    onParametersChange: (parameter: (P | R) []) => void;
}

enum ParameterTypes {
    DEFAULT_PARAM = "Default Parameter",
    REFERENCE_OBJECT = "Reference Object"
}

function isReferenceObject(obj: (P | R)): obj is R {
    return obj && typeof obj === 'object' && '$ref' in obj;
}

function changeParamTypeButton(options: string[], value: string, handleParamTypeChange: (options: string) => void) {
    const handleOptionChange = (options: string[]) => {
        handleParamTypeChange(options[0]);
    }
    return (
        <PullUpButton options={options} selectSingleOption selectedOptions={[value]} dropdownWidth={157} dripdownHeight={32} onOptionChange={handleOptionChange}>
            <Button appearance="icon">
                <Codicon name="ellipsis" />
            </Button>
        </PullUpButton>
    );
}

export function Parameters(props: ParameterProps) {
    const { parameters, paramTypes = BaseTypes, title, type, currentReferences, onParametersChange } = props;
    const [paramType, setParamType] = useState<string>(ParameterTypes.DEFAULT_PARAM);
    const { 
        props: { openAPI },
    } = useContext(APIDesignerContext);

    const componentParameterNames = openAPI?.components?.parameters ? Object.keys(openAPI?.components?.parameters) : [];
    const componentQueryParamNames = componentParameterNames.filter((name) => openAPI?.components?.parameters[name].in === "query");
    const componentHeaderParamNames = componentParameterNames.filter((name) => openAPI?.components?.parameters[name].in === "header");
    const componentPathParamNames = componentParameterNames.filter((name) => openAPI?.components?.parameters[name].in === "path");

    const handleParameterChange = (parameters: (P | R)[]) => {
        onParametersChange(parameters);
    };

    const addNewReferenceObject = () => {
        const newParam: R = {
            $ref: `#/components/parameters/${type === "query" ? componentQueryParamNames[0] : type === "header" ? componentHeaderParamNames[0] : type === "path" ? componentPathParamNames[0] : ""}`,
            summary: "",
            description: ""
        };
        const newParameters = getUpdatedObjects<P | R>(parameters, newParam);
        handleParameterChange([...newParameters]);
    };

    const addNewParam = () => {
        if (paramType === ParameterTypes.REFERENCE_OBJECT) {
            addNewReferenceObject();
        } else {
            const newParam: P = {
                name: parameters?.length > 0 ? `param${parameters.length}` : "param1",
                in: type,
                required: true,
                description: "",
                schema: {
                    type: "string"
                }
            };
            const newParameters = getUpdatedObjects<P | R>(parameters, newParam);
            handleParameterChange([...newParameters]);
        }
    };
    const getAddParamButton = () => (
        <Button appearance="icon" onClick={() => addNewParam()}>
            <Codicon sx={{ marginRight: 5 }} name="add" />
            Add
        </Button>
    );
    const handleParamTypeChange = (paramType: string) => {
        setParamType(paramType);
    };

    const actionButtons = [
        getAddParamButton()
    ];
    if (type === "query" && componentQueryParamNames.length > 0 || (type === "header" && componentHeaderParamNames.length > 0) || (type === "path" && componentPathParamNames.length > 0)) {
        actionButtons.push(changeParamTypeButton(["Reference Object"], paramType, handleParamTypeChange));
    } 

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <SectionHeader title={title} actionButtons={actionButtons} />
            {parameters?.map((parameter, index) => {
                if (type === parameter.in || isReferenceObject(parameter)) {
                    if (isReferenceObject(parameter) && (type === "query" ? componentQueryParamNames.includes(parameter.$ref.replace("#/components/parameters/", "")) : type === "header" ? componentHeaderParamNames.includes(parameter.$ref.replace("#/components/parameters/", "")) : type === "path" ? componentPathParamNames.includes(parameter.$ref.replace("#/components/parameters/", "") ) : false)) {
                        return (
                            <ReferenceObject
                                key={index}
                                id={index}
                                type={type}
                                referenceObject={parameter}
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
                    } else if (!isReferenceObject(parameter)) {
                        return (
                            <Parameter
                                key={index}
                                id={index}
                                parameter={parameter as P}
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
                }
            })}
        </div>
    )
}
