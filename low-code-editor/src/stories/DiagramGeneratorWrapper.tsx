import React, { useEffect } from 'react';

import { DiagramGenerator, DiagramGeneratorProps } from '../DiagramGenerator';


export function DiagramGeneratorWrapper(props: DiagramGeneratorProps) {
    const { langClientPromise, getFileContent, filePath } = props;
    const [didOpen, setDidOpen ] = React.useState(false);

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

    return !didOpen ? <>Opening the document...</> : <DiagramGenerator {...props} />;
}
