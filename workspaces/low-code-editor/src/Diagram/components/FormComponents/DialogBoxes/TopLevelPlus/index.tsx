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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useEffect, useState } from "react";

import { Box, List, ListItem, ListItemText } from "@material-ui/core";
import { FileListEntry } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ModulePart, NodePosition } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { TextPreLoader } from "../../../../../PreLoader/TextPreLoader";
import { FormGeneratorProps } from "../../FormGenerator";

import { PlusOptionsSelector } from "./PlusOptionsSelector";

export function TopLevelOptionRenderer(props: FormGeneratorProps) {
    const { onCancel } = props;
    const { kind, targetPosition, isTriggerType, showCategorized } = props.configOverlayFormStatus.formArgs;

    const {
        api: {
            navigation: { updateActiveFile },
        },
        props: { currentFile, fileList, fullST },
    } = useDiagramContext();

    const [showFileList, setShowFileList] = useState(currentFile.path && fullST ? false : true);
    const [position, setPosition] = useState<NodePosition>(targetPosition);

    useEffect(() => {
        if (fullST) {
            setPosition({
                startLine: (fullST as ModulePart).eofToken.position.endLine,
                startColumn: (fullST as ModulePart).eofToken.position.endColumn,
                endLine: (fullST as ModulePart).eofToken.position.endLine,
                endColumn: (fullST as ModulePart).eofToken.position.endColumn,
            });
        }
    }, [fullST]);

    const handleFileSelect = (entry: FileListEntry) => {
        setShowFileList(false);
        updateActiveFile(entry);
    };

    const handleGoBack = () => {
        setShowFileList(true);
    };

    return (
        <>
            {showFileList && (
                <>
                    <FormHeaderSection
                        onCancel={onCancel}
                        formTitle={"lowcode.develop.configForms.plusholder.selectFiles"}
                        defaultMessage={"Select a file to add a component"}
                    />
                    <List component="nav" style={{ width: 315 }}>
                        {fileList.map((file, index) => (
                            <ListItem button={true} key={index} onClick={() => handleFileSelect(file)}>
                                <ListItemText primary={file.fileName} secondary={file.uri.path} />
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
            {!showFileList && fullST && (
                <PlusOptionsSelector
                    kind={kind}
                    onClose={onCancel}
                    goBack={handleGoBack}
                    targetPosition={position}
                    isTriggerType={isTriggerType}
                    isLastMember={true}
                    showCategorized={showCategorized}
                />
            )}
            {!showFileList && !fullST && (
                <Box display="flex" justifyContent="center" alignItems="center" height="80vh" width="315px">
                    <TextPreLoader position="absolute" text="Loading..." />
                </Box>
            )}
        </>
    );
}
