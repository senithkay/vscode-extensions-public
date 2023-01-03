/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";
import { useIntl } from "react-intl";

import { Button } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import { FileUploadIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection, LinePrimaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { wizardStyles } from "../../style";
import { recordStyles } from "../style";

export interface RecordConfigTypeProps {
    isDataMapper?: boolean;
    onImportFromJson: () => void;
    onCreateNew: () => void;
    onCancel: () => void;
}

export function RecordConfigTypeSelector(props: RecordConfigTypeProps) {
    const { isDataMapper, onImportFromJson, onCreateNew, onCancel } = props;

    const overlayClasses = wizardStyles();
    const recordClasses = recordStyles();
    const intl = useIntl();

    const createNewButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.option.createNew",
        defaultMessage: "Create New",
    });
    const importJsonButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.option.importJson",
        defaultMessage: "Import a JSON",
    });

    return (
        <>
            {!isDataMapper && (
                <FormHeaderSection
                    formTitle={"lowcode.develop.configForms.recordEditor.codePanel.title"}
                    defaultMessage={"Record"}
                    onCancel={onCancel}
                />
            )}
            <div className={overlayClasses.recordFormWrapper}>
                <div className={recordClasses.createButtonWrapper}>
                    <LinePrimaryButton
                        text={createNewButtonText}
                        fullWidth={true}
                        onClick={onCreateNew}
                        dataTestId="create-new-btn"
                        startIcon={<AddIcon />}
                    />

                    <LinePrimaryButton
                        text={importJsonButtonText}
                        fullWidth={true}
                        onClick={onImportFromJson}
                        dataTestId="import-json"
                        startIcon={<FileUploadIcon />}
                    />
                </div>
            </div>
        </>
    );
}
