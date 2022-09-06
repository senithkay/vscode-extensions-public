import React, { useEffect } from 'react';

import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, ModulePart, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { DataMapper } from '../components/DataMapper/DataMapper';

import { CodeEditor } from './CodeEditor/CodeEditor';
import { IBallerinaLangClient } from '@wso2-enterprise/ballerina-languageclient';

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
    langClientPromise: Promise<IBallerinaLangClient>;
    lastUpdatedAt: string;
}

export function DataMapperWrapper(props: DataMapperWrapperProps) {
    const { langClientPromise, getFileContent, filePath, lastUpdatedAt } = props;
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

    const applyModifications = async (modifications: STModification[]) => {
        const langClient = await langClientPromise;
        const stModifyResp = await langClient.stModify({
            documentIdentifier: {
                uri: `file://${filePath}`
            },
            astModifications: modifications
        });
        await updateFileContentOverride(filePath, stModifyResp.source);
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
            <Grid container={true} spacing={3} className={classes.gridContainer} >
                <Grid item={true} xs={8}>
                    <DataMapper
                        fnST={functionST}
                        langClientPromise={langClientPromise}
                        filePath={filePath}
                        applyModifications={applyModifications}
                        onClose={() => { }}
                        onSave={() => { }}
                    />
                </Grid>
                <Grid item={true} xs={4}>
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
