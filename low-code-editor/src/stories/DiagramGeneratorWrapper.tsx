import React, { useEffect } from 'react';

import { DiagramGenerator, DiagramGeneratorProps } from '../DiagramGenerator';

import { CodeEditor } from './CodeEditor/CodeEditor';


export function DiagramGeneratorWrapper(props: DiagramGeneratorProps) {
    const { langClientPromise, getFileContent, filePath, updateFileContent } = props;
    const [didOpen, setDidOpen ] = React.useState(false);
    const [fileContent, setFileContent ] = React.useState("");

    const updateFileContentOverride = (fPath: string, newContent: string) => {
        setFileContent(newContent);
        return updateFileContent(fPath, newContent);
    }

    const newProps = {
        ...props,
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
            <CodeEditor
                content={fileContent}
                filePath={filePath}
                // tslint:disable-next-line: jsx-no-multiline-js
                onChange={
                    // tslint:disable-next-line: jsx-no-lambda
                    (fPath, newContent) => {
                        updateFileContentOverride(fPath, newContent);
                    }
                }
            />
        </>;
}
