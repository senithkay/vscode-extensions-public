import React, { ChangeEvent, ReactNode, useEffect, useState } from "react";

import { InputAdornment } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import { Diagnostic, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { SuggestionItem } from "../../../../models/definitions";

import { useStyles as useTextInputStyles } from "./style";
import { ExpressionEditorHintProps } from "./utils";

interface CompletionEditorProps {
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
    const { completions, placeholder, disabled, errorMessage, defaultValue, dataTestId, onChange, onFocus } = props;
    const customProps = props.customProps;
    const [options, setOptions] = useState([]);
    const [hints, setHints] = useState<ExpressionEditorHintProps[]>([]);
    const textFieldClasses = useTextInputStyles();

    // const filterByLabel = (label: string): SuggestionItem => {
    //     let suggestionItem: SuggestionItem = undefined;
    //     for (const completion of completions) {
    //         if (completion.label === label) {
    //             suggestionItem = completion;
    //             break;
    //         }
    //     }
    //     return suggestionItem;
    // };

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
        const inputProps = {
            ...params.InputProps,
            disableUnderline: true,
            // tslint:disable-next-line: jsx-curly-spacing
            classes: {
                root: textFieldClasses.textFeild,
                error: textFieldClasses.errorField,
            },
            startAdornment: customProps.startAdornment ?
                <InputAdornment position="start">{customProps.startAdornment}</InputAdornment> : null
        };
        return (
            <TextField
                {...params}
                placeholder={placeholder}
                error={customProps.isErrored}
                helperText={errorMessage}
                InputProps={inputProps}
            />
        )
    };
    return (
        <div>
            <Autocomplete
                data-testid={dataTestId}
                freeSolo={true}
                options={options}
                open={options.length > 0}
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

