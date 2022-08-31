import styled from "@emotion/styled";
import React, { useState } from "react";
import { InputParamItem } from "./InputParam";
import { InputParamEditor } from "./InputParamEditor";
import { DataMapperInputParam } from "./types";

export interface InputConfigWidgetProps {}

export function InputParamsPanel()  {

    const [inputParams, setInputParams] = useState<DataMapperInputParam[]>([]);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [isAddingNew, setAddingNew] = useState(false);

    const enableAddNew = () => {
        setAddingNew(true);
    }

    const disableAddNew = () => {
        setAddingNew(false);
    }

    const onAddNew = (param: DataMapperInputParam) => {
        setInputParams([...inputParams, param]);
        setAddingNew(false);
    }

    const onUpdate = (index: number, param: DataMapperInputParam) => {
        setInputParams([
                ...inputParams.slice(0, index),
                param,
                ...inputParams.slice(0, index + 1)
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
       setInputParams([
            ...inputParams.filter((item, i) => (index !== i))
       ])
    }

    return (
        <InputParamsContainer>
                <div>Inputs</div>
                {inputParams.map((param, index) => (
                    editingIndex === index
                    ? <InputParamEditor param={param} onUpdate={onUpdate} onCancel={onUpdateCancel} />
                    : <InputParamItem index={index} inputParam={param} onEditClick={onEditClick} onDelete={onDeleteClick} />
                ))}
                {isAddingNew && <InputParamEditor onSave={onAddNew} onCancel={disableAddNew} />}
                {!isAddingNew && editingIndex === -1 && <button onClick={enableAddNew}>Add New</button>}
        </InputParamsContainer>
    );
}

const InputParamsContainer = styled.div(() => ({

}));