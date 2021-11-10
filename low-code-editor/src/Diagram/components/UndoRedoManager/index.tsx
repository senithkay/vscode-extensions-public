import { monaco } from "react-monaco-editor";

import { STNode } from "@ballerina/syntax-tree";

/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// export interface UndoRedoProps {
// }

// export class UndoRedoManager {
//     const {
//         props: {
//             currentFile: {
//                 content,
//                 path,
//             },
//             langServerURL
//         },
//         api: {
//             ls: {
//                 getDiagramEditorLangClient
//             }
//         }
//     } = useDiagramContext();

//     const undoStack: Map<string, string[]> = new Map();
//     const redoStack: Map<string, string[]> = new Map();

//     React.useEffect(() => {
//         const keyPress = (e: any) => {
//             const evtobj = e;
//             if (evtobj.keyCode === 90 && (evtobj.ctrlKey || evtobj.metaKey)) {
//                 undo();
//             } else if (evtobj.keyCode === 89 && (evtobj.ctrlKey || evtobj.metaKey)) {
//                 redo();
//             }
//         }
//         document.onkeydown = keyPress;
//         return () => {
//             document.onkeydown = undefined;
//         };
//     }, []);

//     const undo = async () => {
//         if (undoStack.get(path)?.length) {
//             const uri = monaco.Uri.file(path).toString();

//             const redoSourceStack = redoStack.get(path);
//             if (!redoSourceStack) {
//                 redoStack.set(path, [content]);
//             } else {
//                 redoSourceStack.push(content);
//                 if (redoSourceStack.length >= 100) {
//                     redoSourceStack.shift();
//                 }
//                 redoStack.set(path, redoSourceStack);
//             }
//             const lastsource = undoStack.get(path).pop();

//             const langClient = await getDiagramEditorLangClient(langServerURL);
//             langClient.didChange({
//                 contentChanges: [
//                     {
//                         text: lastsource
//                     }
//                 ],
//                 textDocument: {
//                     uri,
//                     version: 1
//                 }
//             });
//             const genSyntaxTree = await getSyntaxTree(path, langClient);
//             const vistedSyntaxTree: STNode = getLowcodeST(genSyntaxTree);
//             setSyntaxTree(vistedSyntaxTree);
//             setFileContent(lastsource);
//             content = lastsource;
//             props.updateFileContent(path, lastsource);
//         }
//     }

//     const redo = async () => {
//         if (redoStack.get(path)?.length) {
//             const uri = monaco.Uri.file(path).toString();

//             const undoSourceStack = undoStack.get(path);
//             undoSourceStack.push(content);
//             if (undoSourceStack.length >= 100) {
//                 undoSourceStack.shift();
//             }
//             undoStack.set(path, undoSourceStack);

//             const lastUndoSource = redoStack.get(path).pop();

//             const langClient = await getDiagramEditorLangClient(langServerURL);
//             langClient.didChange({
//                 contentChanges: [
//                     {
//                         text: lastUndoSource
//                     }
//                 ],
//                 textDocument: {
//                     uri,
//                     version: 1
//                 }
//             });
//             const genSyntaxTree = await getSyntaxTree(path, langClient);
//             const vistedSyntaxTree: STNode = getLowcodeST(genSyntaxTree);
//             setSyntaxTree(vistedSyntaxTree);
//             setFileContent(lastUndoSource);
//             props.updateFileContent(path, lastUndoSource);
//         }
//     }

//     return (
//         <>
//             <div></div>
//         </>
//     );
// }

export class UndoRedoManager {
    path: string;
    content: string;
    undoStack: Map<string, string[]>;
    redoStack: Map<string, string[]>;

    constructor() {
        this.undoStack = new Map();
        this.redoStack = new Map();
    }

    public updateContent(filePath: string, fileContent: string) {
        this.path = filePath;
        this.content = fileContent;
    }

    public undo() {
        if (this.undoStack.get(this.path)?.length) {
            const redoSourceStack = this.redoStack.get(this.path);
            if (!redoSourceStack) {
                this.redoStack.set(this.path, [this.content]);
            } else {
                redoSourceStack.push(this.content);
                if (redoSourceStack.length >= 100) {
                    redoSourceStack.shift();
                }
                this.redoStack.set(this.path, redoSourceStack);
            }
            const lastsource = this.undoStack.get(this.path).pop();
            this.updateContent(this.path, lastsource)
            return lastsource;

            // const langClient = await getDiagramEditorLangClient(langServerURL);
            // langClient.didChange({
            //     contentChanges: [
            //         {
            //             text: lastsource
            //         }
            //     ],
            //     textDocument: {
            //         uri,
            //         version: 1
            //     }
            // });
            // const genSyntaxTree = await getSyntaxTree(this.path, langClient);
            // const vistedSyntaxTree: STNode = getLowcodeST(genSyntaxTree);
            // setSyntaxTree(vistedSyntaxTree);
            // setFileContent(lastsource);
            // content = lastsource;
            // props.updateFileContent(path, lastsource);
        }
    }


    public redo() {
        if (this.redoStack.get(this.path)?.length) {
            const uri = monaco.Uri.file(this.path).toString();

            const undoSourceStack = this.undoStack.get(this.path);
            undoSourceStack.push(this.content);
            if (undoSourceStack.length >= 100) {
                undoSourceStack.shift();
            }
            this.undoStack.set(this.path, undoSourceStack);
            const lastUndoSource = this.redoStack.get(this.path).pop();
            this.updateContent(this.path, lastUndoSource)
            return lastUndoSource;

            // langClient.didChange({
            //     contentChanges: [
            //         {
            //             text: lastUndoSource
            //         }
            //     ],
            //     textDocument: {
            //         uri,
            //         version: 1
            //     }
            // });
            // const genSyntaxTree = await getSyntaxTree(currentFilePath, langClient);
            // const vistedSyntaxTree: STNode = getLowcodeST(genSyntaxTree);
            // setSyntaxTree(vistedSyntaxTree);
            // setFileContent(lastUndoSource);
            // currentFileContent = lastUndoSource;
            // props.updateFileContent(currentFilePath, lastUndoSource);
        }
    }

    public addModification(source: string) {
        const sourcestack = this.undoStack.get(this.path);
        if (!sourcestack) {
            this.undoStack.set(this.path, [this.content]);
        } else {
            sourcestack.push(this.content);
            if (sourcestack.length >= 100) {
                sourcestack.shift();
            }
            this.undoStack.set(this.path, sourcestack);
        }
    }

    public getFilePath() {
        return(this.path);
    }
}
