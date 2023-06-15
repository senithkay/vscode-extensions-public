/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { ReactElement } from "react";

import { ConfigElementProps } from "../../ConfigElement";
import { SchemaConstants } from "../../model";
import { setConfigValue } from "../../utils";
import MapType, { MapTypeProps } from "../MapType";
import RecordType, { RecordTypeProps } from "../RecordType";

/**
 * A leaf level configurable type representing boolean, integer, float, and string values.
 */
export interface ObjectTypeProps extends ConfigElementProps {
    setObjectConfig?: (id: string, objectValue: any) => void;
}

const ObjectType = (props: ObjectTypeProps): ReactElement => {
    const returnElement: ReactElement[] = [];
    const isRecord: boolean = props.schema[SchemaConstants.PROPERTIES] !== undefined;

    if (isRecord) {
        setConfigValue(props.properties, props.value);
        const recordTypeProps: RecordTypeProps = {
            ...props,
            setConfigRecord: props.setObjectConfig,
        };

        returnElement.push(
            (
                <div key={props.id + "-RECORD"}>
                    <RecordType {...recordTypeProps} />
                </div>
            ),
        );
    } else {
        const mapTypeProps: MapTypeProps = {
            ...props,
            setConfigMap: props.setObjectConfig,
        };

        returnElement.push(
            (
                <div key={props.id + "-MAP"}>
                    <MapType {...mapTypeProps} />
                </div>
            ),
        );
    }

    return <>{returnElement}</>;
};

export default ObjectType;
