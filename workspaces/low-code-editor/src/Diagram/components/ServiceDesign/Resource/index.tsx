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
import { monaco } from "react-monaco-editor";

import { Divider } from "@material-ui/core";
import { BallerinaSTModifyResponse, ConfigOverlayFormStatus, DiagramEditorLangClientInterface, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ConfigPanelSection, Tooltip } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, ResourceAccessorDefinition, STKindChecker, STNode, traversNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";
import { TextDocumentPositionParams } from "vscode-languageserver-protocol";

import { Context } from "../../../../Contexts/Diagram";
import { removeStatement } from "../../../utils";
import { visitor as RecordsFinderVisitor } from "../../../visitors/records-finder-visitor";
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

    const [isExpanded, setIsExpanded] = useState(false);
    const [schema, setSchema] = useState({});


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
        props: { currentFile },
        api: {
            code: { modifyDiagram },
            ls: { getDiagramEditorLangClient },
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

    traversNode(model, RecordsFinderVisitor);
    const records = RecordsFinderVisitor.getRecords();

    function getReturnTypesArray() {

        const returnTypes = model.functionSignature.returnTypeDesc.type.source.split(/\|(?![^\{]*[\}])/gm);
        return returnTypes;
    }

    const getRecord = async (
        recordName: any,
        langClient: DiagramEditorLangClientInterface,
    ): Promise<BallerinaSTModifyResponse> => {
        const record: STNode = records.get(recordName);
        const request: TextDocumentPositionParams = {
            textDocument: { uri: monaco.Uri.file(currentFile.path).toString() },
            position: { line: record.position.startLine, character: record.position.startColumn }
        };
        return langClient.getDefinitionPosition(request);
    };



    getReturnTypesArray().forEach((value, i) => {
        let code = "500";
        responseCodes.forEach(item => {
            if (value.includes(item.source)) {
                code = item.code.toString();
            }
        });

        // value = record {|*http:Ok; Foo body;|}
        let recordName = value;
        let des = "";
        if (value.includes("body")) {
            recordName = value.split(";").find(item => item.includes("body")).trim().split("body")[0].trim();
            des = value.split("|*").length > 0 ? value.split("|*")[1].split(";")[0] : "";
            responseArgs.push(
                <tr key={i} className={classes.signature}>
                    <td>
                        {code}
                    </td>
                    <td>
                        {des}
                        <div>
                            Record Schema : <span className={classes.schemaButton} onClick={() => recordEditor(recordName, i)}>{recordName}</span>
                            {schema[i] && <pre className={classes.schema}>{schema[i]}</pre>}
                        </div>
                    </td>
                </tr>
            )
        } else {
            responseArgs.push(
                <tr key={i} className={classes.signature}>
                    <td>
                        {code}
                    </td>
                    <td onClick={() => recordEditor(recordName)}>
                        {value}
                    </td>
                </tr>
            )
        }
    })

    const recordEditor = async (record: any, key?: any) => {

        const langClient = await getDiagramEditorLangClient();
        const recordInfo = await getRecord(record, langClient);

        if (recordInfo.parseSuccess) {
            const ST: TypeDefinition = recordInfo.syntaxTree as TypeDefinition;
            setSchema({ ...schema, [key]: [ST.source] })
            // setRecordSelected(ST);
            // handleDiagramEdit(ST, ST.position, { formType: "RecordEditor", isLoading: false });
        }
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
                <table className={classes.responseTable}>
                    <thead>
                        <td>Code</td>
                        <td>Description</td>
                    </thead>
                    <tbody>
                        {responseArgs}
                    </tbody>
                </table>
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
