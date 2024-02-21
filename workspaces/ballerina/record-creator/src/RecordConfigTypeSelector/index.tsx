/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";
import { useIntl } from "react-intl";
import styled from "@emotion/styled";
import { Button, Icon, Typography } from "@wso2-enterprise/ui-toolkit";
import { FormHeaderSection } from "../components/FormComponents/FormFieldComponents/FormHeader/FormHeaderSection";
import { RecordFormWrapper } from "../style";

export interface RecordConfigTypeProps {
    isDataMapper?: boolean;
    onImportFromJson: () => void;
    onImportFromXml: () => void;
    onCancel: () => void;
}

export function RecordConfigTypeSelector(props: RecordConfigTypeProps) {
    const { isDataMapper, onImportFromJson, onImportFromXml } = props;
    const intl = useIntl();
    const importJsonButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.option.importJson",
        defaultMessage: "Import a JSON",
    });
    const importXmlButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.option.importXml",
        defaultMessage: "Import an XML",
    });

    return (
        <>
            {!isDataMapper && (
                <FormHeaderSection
                    formTitle="lowcode.develop.configForms.recordEditor.codePanel.title"
                    defaultMessage="Record"
                />
            )}
            <RecordFormWrapper>
                <CreateButtonWrapper>
                    <LinePrimaryButton onClick={onImportFromJson} data-test-id="import-json">
                        <Icon
                            sx={{ width: "16px", marginRight: "4px" }}
                            iconSx={{ fontSize: "16px" }}
                            name="file-upload"
                        />
                        <LineButtonTitle variant="h5">{importJsonButtonText}</LineButtonTitle>
                    </LinePrimaryButton>

                    <LinePrimaryButton
                        onClick={onImportFromXml}
                        data-test-id="import-xml"
                        disabled={onImportFromXml === null}
                    >
                        <Icon
                            sx={{ width: "16px", marginRight: "4px" }}
                            iconSx={{ fontSize: "16px" }}
                            name="file-upload"
                        />
                        <LineButtonTitle variant="h5">{importXmlButtonText}</LineButtonTitle>
                    </LinePrimaryButton>
                    {onImportFromXml === null && (
                        <BallerinaLabel>
                            To enable XML import, update the Ballerina version to 2201.7.2 or later.
                        </BallerinaLabel>
                    )}
                </CreateButtonWrapper>
            </RecordFormWrapper>
        </>
    );
}

const CreateButtonWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;

    & button {
        margin-bottom: 16px;
    }
`;

const BallerinaLabel = styled.p`
    color: #4a4d55;
    font-size: 13;
    text-transform: capitalize;
    font-weight: 300;
    text-align: end;
`;

const LinePrimaryButton = styled(Button)`
    width: 100% !important;

    & vscode-button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const LineButtonTitle = styled(Typography)`
    margin: 0;
`;
