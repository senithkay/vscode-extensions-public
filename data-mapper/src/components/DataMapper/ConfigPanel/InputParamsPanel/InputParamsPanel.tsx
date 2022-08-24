import styled from "@emotion/styled";
import React, { useState } from "react";
import { InputParamItem } from "./InputParam";
import { InputParamEditor } from "./InputParamEditor";

export interface InputConfigWidgetProps {}

export function InputParamsPanel()  {

    const [inputParams, setInputParams] = useState([]);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [isAddingNew, setAddingNew] = useState(true);

    return (
        <InputParamsContainer>
                {inputParams.map((param, index) => (
                    editingIndex === index
                    ? <InputParamEditor />
                    : <InputParamItem inputParam={param} />
                ))}
                {isAddingNew && <InputParamEditor />}
        </InputParamsContainer>
    );
}

const InputParamsContainer = styled.div(() => ({

}));