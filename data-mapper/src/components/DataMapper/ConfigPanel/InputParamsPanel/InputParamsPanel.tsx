import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { Title } from "../DataMapperConfigPanel";
import { RecordButtonGroup } from "../RecordButtonGroup";
import { InputParamItem } from "./InputParam";
import { InputParamEditor } from "./InputParamEditor";
import { DataMapperInputParam } from "./types";

export interface InputConfigWidgetProps {
    inputParams: DataMapperInputParam[];
    newRecordParam: string;
    isAddExistType: boolean;
    onUpdateParams: (newParams: DataMapperInputParam[]) => void;
    enableAddNewRecord: () => void;
    setAddExistType: (value: boolean) => void;
}

export function InputParamsPanel(props: InputConfigWidgetProps)  {

    const { inputParams, isAddExistType, newRecordParam, onUpdateParams, enableAddNewRecord, setAddExistType } = props;

    const [editingIndex, setEditingIndex] = useState(-1);

    const handleEnableAddNewRecord = () => {
        enableAddNewRecord();
        enableAddNew();
    }

    const enableAddNew = () => {
        setAddExistType(true);
    }

    const disableAddNew = () => {
        setAddExistType(false);
    }

    const onAddNew = (param: DataMapperInputParam) => {
        onUpdateParams([...inputParams, param]);
        setAddExistType(false);
    }

    const onUpdate = (index: number, param: DataMapperInputParam) => {
        onUpdateParams([
                ...inputParams.slice(0, index),
                param,
                ...inputParams.slice(index + 1)
        ]);
        setEditingIndex(-1);
    }

    const onUpdateCancel = () => {
        setEditingIndex(-1);
    }

    const onEditClick= (index: number, param: DataMapperInputParam) => {
        setEditingIndex(index);
    }

    const onDeleteClick= (index: number, param: DataMapperInputParam) => {
        onUpdateParams([
            ...inputParams.filter((item, i) => (index !== i))
       ])
    }

    return (
        <InputParamsContainer>
                <Title>Inputs</Title>
                {inputParams.map((param, index) => (
                    editingIndex === index
                    ? <InputParamEditor index={editingIndex} param={param} onUpdate={onUpdate} onCancel={onUpdateCancel} />
                    : <InputParamItem index={index} inputParam={param} onEditClick={onEditClick} onDelete={onDeleteClick} />
                ))}
                {isAddExistType && <InputParamEditor param={{name: "", type: newRecordParam}} onSave={onAddNew} onCancel={disableAddNew} />}
                {!isAddExistType && editingIndex === -1 && 
                    <RecordButtonGroup openRecordEditor={handleEnableAddNewRecord} showTypeList={enableAddNew} />
                }
        </InputParamsContainer>
    );
}

const InputParamsContainer = styled.div(() => ({

}));