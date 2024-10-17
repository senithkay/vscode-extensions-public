/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { FormGroup, LinkButton, TextField, Button, Codicon, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Param } from '../../Definitions/ServiceDefinitions';
import SectionHeader from '../Resource/SectionHeader';

export const HorizontalFieldWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

export const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-top: 5px;
`;

interface OverviewProps {
    params: Param[];
    type: string;
    title: string;
    addButtonText?: string;
    disableCollapse?: boolean;
    onParamsChange: (params: Param[]) => void;
}

export function ParamEditor(props: OverviewProps) {
    const { params, type, title, addButtonText, disableCollapse, onParamsChange } = props;

    const updateParentComponent = (row: number, param: string, value: string) => {
        // Copy params array
        const paramsCopy: Param[] = [...params];
        paramsCopy[row] = {
            ...paramsCopy[row],
            [param]: value
        };
        onParamsChange(paramsCopy);
    }

    const addNewParam = () => {
        if (!params) {
            onParamsChange([{ name: "", type: "", defaultValue: "" }]);
            return;
        } else {
            onParamsChange([...params, {
                name: "",
                type: "",
                defaultValue: "",
                isArray: false,
                isRequired: false
            }]);
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
        <>
            <SectionHeader title={title} actionButtons={getAddButton()} />
            {params && params.length > 0 ? (
                params.map((param, index) => (
                    <HorizontalFieldWrapper key={index}>
                        <TextField
                            placeholder="Name"
                            name={`params[${index}].name`}
                            value={param.name || ""}
                            sx={{ width: "33%" }}
                            onChange={(e) => updateParentComponent(index, "name", e.target.value)}
                        />
                        <TextField
                            placeholder="Type"
                            value={param.type || ""}
                            sx={{ width: "33%" }}
                            onChange={(e) => updateParentComponent(index, "type", e.target.value)}
                        />
                        <TextField
                            placeholder="Default Value"
                            value={param.defaultValue || ""}
                            sx={{ width: "33%" }}
                            onChange={(e) => updateParentComponent(index, "defaultValue", e.target.value)}
                        />
                        <ButtonWrapper>
                            <Codicon iconSx={{ background: param.isArray ? "var(--vscode-menu-separatorBackground)" : "none" }} name="symbol-array" onClick={() => updateArray(index, !param.isArray)} />
                            <Codicon iconSx={{ background: param.isRequired ? "var(--vscode-menu-separatorBackground)" : "none" }} name="question" onClick={() => updateRequired(index, !param.isRequired)} />
                            <Codicon name="trash" onClick={() => removeParam(index)} />
                        </ButtonWrapper>
                    </HorizontalFieldWrapper>
                ))
            ) : (
                <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'>No parameters.</Typography>
            )}
        </>

    )
}