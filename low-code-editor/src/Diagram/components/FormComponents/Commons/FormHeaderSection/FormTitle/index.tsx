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
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Box, Typography } from "@material-ui/core";

import { useStyles } from "../../../DynamicConnectorForm/style";
import { StatementEditorButton } from "../../../FormFieldComponents/StatementEditor/components/Button/StatementEditorButton";

interface FormTitleProps {
    statementEditor?: boolean;
    statementEditorBtnOnClick?: () => void;
    formTitle: string;
    defaultMessage: string;
}

export function FormTitle(props: FormTitleProps) {
    const { formTitle, defaultMessage, statementEditor, statementEditorBtnOnClick } = props;
    const formClasses = useStyles();
    const intl = useIntl();

    return (
        <div className={formClasses.formTitleWrapper}>
            <div className={formClasses.mainTitleWrapper}>
                <Typography variant="h4">
                    <Box paddingTop={2} paddingBottom={2}>
                        <FormattedMessage id={formTitle} defaultMessage={defaultMessage} />
                    </Box>
                </Typography>
            </div>
            {statementEditor && <StatementEditorButton onClick={statementEditorBtnOnClick} />}
        </div>
    );
}
