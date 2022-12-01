// tslint:disable: jsx-no-lambda jsx-no-multiline-js
import React, { useEffect, useState } from "react";

import styled from "@emotion/styled";
import { LinearProgress, TextField } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete'
import { CompletionResponse } from "@wso2-enterprise/ballerina-languageclient";

export interface TypeBrowserProps {
    type?: string;
    onChange: (newType: string) => void;
    isLoading: boolean;
    recordCompletions: CompletionResponseWithModule[];
}

export interface CompletionResponseWithModule extends CompletionResponse {
    module?: string;
}

export function TypeBrowser(props: TypeBrowserProps) {
    const { type, onChange, isLoading, recordCompletions } = props;
    const [selectedTypeStr, setSelectedTypeStr] = useState(type?.split(':')?.pop() || '')

    useEffect(() => {
        setSelectedTypeStr(type?.split(':')?.pop() || '')
    }, [type])


    return (
        <>
            <Autocomplete
                key={`type-select-${isLoading.toString()}`}
                data-testid='type-select-dropdown'
                getOptionLabel={(option) => option?.insertText}
                options={recordCompletions}
                disabled={isLoading}
                inputValue={selectedTypeStr}
                onInputChange={(_, value) => {
                    if (!isLoading) {
                        setSelectedTypeStr(value)
                    }
                }}
                defaultValue={recordCompletions.find(item => item.insertText === type?.split(':')?.pop())}
                onChange={(_, value: CompletionResponseWithModule) => onChange(value?.module ? `${value.module}:${value.insertText}` : value?.insertText)}
                renderInput={(params) => <TextFieldStyled {...params} autoFocus={!isLoading && !selectedTypeStr} />}
                renderOption={(item) =>
                    (
                        <TypeSelectItem>
                            <TypeSelectItemLabel>{item.label}</TypeSelectItemLabel>
                            <TypeSelectItemModule>{item.module}</TypeSelectItemModule>
                        </TypeSelectItem>
                    )
                }
                blurOnSelect={true}
                openOnFocus={true}
            />
            {isLoading && <LinearProgress />}
        </>
    );
}

const TypeSelectItem = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
`;

const TypeSelectItemLabel = styled.div`
    word-break: break-word;
    flex: 1;
`;

const TypeSelectItemModule = styled.div`
    color: #8d91a3;
    font-size: 11px;
`;

const TextFieldStyled = styled(TextField)`
    width: 100%;
    border: 1px solid #DEE0E7;
    border-radius: 5px;
    padding: 2px 6px;
    background-color: #ffffff;
`;
