/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from "react";

import { FormControl, InputLabel, Select } from "@material-ui/core";
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { FileListEntry } from "../../../../DiagramGenerator/vscode/Diagram";
import useStyles from "../../../../DiagramViewManager/NavigationBar/style";
import { ComponentCollection, ComponentViewInfo, genFilePath } from "../../../util";
import { ComponentView } from "../ComponentView";

import './style.scss'

interface CategoryViewProps {
    projectComponents: BallerinaProjectComponents;
    updateSelection: (info: ComponentViewInfo) => void;
    currentFile: string;
    currentFileName: string;
    fileList: FileListEntry[];
    updateCurrentFile: (filePath: string) => void;
}

const ALL_FILES: string = 'All';

export function CategoryView(props: CategoryViewProps) {
    const { projectComponents, updateSelection, currentFile, fileList, updateCurrentFile, currentFileName } = props;
    const classes = useStyles();
    const currentComponents: ComponentCollection = {
        functions: [],
        services: [],
        records: [],
        objects: [],
        classes: [],
        types: [],
        constants: [],
        enums: [],
        listeners: [],
        moduleVariables: []
    };

    // TODO: Handle the processing of response json in a better way
    if (projectComponents) {
        projectComponents.packages.forEach(packageInfo => {
            packageInfo.modules.forEach(module => {
                Object.keys(module).forEach(key => {
                    if (key !== 'name') {
                        module[key].forEach((element: any) => {
                            const filePath = genFilePath(packageInfo, module, element);
                            if (currentFile && currentFile !== filePath) return;
                            currentComponents[key].push({
                                filePath,
                                position: {
                                    startLine: element.startLine,
                                    startColumn: element.startColumn,
                                    endLine: element.endLine,
                                    endColumn: element.endColumn
                                },
                                fileName: element.filePath,
                                moduleName: module.name ? module.name : '',
                                name: element.name
                            })
                        });
                    }
                })
            });
        });
    }
    // tslint:disable-next-line: jsx-key
    // const views = components.map(comp => <ComponentView info={comp} updateSelection={updateSelection} />)

    // return (
    //     <div>
    //         <h3>{heading}</h3>
    //         <div className="component-container">
    //             {views}
    //         </div>
    //     </div>
    // );

    const renderFileFilterBar = () => {

        const handleFileChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
            if (evt.target.value === ALL_FILES) {
                updateCurrentFile(undefined);
            } else {
                const selectedFile = fileList.find(file => file.fileName === evt.target.value);
                updateCurrentFile(selectedFile.uri.path);
            }
        }

        const fileSelectorOptions: React.ReactElement[] = [];

        fileSelectorOptions.push(
            <option value={ALL_FILES}>{ALL_FILES}</option>
        );
        if (fileList && fileList.length > 0) {
            fileList.forEach(fileEntry => [
                fileSelectorOptions.push(
                    <option value={fileEntry.fileName}>{fileEntry.fileName}</option>
                )
            ])
        }
        console.log('currentFile >>>', currentFile);
        return (
            <div className="title-bar">
                <FormControl variant="outlined" className={classes.selectorComponent} >
                    <InputLabel htmlFor="outlined-age-native-simple">File</InputLabel>
                    <Select
                        native={true}
                        value={currentFileName ? currentFileName : ALL_FILES}
                        label="File"
                        inputProps={{ name: 'age', id: 'outlined-age-native-simple', }}
                        onChange={handleFileChange}
                    >
                        {fileSelectorOptions}
                    </Select>
                </FormControl>
            </div>
        );
    }

    const categories: React.ReactElement[] = [];

    Object.keys(currentComponents).filter(key => currentComponents[key].length).forEach(key => {
        const components = currentComponents[key].map((comp: ComponentViewInfo) => (
            // tslint:disable-next-line: jsx-key
            <ComponentView key={comp.uid} info={comp} updateSelection={updateSelection} type={key} />
        ))
        categories.push(
            <>
                <h3>{key}</h3>
                <div className="component-container">
                    {components}
                </div>
            </>
        )
    })

    return (
        <>
            {renderFileFilterBar()}
            {categories}
        </>
    )
}

