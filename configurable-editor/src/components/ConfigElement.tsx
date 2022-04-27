/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import React, { ReactElement } from "react";

import { Box, Card, CardContent } from "@material-ui/core";

import { FieldLabel, FieldLabelProps } from "./elements/FieldLabel";
import { ConfigType } from "./model";
import { useStyles } from "./style";
import ArrayType, { ArrayTypeProps } from "./types/ArrayType";
import ObjectType, { ObjectTypeProps } from "./types/ObjectType";
import SimpleType, { SimpleTypeProps } from "./types/SimpleType";
import UnionType, { UnionTypeProps } from "./types/UnionType";

export interface ConfigElementProps {
    id: string;
    name: string;
    isRequired: boolean;
    type?: ConfigType;
    schema?: object;
    properties?: ConfigElementProps[];
    label?: string;
    value?: any;
    description?: string;
    placeholder?: string;
    setConfigElement?: (id: string, value: any) => void;
}

export const ConfigElement = (props: ConfigElementProps): ReactElement => {
    const returnElement: ReactElement[] = [];
    const classes = useStyles();

    // Add the config field input box
    switch (props.type) {
        case ConfigType.OBJECT:
            const objectTypeProps: ObjectTypeProps = {
                ...props,
                setObjectConfig: props.setConfigElement,
            };

            return (
                <div key={props.id}>
                    <ObjectType {...objectTypeProps} />
                </div>
            );
        case ConfigType.ARRAY:
            const arrayTypeProps: ArrayTypeProps = {
                ...props,
                setArrayType: props.setConfigElement,
            };

            return (
                <div key={props.id}>
                    <ArrayType {...arrayTypeProps} />
                </div>
            );
        case ConfigType.ANY_OF:
            const unionTypeProps: UnionTypeProps = {
                ...props,
                setUnionType: props.setConfigElement,
            };

            returnElement.push(
                (
                    <div key={props.id}>
                        <UnionType {...unionTypeProps} />
                    </div>
                ),
            );
            break;
        default:
            const fieldLabelProps: FieldLabelProps = {
                description: props.description,
                label: props.label,
                name: props.name,
                required: props.isRequired,
                type: props.type,
            };

            const simpleTypeProp: SimpleTypeProps = {
                ...props,
                setSimpleConfig: props.setConfigElement,
            };

            returnElement.push(
                (
                    <div key={props.id + "ELEMENT"}>
                        <FieldLabel {...fieldLabelProps} />
                        <SimpleType {...simpleTypeProp} />
                    </div>
                ),
            );
            break;
    }

    if (returnElement.length > 0) {
        return (
            <Box className={classes.innerBoxCard} key={props.id}>
                <Card variant="outlined">
                    <CardContent className={classes.cardContent}>
                        {returnElement}
                    </CardContent>
                </Card>
            </Box>
        );
    }
};

export default ConfigElement;
