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
// tslint:disable: jsx-no-lambda
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { AddIcon } from "../../../../../../../../../assets/icons";
import {
    convertReturnTypeStringToSegments,
    generateReturnTypeFromReturnCollection
} from "../../util";
import { ReturnTypeItem } from "./ReturnTypeItem";
import { ReturnTypeSegmentEditor } from "./SegmentEditor";


import { useStyles } from './style';
import { ReturnType, ReturnTypeCollection } from "../../types";

interface PathEditorProps {
    returnTypeString?: string;
    defaultValue?: string;
    isCaller?: boolean;
    onChange?: (text: string) => void;
}

export function ReturnTypeEditor(props: PathEditorProps) {
    const { returnTypeString, defaultValue, isCaller, onChange } = props;

    const initReturnType: ReturnTypeCollection = {
        types: convertReturnTypeStringToSegments(returnTypeString)
    }
    const classes = useStyles();

    const [returnTypeCollection, setReturnTypeCollection] = useState<ReturnTypeCollection>(initReturnType);
    const [addingRetunType, setAddingReturnType] = useState<boolean>(false);


    const onDelete = (returnType: ReturnType) => {
        const id = returnType.id;
        if (id > -1) {
            const returnTypeCollectionClone: ReturnTypeCollection = {
                types: returnTypeCollection.types
            };
            returnTypeCollectionClone.types.splice(id, 1);
            setReturnTypeCollection(returnTypeCollectionClone);
            if (onChange) {
                onChange(generateReturnTypeFromReturnCollection(returnTypeCollectionClone.types));
            }
        }
    };

    const returnTypeItems: React.ReactElement[] = [];
    returnTypeCollection.types.forEach((value, index) => {
        if (value.type) {
            returnTypeItems.push(<ReturnTypeItem returnType={value} onDelete={onDelete}/>);
        }
    });

    const onSave = (returnType: ReturnType) => {
        returnTypeCollection.types.push(returnType);
        setReturnTypeCollection(returnTypeCollection);
        setAddingReturnType(!addingRetunType);
        if (onChange) {
            onChange(generateReturnTypeFromReturnCollection(returnTypeCollection.types));
        }
    };

    const onCancel = () => {
        setAddingReturnType(!addingRetunType);
    };

    const addReturnType = () => {
        setAddingReturnType(!addingRetunType);
    }

    return (
        <div>
            <div id="listReturnTypes" >
                {returnTypeItems}
            </div>
            {addingRetunType ? (
                <div>
                    <ReturnTypeSegmentEditor
                        id={returnTypeCollection.types.length}
                        showDefaultError={isCaller}
                        onCancel={onCancel}
                        onSave={onSave}
                    />
                </div>
            ) : (
                <div id="">
                    <button
                        onClick={addReturnType}
                        className={classes.addQueryParamBtn}
                    >
                        <div className={classes.addQueryParamBtnWrap}>
                            <AddIcon/>
                            <p><FormattedMessage id="lowcode.develop.apiConfigWizard.addReturnType.title"
                                                 defaultMessage="Add Return Type"/></p>
                        </div>
                    </button>
                </div>
            )
            }
        </div>
    );
}
