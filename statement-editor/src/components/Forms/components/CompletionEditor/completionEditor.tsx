import React, { ChangeEvent, ReactNode, useEffect, useState } from "react";

import TextField from "@material-ui/core/TextField";
import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import { Diagnostic, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { SuggestionItem } from "../../../../models/definitions";

import { useStyles as useTextInputStyles } from "./style";
import { ExpressionEditorHintProps } from "./utils";
import { InputAdornment } from "@material-ui/core";

interface CompletionEditorProps {
    model?: STNode;
    defaultValue?: string;
    completions?: SuggestionItem[];
    isActive?: boolean;
    diagsInRange?: Diagnostic[];
    onChange: (value: string) => void;
    onFocus?: () => void;
    placeholder?: string;
    customProps?: {
        optional?: boolean;
        isErrored?: boolean;
        startAdornment?: string;
    }
    errorMessage?: string;
    disabled?: boolean;
    dataTestId?: string;
}

export function CompletionEditor(props: CompletionEditorProps) {
    const { model, completions, isActive, placeholder, disabled, errorMessage, defaultValue, diagsInRange, dataTestId, onChange, onFocus } = props;
    const customProps = props.customProps;
    const [options, setOptions] = useState([]);
    const [hints, setHints] = useState<ExpressionEditorHintProps[]>([]);
    const textFieldClasses = useTextInputStyles();

    const handleChange = (event: ChangeEvent<{}>, value: string) => {
        if (onChange) {
            onChange(value);
        }
    };

    const handleOnFocus = () => {
        if (onFocus) {
            onFocus();
        }
    }

    useEffect(() => {
        if (completions) {
            const completionItems: string[] = [];
            completions.forEach(item => {
                completionItems.push(item.value);
            });
            setOptions(completionItems);
        }
    }, [completions]);

    const renderInput = (params: AutocompleteRenderInputParams): ReactNode => {
        return (
            <TextField
                {...params}
                placeholder={placeholder}
                error={customProps.isErrored}
                helperText={errorMessage}
                InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    // tslint:disable-next-line: jsx-curly-spacing
                    classes: {
                        root: textFieldClasses.textFeild,
                        error: textFieldClasses.errorField,
                    },
                    startAdornment: customProps.startAdornment ?
                        <InputAdornment position="start">{customProps.startAdornment}</InputAdornment> : null
                }}
            />
        )
    };
    return (
        <div>
            <Autocomplete
                data-testid={dataTestId}
                freeSolo={true}
                options={options}
                disabled={disabled}
                renderInput={renderInput}
                onChange={handleChange}
                onFocus={handleOnFocus}
                onInputChange={handleChange}
                defaultValue={defaultValue}
            />
        </div>
    );
}

