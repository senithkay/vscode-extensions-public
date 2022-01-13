import React, { useEffect } from 'react';

import { DiagramGenerator, DiagramGeneratorProps } from '../DiagramGenerator';

import { CodeEditor } from './CodeEditor/CodeEditor';


export function DiagramGeneratorWrapper(props: DiagramGeneratorProps) {
    const { langClientPromise, getFileContent, filePath, updateFileContent, lastUpdatedAt } = props;
    const [didOpen, setDidOpen ] = React.useState(false);
    const [fileContent, setFileContent ] = React.useState("");
    const [lastUpdated, setLastUpdated ] = React.useState(lastUpdatedAt);

    const updateFileContentOverride = (fPath: string, newContent: string) => {
        setFileContent(newContent);
        return updateFileContent(fPath, newContent);
    }

    const newProps = {
        ...props,
        lastUpdatedAt: lastUpdated,
        updateFileContent: updateFileContentOverride
    }

    useEffect(() => {
        async function openFileInLS() {
            const text = await getFileContent(filePath);
            const langClient = await langClientPromise;
            langClient.didOpen({
                textDocument: {
                  languageId: "ballerina",
                  text,
                  uri: `file://${filePath}`,
                  version: 1
                }
            });
            setDidOpen(true);
            setFileContent(text)
        }

        async function closeFileInLS() {
            const langClient = await langClientPromise;
            langClient.didClose({
                textDocument: {
                  uri: `file://${filePath}`,
                }
            });
            setDidOpen(true);
        }
        openFileInLS();
        return () => {
            closeFileInLS();
        }
    }, []);

    return !didOpen ? <>Opening the document...</>
        :
        // tslint:disable-next-line: jsx-wrap-multiline
        <>
            <DiagramGenerator {...newProps} />
            <hr/>
            <CodeEditor
                content={fileContent}
                filePath={filePath}
                // tslint:disable-next-line: jsx-no-multiline-js
                onChange={
                    // tslint:disable-next-line: jsx-no-lambda
                    (fPath, newContent) => {
                        updateFileContentOverride(fPath, newContent);
                        langClientPromise.then((langClient) => {
                            langClient.didChange({
                                textDocument: {
                                    uri: `file://${filePath}`,
                                    version: 1
                                },
                                contentChanges: [
                                    {
                                        text: newContent
                                    }
                                ]
                            });
                            setLastUpdated((new Date()).toISOString());
                        })
                    }
                }
            />
            <code id='file-content-holder' style={{ display: "none" }}>
                {fileContent}
            </code>
        </>;
}
