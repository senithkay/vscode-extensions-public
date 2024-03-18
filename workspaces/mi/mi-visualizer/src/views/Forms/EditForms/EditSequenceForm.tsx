/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import {
    Button,
    TextField,
    SidePanel,
    SidePanelTitleContainer,
    SidePanelBody,
    Codicon,
    CheckBox,
    CheckBoxGroup,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { SIDE_PANEL_WIDTH } from "../../../constants";

export type Protocol = "http" | "https";

export type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

export type EditSequenceForm = {
    name: string;
    trace: boolean;
    statistics: boolean;
    onError: string;
};

export type ResourceProps = {
    isOpen: boolean;
    sequenceData: EditSequenceForm;
    onCancel: () => void;
    onSave: (data: EditSequenceForm) => void;
};

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;

const SidePanelBodyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
`;

export function EditSequenceForm({ sequenceData, isOpen, onCancel, onSave }: ResourceProps) {
    const [name, setName] = useState<string>(sequenceData.name);
    const [trace, setTrace] = useState<boolean>(sequenceData.trace);
    const [statistics, setStatistics] = useState<boolean>(sequenceData.statistics);
    const [onError, setOnError] = useState<string>(sequenceData.onError);

    const isValid = name.length > 0;

    const isUpdated =
        sequenceData.name !== name ||
        sequenceData.trace !== trace ||
        sequenceData.statistics !== statistics ||
        sequenceData.onError !== onError;
    return (
        <SidePanel
            isOpen={isOpen}
            alignmanet="right"
            width={SIDE_PANEL_WIDTH}
            overlay={false}
            sx={{ transition: "all 0.3s ease-in-out" }}
        >
            <SidePanelTitleContainer>
                <div>Edit Sequence</div>
                <Button onClick={onCancel} appearance="icon">
                    <Codicon name="close" />
                </Button>
            </SidePanelTitleContainer>
            <SidePanelBody>
                <SidePanelBodyWrapper>
                    <h3>Sequence</h3>
                    <TextField
                        id="seq-name"
                        label="Name"
                        value={name}
                        onChange={setName}
                        size={150}
                        errorMsg={name.length > 0 ? undefined : "Required field"}
                    />
                    <CheckBoxGroup columns={2}>
                        <CheckBox label="Statistics" value="statistics" checked={statistics} onChange={setStatistics} />
                        <CheckBox label="Trace" value="trace" checked={trace} onChange={setTrace} />
                    </CheckBoxGroup>
                    <TextField id="seq-on-error" label="On Error" value={onError} onChange={setOnError} size={150} />
                    <ActionContainer>
                        <Button appearance="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={() =>
                                onSave({
                                    name,
                                    trace,
                                    statistics,
                                    onError,
                                })
                            }
                            disabled={!isValid || !isUpdated}
                        >
                            Update
                        </Button>
                    </ActionContainer>
                </SidePanelBodyWrapper>
            </SidePanelBody>
        </SidePanel>
    );
}

