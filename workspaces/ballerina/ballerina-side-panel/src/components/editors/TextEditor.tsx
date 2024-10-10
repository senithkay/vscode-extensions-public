/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { FormField } from "../Form/types";
import { Button, InputProps, TextField } from "@wso2-enterprise/ui-toolkit";
import { FieldValues, UseFormRegister } from "react-hook-form";
import styled from "@emotion/styled";
import { Colors } from "../../resources/constants";
import { TIcon } from "../../resources";
import { SubPanel, SubPanelView, SubPanelViewProps } from "@wso2-enterprise/ballerina-core";

const AddTypeContainer = styled.div<{}>`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    justify-content: flex-start;
    margin-left: 8px;
`;

const Pill = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: ${Colors.GREEN};
    padding: 2px 4px;
    border-radius: 20px;
    border: 1px solid ${Colors.GREEN};
    font-size: 10px;
    font-family: monospace;
    svg {
        fill: ${Colors.GREEN};
        stroke: ${Colors.GREEN};
        height: 12px;
        width: 12px;
    }
`;

const InlineDataMapper = styled(Button)`
    & > vscode-button {
        color: var(--vscode-button-secondaryForeground);
        font-size: 10px;
    }
`;

const InlineDataMapperText = styled.p`
    font-size: 10px;
    margin: 0;
`;

interface TextEditorProps {
    field: FormField;
    register: UseFormRegister<FieldValues>;
    openSubPanel?: (subPanel: SubPanel) => void;
}

export function TextEditor(props: TextEditorProps) {
    const { field, register, openSubPanel } = props;

    const [subPanelView, setSubPanelView] = useState<SubPanelView>(SubPanelView.UNDEFINED);

    const typeLabel = (type: string) => (
        <AddTypeContainer>
            <Pill>
                <TIcon />
                {type}
            </Pill>
        </AddTypeContainer>
    );

    const handleOpenSubPanel = (view: SubPanelView, subPanelInfo: SubPanelViewProps) => {
        const newView = subPanelView === SubPanelView.UNDEFINED ? view : SubPanelView.UNDEFINED;
        setSubPanelView(newView);
        openSubPanel({
            view: newView,
            props: newView === SubPanelView.UNDEFINED ? undefined : subPanelInfo
        });
    }

    const inlineDMButton: InputProps = {
        endAdornment: (
            <InlineDataMapper
                appearance="icon"
                tooltip="Create using Data Mapper"
                onClick={() => handleOpenSubPanel(SubPanelView.INLINE_DATA_MAPPER, { inlineDataMapper: {
                    filePath: "/Users/madusha/play/eggplant/ep0913/svc1.bal",
                    range: {
                        start: { line: 30, character: 12 },
                        end: { line: 30, character: 44 },
                    }
                }})}
            >
                <InlineDataMapperText>DM</InlineDataMapperText>
            </InlineDataMapper>
        )
    };

    return (
        <TextField
            id={field.key}
            {...register(field.key, { required: !field.optional, value: field.value })}
            value={field.value}
            label={field.label}
            required={!field.optional}
            description={field.documentation}
            labelAdornment={typeLabel(field.type)}
            sx={{ width: "100%" }}
            inputProps={field.key === "expression" ? inlineDMButton : undefined}
        />
    );
}
