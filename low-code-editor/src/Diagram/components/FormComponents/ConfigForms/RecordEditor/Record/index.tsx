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
import React from 'react';

import { FormState, useRecordEditorContext } from "../../../../../../Contexts/RecordEditor";
import { CodePanel} from "../CodePanel";
import { EditFieldForm } from "../EditFieldForm";
import { EditRecordForm } from "../EditRecordForm";
import { EditTypeDefForm } from "../EditTypeDefForm";
import { recordStyles } from "../style";

export function Record() {
    const { state } = useRecordEditorContext();

    const recordClasses = recordStyles();

    return (
        <div className={recordClasses.recordEditorContainer}>
            <CodePanel />
            <div className={recordClasses.recordConfigSeparator} />
            <div>
                {(state.currentForm === FormState.EDIT_RECORD_FORM && state.currentRecord.isTypeDefinition) && (
                    <EditTypeDefForm />
                )}
                {(state.currentForm === FormState.EDIT_RECORD_FORM && !state.currentRecord?.isTypeDefinition) && (
                    <EditRecordForm />
                )}
                {(state.currentForm === FormState.ADD_FIELD || state.currentForm === FormState.UPDATE_FIELD) && (
                    <EditFieldForm />
                )}
            </div>
        </div>
    );
}
