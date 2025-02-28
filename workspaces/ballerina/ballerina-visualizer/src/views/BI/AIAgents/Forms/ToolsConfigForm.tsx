/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Typography } from "@wso2-enterprise/ui-toolkit";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { ServiceModel, SubPanel, SubPanelView } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { URI, Utils } from "vscode-uri";
import { BodyText } from "../../../styles";
import { FormGeneratorNew } from "../../Forms/FormGeneratorNew";
import { FormHeader } from "../../../../components/FormHeader";

const Container = styled.div`
    /* padding: 0 20px 20px; */
    max-width: 600px;
    height: 100%;
    > div:last-child {
        /* padding: 20px 0; */
        > div:last-child {
            justify-content: flex-start;
        }
    }
`;

const FormContainer = styled.div`
    /* padding-top: 15px; */
    padding-bottom: 15px;
`;


interface ConfigProps {
    formFields: FormField[];
    onSubmit: (data: FormField[]) => void;
    openToolsForm: () => void;
    onBack?: () => void;
    formSubmitText?: string;
    formCancelText?: string;
}

export function ToolsConfigForm(props: ConfigProps) {
    const { rpcClient } = useRpcContext();

    const { formFields, onSubmit, onBack, formCancelText = "Back", formSubmitText = "Next", openToolsForm } = props;
    const [filePath, setFilePath] = useState<string>('');

    useEffect(() => {
        rpcClient.getVisualizerLocation().then(res => { setFilePath(Utils.joinPath(URI.file(res.projectUri), 'agents.bal').fsPath) });
    }, []);

    const handleSubmit = async (data: FormValues) => {
        formFields.forEach(val => {
            val.value = data[val.key];
        })
        onSubmit(formFields);
    };

    const handleOpenToolsForm = (panel: SubPanel) => {
        if (panel.view === SubPanelView.ADD_NEW_FORM) {
            openToolsForm();
        }
    }


    return (
        <Container>
            {formFields &&
                <>
                    {formFields.length > 0 &&
                        <FormContainer>
                            <FormHeader title={`Tool Integration`} subtitle={`Connect services or add custom logic to empower your agent.`} />
                            {filePath &&
                                <FormGeneratorNew
                                    fileName={filePath}
                                    targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                                    fields={formFields}
                                    onBack={onBack}
                                    onSubmit={handleSubmit}
                                    submitText={formSubmitText}
                                    cancelText={formCancelText}
                                    openSubPanel={handleOpenToolsForm}
                                />
                            }
                        </FormContainer>
                    }
                </>
            }
        </Container>
    );
}

export default ToolsConfigForm;
