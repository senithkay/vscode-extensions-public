/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { TextField, Button, Codicon, Typography, Dropdown } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Param } from '../../Definitions/ServiceDefinitions';
import SectionHeader from '../Resource/SectionHeader';

export enum Action {
    ADD = "add",
    DELETE = "delete",
    UPDATE = "update",
}

export const HorizontalFieldWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

export const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
`;

export const ButtonWrapperParams = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 70px;
    flex-grow: 1;
    justify-content: flex-end;
`;

interface OverviewProps {
    params: Param[];
    paramTypes: string[];
    newParamName?: string;
    type: string;
    title: string;
    addButtonText?: string;
    disableCollapse?: boolean;
    paramNameOutFocus?: (value: Param[], name: string) => void;
    onParamsChange: (params: Param[], action?: Action) => void;
}

export function ParamEditor(props: OverviewProps) {
    const { params, paramTypes, newParamName = "", type, title, addButtonText, disableCollapse, onParamsChange } = props;

    const paramTypeOptions = paramTypes.map((type) => ({ id: type, content: type, value: type }));

    const updateParentComponent = (row: number, param: string, value: string) => {
        // Copy params array
        const paramsCopy: Param[] = [...params];
        if (param === "type") {
            paramsCopy[row] = {
                ...paramsCopy[row],
                [param]: value,
                schema: {
                    type: value
                }
            };
        } else {
            paramsCopy[row] = {
                ...paramsCopy[row],
                [param]: value
            };
        }
        onParamsChange(paramsCopy);
    }

    const addNewParam = () => {
        if (!params) {
            onParamsChange([{ name: newParamName, type: "string", description: "" }], Action.ADD);
            return;
        } else {
            onParamsChange([...params, {
                name: newParamName,
                type: "string",
                description: "",
                isArray: false,
                isRequired: true,
            }], Action.ADD);
        }
    };

    const removeParam = (index: number) => {
        const paramsCopy: Param[] = [...params];
        paramsCopy.splice(index, 1);
        onParamsChange(paramsCopy);
    }

    const updateRequired = (index: number, value: boolean) => {
        const paramsCopy: Param[] = [...params];
        paramsCopy[index] = {
            ...paramsCopy[index],
            isRequired: value
        };
        onParamsChange(paramsCopy);
    }

    const updateArray = (index: number, value: boolean) => {
        const paramsCopy: Param[] = [...params];
        paramsCopy[index] = {
            ...paramsCopy[index],
            isArray: value
        };
        onParamsChange(paramsCopy);
    }

    const getAddButton = () => (
        <Button appearance="icon" onClick={addNewParam}>
            <Codicon sx={{ marginRight: 5 }} name="add" />
            Add
        </Button>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <SectionHeader title={title} actionButtons={getAddButton()} />
            {params && params.length > 0 ? (
                params.map((param, index) => (
                    <HorizontalFieldWrapper key={index}>
                        <TextField
                            placeholder="Name"
                            name={`params[${index}].name`}
                            value={param.name || ""}
                            sx={{ width: "35%" }}
                            onTextChange={(value) => updateParentComponent(index, "name", value)}
                            onBlur={() => props.paramNameOutFocus && props.paramNameOutFocus(params, param.name)}
                        />
                        <Dropdown
                            id={`param-type-${index}`}
                            value={param.type}
                            containerSx={{ width: "25%" }}
                            items={paramTypeOptions}
                            onValueChange={(value) => updateParentComponent(index, "type", value)}
                        />
                        <TextField
                            placeholder="Description"
                            value={param.description || ""}
                            sx={{ width: "40%" }}
                            onTextChange={(value) => updateParentComponent(index, "description", value)}
                        />
                        <ButtonWrapperParams>
                            <Button appearance='icon' onClick={() => updateRequired(index, !param.isRequired)}>
                                <div style={{fontSize: "11px"}}>{param.isRequired ? "Required" : "Optional"}</div>
                            </Button>
                            <Button appearance='icon' onClick={() => removeParam(index)}>
                                <Codicon name="trash" />
                            </Button>
                        </ButtonWrapperParams>
                    </HorizontalFieldWrapper>
                ))
            ) : (
                <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'>No parameters.</Typography>
            )}
        </div>

    )
}