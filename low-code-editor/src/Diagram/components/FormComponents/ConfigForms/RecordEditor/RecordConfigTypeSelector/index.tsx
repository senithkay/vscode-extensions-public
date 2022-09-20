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
import React  from "react";
import { useIntl } from "react-intl";

import { Button } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import { FormHeaderSection } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';

import { wizardStyles } from "../../style";
import { recordStyles } from "../style";

export interface RecordConfigTypeProps {
    onImportFromJson: () => void;
    onCreateNew: () => void;
    onCancel: () => void;
}

export function RecordConfigTypeSelector(props: RecordConfigTypeProps) {
    const { onImportFromJson, onCreateNew, onCancel } = props;

    const overlayClasses = wizardStyles();
    const recordClasses = recordStyles();
    const intl = useIntl();

    const createNewButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.option.createNew",
        defaultMessage: "Create New"
    });
    const importJsonButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.option.importJson",
        defaultMessage: "Import a JSON"
    });

    return (
        <>
            <FormHeaderSection
                formTitle={"lowcode.develop.configForms.recordEditor.codePanel.title"}
                defaultMessage={"Record"}
                onCancel={onCancel}
            />
            <div className={overlayClasses.recordFormWrapper}>
                <div className={recordClasses.createButtonWrapper}>
                    <Button
                        data-test-id="create-new-btn"
                        onClick={onCreateNew}
                        className={recordClasses.createButton}
                        startIcon={<AddIcon/>}
                        color="primary"
                    >
                        {createNewButtonText}
                    </Button>
                    <Button
                        data-test-id="import-json"
                        onClick={onImportFromJson}
                        className={recordClasses.createButton}
                        startIcon={<AddIcon/>}
                        color="primary"
                    >
                        {importJsonButtonText}
                    </Button>
                </div>
            </div>
        </>
    )
}
