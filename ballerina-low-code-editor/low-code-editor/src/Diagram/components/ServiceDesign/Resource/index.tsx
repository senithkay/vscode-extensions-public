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
// tslint:disable: jsx-no-multiline-js, jsx-no-lambda
import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";


import { Divider } from "@material-ui/core";
import { BallerinaRecordResponse } from "@wso2-enterprise/ballerina-languageclient";
import { BallerinaRecordRequest, ConfigOverlayFormStatus, createResource, DiagramEditorLangClientInterface, getSource, STModification, updateResourceSignature } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ConfigPanelSection, SelectDropdownWithButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, RecordTypeDesc, RequiredParam, ResourceAccessorDefinition, STKindChecker, STNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { Context } from "../../../../Contexts/Diagram";
import { removeStatement } from "../../../utils";
import { useStyles } from "../style";

import { ResourceHeader } from "./ResourceHeader";

export interface ResourceBodyProps {
    model: ResourceAccessorDefinition;
    handleDiagramEdit: (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
    isExpandedAll: boolean;
}

export function ResourceBody(props: ResourceBodyProps) {
    const { model, handleDiagramEdit, isExpandedAll } = props;
    const classes = useStyles();
    const intl = useIntl();

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setIsExpanded(isExpandedAll)
    }, [isExpandedAll]);

    const handleIsExpand = () => {
        setIsExpanded(!isExpanded)
    }

    const onEdit = (e?: React.MouseEvent) => {
        e.stopPropagation();
        const lastMemberPosition: NodePosition = {
            endColumn: model.position.endColumn,
            endLine: model.position.endLine - 1,
            startColumn: model.position.startColumn,
            startLine: model.position.startLine - 1
        }
        handleDiagramEdit(model, lastMemberPosition, { formType: "ResourceAccessorDefinition", isLoading: false });
    }

    const handleDeleteBtnClick = (e?: React.MouseEvent) => {
        e.stopPropagation();
        const modifications: STModification[] = [];
        const deleteAction: STModification = removeStatement(
            model.position
        );
        modifications.push(deleteAction);
        modifyDiagram(modifications);
    }

    const {
        props: { currentFile, stSymbolInfo, importStatements, syntaxTree: lowcodeST },
        api: {
            code: { modifyDiagram, updateFileContent },
            ls: { getDiagramEditorLangClient, getExpressionEditorLangClient },
            library,
        },
    } = useContext(Context);


    const bodyArgs: any[] = [];

    model.functionSignature.parameters.forEach((param, i) => {
        if (STKindChecker.isRequiredParam(param) && param.source.includes("Payload")) {
            bodyArgs.push(
                <div key={i} className={classes.signature}>
                    {param.source}
                </div>
            )
        }
    });


    const paramArgs: any[] = [];

    model.functionSignature.parameters.forEach((param, i) => {
        if (STKindChecker.isRequiredParam(param) && !param.source.includes("Payload")) {
            paramArgs.push(
                <div key={i} className={classes.signature}>
                    {param.source}
                </div>
            )
        }
    });

    const responseArgs: any[] = [];

    interface ResponseCode {
        code: number;
        source: string;
    }

    const responseCodes: ResponseCode[] = [
        { code: 200, source: "http:Ok" },
        { code: 201, source: "http:Created" },
        { code: 404, source: "http:NotFound" },
        { code: 500, source: "http:InternalServerError" }
    ];


    function getReturnTypesArray() {
        const returnTypes = model.functionSignature.returnTypeDesc.type.source.split(/\|(?![^\{]*[\}])/gm);
        return returnTypes;
    }

    const getRecord = async (
        recordName: any,
        langClient: DiagramEditorLangClientInterface,
    ): Promise<BallerinaRecordResponse> => {
        const request: BallerinaRecordRequest = {
            module: "Test",
            name: recordName,
            org: "anjanash",
            version: "0.1.0"
        };
        return langClient.getRecord(request);
    };



    getReturnTypesArray().forEach((value, i) => {
        let code = "";
        responseCodes.forEach(item => {
            if (value.includes(item.source)) {
                code = item.code.toString();
            }
        });

        // value = record {|*http:Ok; Foo body;|}
        if (value.includes("body")) {
            const recordName = value.split(";").find(item => item.includes("body")).trim().split("body")[0].trim();
            responseArgs.push(
                <div key={i} className={classes.signature}>
                    <div onClick={() => recordEditor(recordName)}>
                        {code} {value}
                    </div>
                </div>
            )
        } else {
            responseArgs.push(
                <div key={i} className={classes.signature}>
                    {code} {value}
                </div>
            )
        }
    })

    const recordEditor = async (record: any) => {

        const langClient = await getDiagramEditorLangClient();
        const recordInfo = await getRecord(record, langClient);

        // <RecordEditor
        //     name={recordInfo.typeName.value}
        //     targetPosition={recordInfo.position}
        //     onSave={null}
        //     model={recordInfo}
        //     isTypeDefinition={true}
        //     formType={""}
        //     onCancel={null}
        // />

    }

    const args = (
        <>
            <ConfigPanelSection title={"Parameters"}>
                {paramArgs}
            </ConfigPanelSection>
            <Divider className="resource-divider" />
        </>
    );

    const bodyAr = (
        <>
            <ConfigPanelSection title={"Body"}>
                {bodyArgs}
            </ConfigPanelSection>

            <Divider className="resource-divider" />
        </>
    )
    const body = (
        <div className="service-member">
            {paramArgs.length > 0 && args}

            {bodyArgs.length > 0 && bodyAr}

            <ConfigPanelSection title={"Responses"}>
                {responseArgs}
            </ConfigPanelSection>

        </div>
    )

    return (
        <div id={"resource"} className={classNames("function-box", model.functionName.value)}>
            <ResourceHeader isExpanded={isExpanded} onExpandClick={handleIsExpand} model={model} onEdit={onEdit} onDelete={handleDeleteBtnClick} />
            {isExpanded && body}
        </div>
    );
}
