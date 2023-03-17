/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-lambda jsx-no-multiline-js
import React, { FC, useMemo, useState } from "react";

import { CircularProgress, createStyles, makeStyles, Theme } from "@material-ui/core";
import { Type } from "@wso2-enterprise/ballerina-languageclient";
import { PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { getDefaultRecordValue } from "../../../utils/dm-utils";
import { getModification } from "../../../utils/modifications";
import { ValueConfigMenu } from "../DataManipulationWidget/ValueConfigButton";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        loader: {
			float: "right",
			marginLeft: "auto",
			marginRight: '3px',
			alignSelf: 'center'
		},
    }),
);

interface Props {
    type: Type;
    value: STNode;
    portName: string;
    context: IDataMapperContext
}

export const OutputUnionTypeChangeMenu: FC<Props> = ({
    type,
    value,
    portName,
    context
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const classes = useStyles();

    const handleChangeUnionType = async (unionTypeMember: Type) => {
        setIsLoading(true);
        try {
            let position: NodePosition = value?.position;
            if (value && STKindChecker.isQueryExpression(value)){
                position = value.selectClause?.expression?.position;
            }
            const defaultValue = getDefaultRecordValue(unionTypeMember);
            const modification = [getModification(defaultValue, position)];
            await context.applyModifications(modification);
        } finally {
            setIsLoading(false);
        }
    };

    const menuItems = useMemo(() => {
        let typeMembers: Type[] = type.typeName === PrimitiveBalType.Array ? type.memberType?.members : type?.members;
        typeMembers = typeMembers?.filter(member => member && !["error", "()"].includes(member.typeName));
        return typeMembers?.map((member) => ({
            title: `Reinitialize as ${member.name || member.typeName}`,
            onClick: () => handleChangeUnionType(member),
        }))
    }, [type])

    return (
        <>
            {isLoading && <CircularProgress size={18} className={classes.loader} />}
            {!isLoading && (
                <ValueConfigMenu
                    menuItems={menuItems}
                    portName={portName}
                />
            )}
        </>
    );
};
