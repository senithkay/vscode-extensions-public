import React, { useEffect } from 'react';


import { CodeEditor } from './CodeEditor/CodeEditor';

import { DataMapper } from '../components/DataMapper/DataMapper';
import { FunctionDefinition, ModulePart, STKindChecker } from '@wso2-enterprise/syntax-tree';
import { BalleriaLanguageClient } from '@wso2-enterprise/ballerina-languageclient';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: "100%"
    },
    gridContainer: {
      height: "100%"
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }),
);


export interface DataMapperWrapperProps {
    getFileContent: (url: string) => Promise<string>;
    updateFileContent: (filePath: string, content: string) => Promise<boolean>;
    filePath: string;
    langClientPromise: Promise<BalleriaLanguageClient>;
    lastUpdatedAt: string;
}

export function DataMapperWrapper(props: DataMapperWrapperProps) {
    const { langClientPromise, getFileContent, filePath, updateFileContent, lastUpdatedAt } = props;
    const [didOpen, setDidOpen] = React.useState(false);
    const [fileContent, setFileContent] = React.useState("");
    const [lastUpdated, setLastUpdated] = React.useState(lastUpdatedAt);
    const [functionST, setFunctionST] = React.useState<FunctionDefinition>(undefined);

    const classes = useStyles();

    const updateFileContentOverride = (fPath: string, newContent: string) => {
        setFileContent(newContent);
        return Promise.resolve(true);
        // return updateFileContent(fPath, newContent);
    }

    const newProps = {
        ...props,
        lastUpdatedAt: lastUpdated,
        updateFileContent: updateFileContentOverride
    }

    useEffect(() => {
        async function getSyntaxTree() {
            if (didOpen) {
                const langClient = await langClientPromise;
                const { parseSuccess, syntaxTree } = await langClient.getSyntaxTree({
                    documentIdentifier: {
                        uri: `file://${filePath}`
                    }
                });
                if (parseSuccess) {
                    const modPart = syntaxTree as ModulePart;
                    const fns = modPart.members.filter((mem) => STKindChecker.isFunctionDefinition(mem)) as FunctionDefinition[];
                    setFunctionST(fns.find((mem) => mem.functionName.value === "transform"));
                    return;
                }
                
            }
            setFunctionST(undefined);
        }
        getSyntaxTree();
    }, [didOpen, fileContent])

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

    return !didOpen || !functionST ? <>Opening the document...</>
        :
        // tslint:disable-next-line: jsx-wrap-multiline
        <div className={classes.root}>
            <Grid container spacing={3} className={classes.gridContainer} >
                <Grid item xs={8}>
                    <DataMapper
                        fnST={functionST}
                        langClientPromise={langClientPromise}
                        filePath={filePath}
                        updateFileContent={updateFileContentOverride}
                    />
                </Grid>
                <Grid item xs={4}>
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
                </Grid>
            </Grid>
            <code id='file-content-holder' style={{ display: "none" }}>
                {fileContent}
            </code>
    </div>;
}
