/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { Button, Codicon, Icon, Typography } from "@wso2-enterprise/ui-toolkit";
import { FormHeaderSection } from "../components/FormComponents/FormFieldComponents/FormHeader/FormHeaderSection";

export interface RecordConfigTypeProps {
    isDataMapper?: boolean;
    onImportFromJson: () => void;
    onImportFromXml: () => void;
    onCreateNew: () => void;
    onCancel: () => void;
}

export function RecordConfigTypeSelector(props: RecordConfigTypeProps) {
    const { isDataMapper, onImportFromJson, onImportFromXml, onCreateNew, onCancel } = props;
    const intl = useIntl();

    const createNewButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.option.createNew",
        defaultMessage: "Create New",
    });
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
                    <LinePrimaryButton onClick={onCreateNew} data-test-id="create-new-btn">
                        <Typography variant="h5">{createNewButtonText}</Typography>
                        <Codicon name="add" />
                    </LinePrimaryButton>

                    <LinePrimaryButton onClick={onImportFromJson} data-test-id="import-json">
                        <Typography variant="h5">{importJsonButtonText}</Typography>
                        <Icon name="file-upload" />
                    </LinePrimaryButton>

                    <LinePrimaryButton
                        onClick={onImportFromXml}
                        data-test-id="import-xml"
                        disabled={onImportFromXml === null}
                    >
                        <Typography variant="h5">{importXmlButtonText}</Typography>
                        <Icon name="file-upload" />
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

const RecordFormWrapper = styled.div`
    width: "100%";
    max-height: 540;
    overflow-y: "scroll";
    flex-direction: "row";
`;

const CreateButtonWrapper = styled.div`
    display: "flex";
    margin: 16;
    flex-direction: "column";

    & button {
        margin-bottom: 16;
    }
`;

const BallerinaLabel = styled.p`
    color: "#4a4d55";
    font-size: 13;
    text-transform: "capitalize";
    font-weight: 300;
    text-align: "end";
`;

const LinePrimaryButton = styled(Button)`
    width: 100%;
`;
