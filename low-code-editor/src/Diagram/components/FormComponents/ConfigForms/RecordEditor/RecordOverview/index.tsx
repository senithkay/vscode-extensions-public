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
import React, { ReactNode, useContext, useState } from "react";
import { useIntl } from "react-intl";

import { FormHeaderSection } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { ModulePart, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { PrimaryButtonSquare} from "../../../../../../components/Buttons/PrimaryButtonSquare";
import { Context } from "../../../../../../Contexts/Diagram";
import { removeStatement}  from "../../../../../utils";
import { useStyles } from "../../../DynamicConnectorForm/style";
import { wizardStyles } from "../../style";
import { RecordEditor } from "../index";
import { recordStyles } from "../style";
import { extractImportedRecordNames, getActualRecordST, getCreatedRecordRange } from "../utils";

import { RecordItem } from "./RecordItem";

export interface RecordOverviewProps {
    definitions: TypeDefinition | ModulePart;
    onComplete: () => void;
    onCancel: () => void;
}

export function RecordOverview(overviewProps: RecordOverviewProps) {
    const { definitions, onComplete, onCancel } = overviewProps;

    const overlayClasses = wizardStyles();
    const recordClasses = recordStyles();

    const { props : { syntaxTree } , api : { code: { modifyDiagram } } } = useContext(Context);

    const intl = useIntl();
    const doneButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.overview.doneBtnText",
        defaultMessage: "Done"
    });

    const [selectedRecord, setSelectedRecord] = useState<string>();

    const onEditClick = (record: string) => {
        setSelectedRecord(record);
    }

    const onDeleteClick = (record: string) => {
        const recordNameClone = [...recordNames];
        const index = recordNameClone.indexOf(record);
        if (index !== -1) {
            recordNameClone.splice(index, 1);
        }
        setRecordNames(recordNameClone);
        if (recordNames.length === 1) {
            modifyDiagram([removeStatement(getActualRecordST(syntaxTree, record).position)]);
            onCancel();
        } else {
            modifyDiagram([removeStatement(getActualRecordST(syntaxTree, record).position)]);
        }
    }

    const onDeleteAllClick = () => {
        modifyDiagram([removeStatement(getCreatedRecordRange(recordNames, syntaxTree))]);
        onCancel();
    }

    const [recordNames, setRecordNames] = useState<string[]>(extractImportedRecordNames(definitions));
    const records: ReactNode[] = [];
    if (STKindChecker.isModulePart(definitions)) {
        recordNames.forEach(typeDef => records.push(
            <RecordItem record={typeDef} onEditClick={onEditClick} onDelete={onDeleteClick} />
        ))
    } else if (STKindChecker.isTypeDefinition(definitions)) {
        records.push(
            <RecordItem record={definitions.typeName.value} onEditClick={onEditClick} onDelete={onDeleteClick} />
        );
    }

    const actualSelectedRecordSt = selectedRecord ? getActualRecordST(syntaxTree, selectedRecord) : undefined;

    return (
        <>
            {!selectedRecord ? (
                <>
                    <FormHeaderSection
                        formTitle={"lowcode.develop.configForms.recordEditor.codePanel.title"}
                        defaultMessage={"Record"}
                        onCancel={onCancel}
                    />
                    {records?.length > 0 && (
                        <div className={recordClasses.inputLabelWrapper}>
                            <p className={recordClasses.inputLabel}>Successfully created following records. Click</p>
                            <p onClick={onDeleteAllClick} className={recordClasses.inputLink}>Here</p>
                            <p className={recordClasses.inputLabel}>to Undo</p>
                        </div>
                    )}
                    <div className={overlayClasses.recordFormWrapper}>
                        {records}
                    </div>
                    <div className={recordClasses.doneButtonWrapper}>
                        <PrimaryButtonSquare
                            testId="done-btn"
                            text={doneButtonText}
                            fullWidth={false}
                            onClick={onComplete}
                        />
                    </div>
                </>
            ) : (
                <RecordEditor
                    name={actualSelectedRecordSt.typeName.value}
                    targetPosition={actualSelectedRecordSt.position}
                    onSave={null}
                    model={actualSelectedRecordSt}
                    isTypeDefinition={true}
                    formType={""}
                    onCancel={onCancel}
                />
            )}
        </>
    )
}
