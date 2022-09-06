import styled from "@emotion/styled";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { CompletionResponse } from "@wso2-enterprise/ballerina-languageclient";
import { CompletionParams } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Uri } from "monaco-editor";
import React, { useContext, useEffect, useState } from "react";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver-protocol";
import { CurrentFileContext } from "../Context/current-file-context";
import { LSClientContext } from "../Context/ls-client-context";

export interface TypeBrowserProps {
    type?: string;
    onChange: (newType: string) => void;
}

export function TypeBrowser(props: TypeBrowserProps) {

    const { type, onChange } = props;

    const langClientPromise = useContext(LSClientContext);
    const { path, content } = useContext(CurrentFileContext);

    const [recordCompletions, setRecordCompletsions] = useState<CompletionResponse[]>([]);
    const [selectedType, setSelectedType] = useState<string>(type);

    const handleChange = (event: any) => {
        setSelectedType(event.target.value);
        onChange(event.target.value);
    };

    useEffect(() => {
        (async () => {
            const langClient = await langClientPromise;
            const completionParams: CompletionParams = {
                textDocument: {
                    uri: Uri.file(path).toString()
                },
                position: {
                    character: 0,
                    line: 0
                },
                context: {
                    triggerKind: 22
                }
            };
            const completions = await langClient.getCompletion(completionParams);
            const recordCompletions = completions.filter((completion) => completion.kind === CompletionItemKind.Struct);
            setRecordCompletsions(recordCompletions);
        })();
    }, [content]);
    
    return (
        <TypeSelect
          value={selectedType}
          onChange={handleChange}
        >
          {recordCompletions.map((item) => (
            <MenuItem value={item.insertText}>{item.label}</MenuItem>
          ))}
        </TypeSelect>
    );
}

const TypeSelect = styled(Select)`
    width: 100%;
    border: 1px solid #EEEEEE;
    border-radius: 5px;
    padding: 2px 6px;
`;