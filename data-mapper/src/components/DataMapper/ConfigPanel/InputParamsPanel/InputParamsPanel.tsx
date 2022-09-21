import styled from "@emotion/styled";
import Button from "@material-ui/core/Button";
import AddIcon from '@material-ui/icons/Add'
import React, { useEffect, useState } from "react";
import { Title } from "../DataMapperConfigPanel";
import { InputParamItem } from "./InputParam";
import { InputParamEditor } from "./InputParamEditor";
import { DataMapperInputParam } from "./types";

export interface InputConfigWidgetProps {
    inputParams: DataMapperInputParam[];
    isAddExistType: boolean;
    onUpdateParams: (newParams: DataMapperInputParam[]) => void;
    enableAddNewRecord: () => void;
    setAddExistType: (value: boolean) => void;
}

export function InputParamsPanel(props: InputConfigWidgetProps)  {

    const { inputParams, isAddExistType, onUpdateParams, enableAddNewRecord, setAddExistType } = props;

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
                {isAddExistType && <InputParamEditor onSave={onAddNew} onCancel={disableAddNew} />}
                {!isAddExistType && editingIndex === -1 && 
                                <>
                                    <Button
                                        onClick={handleEnableAddNewRecord}
                                        startIcon={<AddIcon />}
                                        color="primary"
                                    >
                                        From New Record
                                    </Button>
                                    <Button
                                        onClick={enableAddNew}
                                        startIcon={<AddIcon />}
                                        color="primary"
                                    >
                                        From Existing Record
                                    </Button>
                                </>
                }
        </InputParamsContainer>
    );
}

const InputParamsContainer = styled.div(() => ({

}));