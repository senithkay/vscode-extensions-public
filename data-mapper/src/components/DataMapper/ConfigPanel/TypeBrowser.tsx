import styled from "@emotion/styled";
import { LinearProgress, TextField } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete'
import { CompletionResponse } from "@wso2-enterprise/ballerina-languageclient";
import { CompletionParams } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { Uri } from "monaco-editor";
import React, { useContext, useEffect, useState } from "react";
import { CompletionItemKind } from "vscode-languageserver-protocol";
import { addToTargetPosition } from "../../Diagram/utils/dm-utils";
import { CurrentFileContext } from "../Context/current-file-context";
import { LSClientContext } from "../Context/ls-client-context";

export interface TypeBrowserProps {
    type?: string;
    onChange: (newType: string) => void;
    imports?: string[];
    fnSTPosition: NodePosition;
    currentFileContent: string;
}

const typeLabelsToIgnore = ["StrandData"];

export interface CompletionResponseWithModule extends CompletionResponse {
    module?: string;
}

export function TypeBrowser(props: TypeBrowserProps) {
    const { type, onChange, imports, fnSTPosition, currentFileContent } = props;
    const [isLoading, setLoading] = useState(false);
    const [selectedTypeStr, setSelectedTypeStr] = useState(type?.split(':')?.pop() || '')

    const langClientPromise = useContext(LSClientContext);
    const { path, content } = useContext(CurrentFileContext);

    const [recordCompletions, setRecordCompletions] = useState<CompletionResponseWithModule[]>([]);

    useEffect(() => {
        setSelectedTypeStr(type?.split(':')?.pop() || '')
    }, [type])

    useEffect(() => {
        (async () => {
            setLoading(true);
            const completionMap = new Map<string, CompletionResponseWithModule>();
            const langClient = await langClientPromise;
            const completionParams: CompletionParams = {
                textDocument: { uri: Uri.file(path).toString() },
                position: { character: 0, line: 0 },
                context: { triggerKind: 22 },
            };
            const completions = await langClient.getCompletion(completionParams);
            const recCompletions = completions.filter((item) => item.kind === CompletionItemKind.Struct);
            recCompletions.forEach((item) => completionMap.set(item.insertText, item));

            // TODO: use constants defined in madusha's PR
            const exprFileUrl = Uri.file(path).toString().replace("file", "expr");
            langClient.didOpen({
                textDocument: {
                    languageId: "ballerina",
                    text: currentFileContent,
                    uri: exprFileUrl,
                    version: 1,
                },
            });

            for (const importStr of imports) {
                const moduleName = importStr.split("/").pop().replace(";", "");
                const updatedContent = addToTargetPosition(
                    currentFileContent,
                    {
                        startLine: fnSTPosition.endLine,
                        startColumn: fnSTPosition.endColumn,
                        endLine: fnSTPosition.endLine,
                        endColumn: fnSTPosition.endColumn,
                    },
                    `${moduleName}:`
                );

                langClient.didChange({
                    textDocument: { uri: exprFileUrl, version: 1 },
                    contentChanges: [{ text: updatedContent }],
                });

                const completions = await langClient.getCompletion({
                    textDocument: { uri: exprFileUrl },
                    position: { character: fnSTPosition.endColumn + moduleName.length + 1, line: fnSTPosition.endLine },
                    context: { triggerKind: 22 },
                });

                const recCompletions = completions.filter((item) => item.kind === CompletionItemKind.Struct);

                recCompletions.forEach((item) => {
                    if (!completionMap.has(item.insertText)) {
                        completionMap.set(item.insertText, { ...item, module: moduleName });
                    }
                });
            }
            langClient.didChange({
                textDocument: { uri: exprFileUrl, version: 1 },
                contentChanges: [{ text: currentFileContent }],
            });

            langClient.didClose({ textDocument: { uri: exprFileUrl } });

            const allCompletions = Array.from(completionMap.values()).filter(
                (item) => !(typeLabelsToIgnore.includes(item.label) || item.label.startsWith("("))
            );
            setRecordCompletions(allCompletions);
            setLoading(false);
        })();
    }, [content]);

    return (
        <>
            <Autocomplete
                key={`type-select-${isLoading}`}
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
                    <TypeSelectItem>
                        <TypeSelectItemLabel>{item.label}</TypeSelectItemLabel>
                        <TypeSelectItemModule>{item.module}</TypeSelectItemModule>
                    </TypeSelectItem>
                }
                blurOnSelect
                openOnFocus
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