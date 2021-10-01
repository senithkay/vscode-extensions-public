/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useEffect, useState } from 'react';
import { useIntl } from "react-intl";

import { STNode } from "@ballerina/syntax-tree";

import { wizardStyles } from "../../../Diagram/components/ConfigForms/style";
import { PrimaryButton } from "../../../Diagram/components/Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Diagram/components/Portals/ConfigForm/Elements/Button/SecondaryButton";
import { VariableUserInputs } from '../../models/definitions';
import { EditorCancelContext } from '../../store/form-cancel-context';
import { ModelContext } from '../../store/model-context'
import { getDefaultModel } from "../../utils";
import { LeftPane } from '../LeftPane';
import { RightPane } from '../RightPane';

import { statementEditorStyles } from "./styles";

interface ViewProps {
    kind: string,
    label: string,
    formArgs: any,
    userInputs?: VariableUserInputs,
    onCancel: () => void
}

export function ViewContainer(props: ViewProps) {
    const { kind, label, userInputs, onCancel } = props;
    const intl = useIntl();

    const defaultModel = getDefaultModel(kind);
    const [onCancelClicked, setOnCancel] = useState(false);

    const currentModel: { model: STNode } = {
        model: defaultModel
    }

    const onCancelHandler = () => {
        setOnCancel(true);
    }

    useEffect(() => {
        return () => {
            onCancel();
        }
    }, [onCancelClicked])

    const overlayClasses = statementEditorStyles();
    const wizardStylesClasses = wizardStyles();

    const saveVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.cancelButton.text",
        defaultMessage: "Cancel"
    });

    return (
        <div className={overlayClasses.App}>
            <div className={overlayClasses.AppContentPane}>
                <ModelContext.Provider
                    value={{
                        statementModel: defaultModel
                    }}
                >
                    <EditorCancelContext.Provider
                        value={{
                            onCancelled: onCancelClicked
                        }}
                    >
                        <LeftPane
                            model={defaultModel}
                            currentModel={currentModel}
                            kind={kind}
                            label={label}
                            userInputs={userInputs}
                        />
                    </EditorCancelContext.Provider>
                </ModelContext.Provider>
                <div className={overlayClasses.vl} />
                <RightPane />
            </div>
            <div className={overlayClasses.AppBottomPane}>
                <div className={wizardStylesClasses.buttonWrapper}>
                    <SecondaryButton
                        text={cancelVariableButtonText}
                        fullWidth={false}
                        onClick={onCancelHandler}
                    />
                    <PrimaryButton
                        dataTestId="save-btn"
                        text={saveVariableButtonText}
                        disabled={true}
                        fullWidth={false}
                    />
                </div>
            </div>
        </div>
    )
}

