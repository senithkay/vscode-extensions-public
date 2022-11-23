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
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { IconButton, Link } from "@material-ui/core";
import { DeleteButton, UndoIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { ModulePart, STKindChecker, STNode, TypeDefinition  } from "@wso2-enterprise/syntax-tree";
import classNames from 'classnames';

import { PrimaryButtonSquare } from "../../../../../../components/Buttons/PrimaryButtonSquare";
import Tooltip from "../../../../../../components/TooltipV2";
import { Context } from "../../../../../../Contexts/Diagram";
import { updatePropertyStatement } from "../../../../../utils";
import { UndoRedoManager } from "../../../UndoRedoManager";
import { wizardStyles } from "../../style";
import { RecordEditor } from "../index";
import { recordStyles } from "../style";
import { RecordItemModel } from "../types";
import { extractImportedRecordNames, getActualRecordST, getAvailableCreatedRecords, getRemoveCreatedRecordRange } from "../utils";

import { RecordItem } from "./RecordItem";

export interface RecordOverviewProps {
    definitions: TypeDefinition | ModulePart;
    prevST?: STNode;
    undoRedoManager?: UndoRedoManager;
    onComplete: () => void;
    onCancel: () => void;
}

export function RecordOverview(overviewProps: RecordOverviewProps) {
    const { definitions, prevST, undoRedoManager, onComplete, onCancel } = overviewProps;

    const overlayClasses = wizardStyles();
    const recordClasses = recordStyles();

    const { props: { syntaxTree, currentFile }, api: { code: { modifyDiagram } } } = useContext(Context);

    const intl = useIntl();
    const doneButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.overview.doneBtnText",
        defaultMessage: "Finish"
    });

    const successMsgText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.overview.doneBtnText",
        defaultMessage: "Succcesfully imported the JSON Please use following section to further edit"
    });

    const overviewSelectAll = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.overview.overviewSelectAll",
        defaultMessage: "Select All"
    });

    const deleteSelected = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.overview.deleteSelected",
        defaultMessage: "Delete Selected"
    });

    const [selectedRecord, setSelectedRecord] = useState<string>();
    const createdDefinitions = extractImportedRecordNames(definitions);
    const [recordNames, setRecordNames] = useState<RecordItemModel[]>(createdDefinitions);
    const [originalSource] = useState<STNode>(prevST);

    const onEditClick = (record: string) => {
        setSelectedRecord(record);
    }

    const handleOnCheck = () => {
        setRecordNames(recordNames);
    }

    const renderRecords = () => {
        const records: ReactNode[] = [];
        if (STKindChecker.isModulePart(definitions)) {
            recordNames.forEach(typeDef => {
                records.push(<RecordItem record={typeDef} onEditClick={onEditClick} handleOnCheck={handleOnCheck} />)
            });
        } else if (STKindChecker.isTypeDefinition(definitions) && recordNames.length > 0) {
            records.push(<RecordItem record={recordNames[0]} onEditClick={onEditClick} handleOnCheck={handleOnCheck} />);
        }
        setListRecords(records);
    }


    useEffect(() => {
        renderRecords();
    }, [recordNames]);

    useEffect(() => {
        if (syntaxTree.source !== originalSource.source) {
            const createdRecords = getAvailableCreatedRecords(createdDefinitions, syntaxTree);
            setRecordNames(getAvailableCreatedRecords(createdDefinitions, syntaxTree));
            if (createdRecords.length === 0) {
                onCancel();
            }
        }
    }, [syntaxTree]);

    const [listRecords, setListRecords] = useState<ReactNode[]>([]);
    const actualSelectedRecordSt = selectedRecord ? getActualRecordST(syntaxTree, selectedRecord) : undefined;

    const onCancelEdit = () => {
        setSelectedRecord("");
    }

    const onDeleteSelected = () => {
        const selectedRecords: string[] = [];
        const recordNameClone = [...recordNames];
        recordNames.forEach(record => {
            if (record.checked) {
                selectedRecords.push(record.name);
                const index = recordNameClone.findIndex(item => item.name === record.name);
                if (index !== -1) {
                    recordNameClone.splice(index, 1);
                }
            }
        })
        setRecordNames(recordNameClone);
        undoRedoManager.updateContent(currentFile.path, currentFile.content);
        undoRedoManager.addModification(currentFile.content);
        modifyDiagram(getRemoveCreatedRecordRange(selectedRecords, syntaxTree));
        if (recordNameClone.length === 0) {
            onCancel();
        }
    }

    const onSelectAll = () => {
        let checkAll = true;
        if (recordNames.every(value => value.checked)) {
            checkAll = false;
        }
        recordNames.forEach(record => {
            record.checked = checkAll;
        })
        setRecordNames(recordNames);
        renderRecords();
    }

    const handleUndo = () => {
        const lastUpdateSource = undoRedoManager.undo();
        modifyDiagram([updatePropertyStatement(lastUpdateSource, syntaxTree.position)]);
        if (lastUpdateSource === originalSource.source) {
            // If original source matches to last updated source we assume there are no newly created record.
            // Hence, we are closing the form.
            onCancel();
        }
    }

    return (
        <>
            {!selectedRecord ? (
                <>
                    <FormHeaderSection
                        formTitle={"lowcode.develop.configForms.recordEditor.codePanel.title"}
                        defaultMessage={"Record"}
                        onCancel={onCancel}
                    />
                    {listRecords?.length > 0 && (
                        <div className={recordClasses.inputLabelWrapper}>
                            <p className={recordClasses.inputLabel}>{successMsgText}</p>
                        </div>
                    )}
                    <div className={overlayClasses.recordFormWrapper}>
                        {listRecords}
                    </div>
                    <div className={recordClasses.recordOptions}>
                        <Link
                            key={'select-all'}
                            onClick={onSelectAll}
                            className={recordClasses.marginSpace}
                        >
                            {overviewSelectAll}
                        </Link>

                        <div className={classNames(recordClasses.deleteRecord, recordClasses.marginSpace)} onClick={onDeleteSelected} >
                            <DeleteButton /> {deleteSelected}
                        </div>

                        <Tooltip type="info" text={{content: "Undo"}} placement="bottom-end">
                            <IconButton
                                onClick={handleUndo}
                                className={classNames(recordClasses.undoButton, recordClasses.marginSpace)}
                                data-testid="overview-undo"
                            >
                                <UndoIcon />
                            </IconButton>
                        </Tooltip>

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
                    onCancel={onCancelEdit}
                />
            )}
        </>
    )
}
