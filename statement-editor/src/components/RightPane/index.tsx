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
// tslint:disable: jsx-no-multiline-js
import React, {useState} from "react";

import classNames from "classnames";

import { ComponentExpandButton } from "../Buttons/ComponentExpandButton";
import { LibrariesList } from "../Libraries/LibrariesList";
import { useStatementEditorStyles } from "../styles";

export function RightPane() {
    const statementEditorClasses = useStatementEditorStyles();
    const [isLangLibExpanded, setIsLangLibExpanded] = useState(false);
    const [isStdLibExpanded, setIsStdLibExpanded] = useState(false);
    const [libraries, setLibraries] = useState([]);

    const langLibExpandButton = async () => {
        const response = await fetch('https://api.staging-central.ballerina.io/2.0/docs/stdlib/slbeta5');
        const data = await response.json();

        const transformedLibraries = data.langLibs.map((libraryData: any) => {
            return {
                id: libraryData.id,
                summary: libraryData.summary
            };
        });
        setLibraries(transformedLibraries);
        setIsLangLibExpanded(prevState => {
            return !prevState;
        });
        setIsStdLibExpanded(false);
    };

    const standardLibExpandButton = () => {
        setIsStdLibExpanded(prevState => {
            return !prevState;
        });
        setIsLangLibExpanded(false);
    };

    return (
        <div className={statementEditorClasses.rightPane}>
            <div
                className={classNames(
                    statementEditorClasses.rhsComponent,
                    statementEditorClasses.propertiesMenuBar
                )}
            >
                <div className={statementEditorClasses.shortcutTab} style={{borderBottom: '1px solid #40404B', color: '#1D2028'}}>Variables</div>
                <div className={statementEditorClasses.shortcutTab}>Constants</div>
                <div className={statementEditorClasses.shortcutTab}>Functions</div>
                <div className={statementEditorClasses.shortcutTab} style={{width: '10%'}}>
                    <ComponentExpandButton
                        onClick={undefined}
                        isExpanded={false}
                    />
                </div>
            </div>
            <div className={statementEditorClasses.rightPaneBlock} />
            <div className={statementEditorClasses.shortcutsDivider} />
            <div
                className={classNames(
                    statementEditorClasses.rhsComponent,
                    isLangLibExpanded && statementEditorClasses.libraryBrowser
                )}
            >
                <span className={statementEditorClasses.subHeader}>Language Library</span>
                <ComponentExpandButton
                    onClick={langLibExpandButton}
                    isExpanded={isLangLibExpanded}
                />
            </div>
            <div className={statementEditorClasses.shortcutsDivider} />
            <div
                className={classNames(
                    statementEditorClasses.rhsComponent,
                    isStdLibExpanded && statementEditorClasses.libraryBrowser
                )}
            >
                <span className={statementEditorClasses.subHeader}>Standard Library</span>
                <ComponentExpandButton
                    onClick={standardLibExpandButton}
                    isExpanded={isStdLibExpanded}
                />
                <section>
                    <LibrariesList libraries={libraries} />
                </section>
            </div>
            <div className={statementEditorClasses.shortcutsDivider} />
        </div>
    );
}
