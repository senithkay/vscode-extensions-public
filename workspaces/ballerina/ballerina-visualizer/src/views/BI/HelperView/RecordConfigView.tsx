/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import styled from "@emotion/styled";
import { LineRange, PropertyTypeMemberInfo } from "@wso2-enterprise/ballerina-core";
import { ConfigurePanelData } from "@wso2-enterprise/ballerina-core";
import { RecordTypeField } from "@wso2-enterprise/ballerina-core";
import { ExpressionFormField } from "@wso2-enterprise/ballerina-side-panel";
import { Button, Codicon, Divider, Dropdown, SidePanelTitleContainer, ThemeColors, Typography } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";
import { ConfigureView } from "./ConfigureView";

const TitleContainer = styled.div<{ isLink?: boolean }>`
    display: flex;
    align-items: center;
    gap: 4px;
    ${({ isLink }: { isLink?: boolean }) =>
        isLink &&
        `
        cursor: pointer;
    `}
`;

const HeaderContainer = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 8px;
    margin-bottom: 10px;
    padding: 10px;
`;

export const CloseButton = styled(Button)`
        position: absolute;
        right: 10px;
        border-radius: 5px;
    `;

export const LabelContainer = styled.div({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingBottom: '10px'
});

export const StyledButton = styled(Button)`
        border-radius: 5px;
    `;

interface RecordConfigViewProps {
    filePath: string;
    position: LineRange;
    updateFormField: (data: ExpressionFormField) => void;
    editorKey: string;
    onClosePanel: () => void;
    configurePanelData?: ConfigurePanelData;
    recordTypeField?: RecordTypeField;
}

export function RecordConfigView(props: RecordConfigViewProps) {
    const { filePath, position, updateFormField, editorKey, onClosePanel, configurePanelData, recordTypeField } = props;

    const [selectedMember, setSelectedMember] = useState<PropertyTypeMemberInfo | null>(null);

    useEffect(() => {
        if (recordTypeField) {
            const selectedMember = recordTypeField.recordTypeMembers.find(member => member.selected)
                || recordTypeField.recordTypeMembers[0];
            setSelectedMember(selectedMember);
            console.log("Selected member:", selectedMember);
        }
    }, [recordTypeField]);

    const handleMemberChange = (value: string) => {

        const member = recordTypeField.recordTypeMembers.find(m => m.type === value);
        if (member) {
            setSelectedMember(member);
        }
    };


    return (
        <>
            {/* <HeaderContainer>
                <TitleContainer>
                    <Typography sx={{ margin: 0 }}>{`Construct ${recordTypeField.key}`}</Typography>
                </TitleContainer>
                <CloseButton appearance="icon" onClick={onClosePanel}>
                    <Codicon name="close" />
                </CloseButton>
            </HeaderContainer>
            <Divider /> */}
            <SidePanelTitleContainer>

            <Typography sx={{
                fontFamily: "GilmerRegular"
            }} > {`Construct ${recordTypeField.key} expression`}</Typography>

               
                <StyledButton appearance="icon" onClick={onClosePanel}>
                    <Codicon name="close" />
                </StyledButton>
            </SidePanelTitleContainer>
            <div style={{ padding: "10px" }}>

            <LabelContainer>
                {recordTypeField?.recordTypeMembers.length > 1 && (
                    <Dropdown
                        id="type-selector"
                        label="Type"
                        value={selectedMember?.type}
                        items={recordTypeField.recordTypeMembers.map((member) => ({
                            label: member.type,
                            value: member.type
                        }))}
                        onValueChange={(value) => handleMemberChange(value)}
                    />
                )}
            </LabelContainer>
            {selectedMember &&
                    <ConfigureView filePath={filePath} position={position} updateFormField={updateFormField} editorKey={editorKey} configurePanelData={configurePanelData} recordTypeField={recordTypeField} selectedMember={selectedMember} />
                }
            </div>
        </>
    );
}
