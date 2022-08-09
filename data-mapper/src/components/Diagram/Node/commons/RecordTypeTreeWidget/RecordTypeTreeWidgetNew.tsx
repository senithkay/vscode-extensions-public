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
// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DataMapperPortModel, FormFieldPortModel, STNodePortModel } from '../../../Port';

import { RecordFieldTreeItemWidgetNew } from "./RecordFieldTreeItemWidgetNew";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            maxWidth: 400,
            color: "white",
            position: "relative",
            backgroundColor: " #FFFFFF",
            padding: "20px"
        }
    }),
);

export interface RecordTypeTreeWidgetProps {
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    typeDesc: FormField;
    engine: DiagramEngine;
    getPort: (portId: string) => DataMapperPortModel | STNodePortModel | FormFieldPortModel;
}

export function RecordTypeTreeWidgetNew(props: RecordTypeTreeWidgetProps) {
    const { engine, typeDesc, id, getPort } = props;
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {
                typeDesc.fields.map((field) => {
                    return (
                        <RecordFieldTreeItemWidgetNew
                            key={id}
                            engine={engine}
                            field={field}
                            getPort={getPort}
                            parentId={id}
                        />
                    );
                })
            }
        </div>
    );
}
