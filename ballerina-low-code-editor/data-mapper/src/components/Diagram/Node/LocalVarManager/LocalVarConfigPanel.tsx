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
import React from "react";

import styled from "@emotion/styled";
import Divider from "@material-ui/core/Divider/Divider";
import FormControl from "@material-ui/core/FormControl/FormControl";
import {
    FormActionButtons,
    FormHeaderSection,
    Panel,
    useStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

export interface LocalVarConfigPanelProps {
    handleLocalVarConfigPanel: (showPanel: boolean) => void;
}

export function LocalVarConfigPanel(props: LocalVarConfigPanelProps) {
    const { handleLocalVarConfigPanel } = props;
    const formClasses = useFormStyles();

    const onCancel = () => {
        handleLocalVarConfigPanel(false);
    };

    return (
        <Panel onClose={onCancel}>
            <FormControl
                variant="outlined"
                data-testid="data-mapper-form"
                className={formClasses.wizardFormControlExtended}
            >
                <FormHeaderSection
                    onCancel={onCancel}
                    formTitle={"lowcode.develop.configForms.DataMapper.localVarConfigTitle"}
                    defaultMessage={"Data Mapper"}
                />
                <FormBody>
                    <span>+ Add New Variable</span>
                    <FormDivider />
                </FormBody>
                <FormActionButtons
                    isMutationInProgress={false}
                    cancelBtn={true}
                    saveBtnText="Save"
                    cancelBtnText="Cancel"
                    validForm={true}
                    onSave={onCancel}
                    onCancel={onCancel}
                />
            </FormControl>
        </Panel>
    );
}

const FormBody = styled.div`
    width: 100%;
    flex-direction: row;
    padding: 15px 20px;
`;

const FormDivider = styled(Divider)`
    margin: 1.5rem 0;
`;

export const Title = styled.div(() => ({
    fontSize: "13px",
    letterSpacing: "normal",
    textTransform: "capitalize",
    margin: "0 0 8px",
    fontFamily: "Gilmer",
    lineHeight: "1rem",
    paddingBottom: "0.6rem",
    fontWeight: 500,
}));
