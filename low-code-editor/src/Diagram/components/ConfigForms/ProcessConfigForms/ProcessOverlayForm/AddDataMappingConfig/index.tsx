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
// tslint:disable:jsx-no-multiline-js
// tslint:disable: jsx-wrap-multiline
import React, { useContext, useEffect, useState } from 'react';

import { CaptureBindingPattern, LocalVarDecl, STNode } from '@ballerina/syntax-tree';
import { Box, FormControl, Typography } from '@material-ui/core';
import { CloseRounded } from '@material-ui/icons';

import DataMapperIcon from '../../../../../../../src/assets/icons/DataMapper';
import { LogIcon } from "../../../../../../assets/icons";
import { PrimitiveBalType } from '../../../../../../ConfigurationSpec/types';
import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { getAllVariables } from "../../../../../utils/mixins";
import { ButtonWithIcon } from '../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon';
import { PrimaryButton } from '../../../../Portals/ConfigForm/Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../../../Portals/ConfigForm/Elements/Button/SecondaryButton';
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { DataMapperConfig, DataMapperInputTypeInfo, DataMapperOutputField, DataMapperOutputTypeInfo, ProcessConfig } from '../../../../Portals/ConfigForm/types';
import { checkVariableName, genVariableName } from "../../../../Portals/utils";
import { wizardStyles } from "../../../style";

import { OutputTypeSelector } from './OutputTypeSelector';
import { ParameterSelector } from './ParameterSelector';


interface AddDataMappingConfigProps {
    processConfig: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}

enum DataMapperSteps {
    SELECT_OUTPUT,
    SELECT_INPUT,
}

export function AddDataMappingConfig(props: AddDataMappingConfigProps) {
    const { processConfig, onCancel, onSave } = props;
    const { state, dataMapperStart, toggleDiagramOverlay } = useContext(DiagramContext);
    const { stSymbolInfo } = state;
    // const dataMapperConfig: DataMapperConfig = processConfig.config as DataMapperConfig;
    // const defaultVariableName = stSymbolInfo ?
    //     genVariableName('mappedValue', getAllVariables(stSymbolInfo)) : 'mappedValue';
    // const [dataMapperStep, setDataMapperStep] = useState(DataMapperSteps.SELECT_OUTPUT);
    // const [inputTypes, setParameters] = useState(dataMapperConfig.inputTypes);
    // const [outputType, setReturnType] = useState(dataMapperConfig.outputType);
    // const [variableName, setVariableName] = useState(defaultVariableName);
    // const [sampleStructure, setSampleStructure] = useState<string>('');
    // const [isVariableNameValid, setIsVariableNameValidity] = useState(true);
    // const [isJsonValid, setIsJsonValid] = useState(true);

    // const varData: DataMapperInputTypeInfo[] = [];
    // const typeArray: DataMapperOutputTypeInfo[] = [];

    // stSymbolInfo.recordTypeDescriptions.forEach((node: STNode) => {
    //     const typeData = node.typeData;
    //     const typeSymbol = typeData.typeSymbol;
    //     const moduleID = typeSymbol.moduleID;

    //     if (moduleID) {
    //         typeArray.push({
    //             variableName: '',
    //             type: 'record',
    //             typeInfo: {
    //                 name: typeSymbol.name,
    //                 ...moduleID
    //             }
    //         })
    //     }
    // });

    // stSymbolInfo.variables.forEach((values: STNode[], key: string) => {
    //     values.forEach((varNode: LocalVarDecl) => {
    //         varData.push({
    //             type: key,
    //             name: (varNode.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value,
    //             node: varNode
    //         });
    //     })
    // });

    // const handleNextClick = () => {
    //     if (dataMapperStep === DataMapperSteps.SELECT_OUTPUT) {
    //         setDataMapperStep(DataMapperSteps.SELECT_INPUT);
    //     } else {
    //         let fields: DataMapperOutputField[] = [];
    //         if (outputType.type === 'json' && sampleStructure.length > 0) {
    //             fields = generateFieldStructureForJsonSample(JSON.parse(sampleStructure));
    //         }
    //         processConfig.config = {
    //             inputTypes,
    //             outputType: { ...outputType, sampleStructure, variableName, fields },
    //             wizardType: processConfig.wizardType
    //         };
    //         onSave();
    //         dataMapperStart(processConfig.config);
    //     }
    // }

    useEffect(() => {
        toggleDiagramOverlay();
        dataMapperStart({
            inputTypes: [],
            outputType: undefined,
            wizardType: processConfig.wizardType
        });
    }, []);

    // const addNewParam = (type: DataMapperInputTypeInfo) => {
    //     setParameters([...inputTypes, type])
    // }

    // const removeParam = (index: number) => {
    //     setParameters([...inputTypes.splice(index, 1)])
    // }

    // const handleSampleStructureUpdate = (value: string) => {
    //     setSampleStructure(value);
    // }

    // const handleJsonValidation = (isValid: boolean) => {
    //     setIsJsonValid(isValid);
    // }

    // const updateVariableNameOnChange = (value: string) => {
    //     setVariableName(value);
    // }

    // const formClasses = useFormStyles();
    // const overlayClasses = wizardStyles();

    return (
        <></>
    )
    // <FormControl data-testid="data-mapper-form" className={formClasses.wizardFormControl}>
    //     <div className={overlayClasses.configWizardContainer}>
    //         <ButtonWithIcon
    //             className={formClasses.overlayDeleteBtn}
    //             onClick={onCancel}
    //             icon={<CloseRounded fontSize="small" />}
    //         />
    //         <div className={formClasses.formTitleWrapper}>
    //             <div className={formClasses.mainTitleWrapper}>
    //                 <div className={formClasses.iconWrapper}>
    //                     <DataMapperIcon />
    //                 </div>
    //                 <Typography variant="h4">
    //                     <Box paddingTop={2} paddingBottom={2}>Data Mapping Object</Box>
    //                 </Typography>
    //             </div>
    //         </div>
    //         {
    //             dataMapperStep === DataMapperSteps.SELECT_INPUT &&
    //             <ParameterSelector
    //                 parameters={inputTypes}
    //                 insertParameter={addNewParam}
    //                 removeParameter={removeParam}
    //                 types={varData}
    //             />
    //         }
    //         {dataMapperStep === DataMapperSteps.SELECT_OUTPUT &&
    //             <OutputTypeSelector
    //                 types={typeArray}
    //                 variables={varData}
    //                 updateReturnType={setReturnType}
    //                 updateSampleStructure={handleSampleStructureUpdate}
    //                 updateValidity={handleJsonValidation}
    //                 updateVariableName={updateVariableNameOnChange}
    //                 updateVariableNameValidity={setIsVariableNameValidity}
    //                 diagramState={state}
    //                 variableName={variableName}
    //             />}

    //         <div className={overlayClasses.buttonWrapper}>
    //             <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
    //             <PrimaryButton
    //                 disabled={!isVariableNameValid && isJsonValid}
    //                 dataTestId={"datamapper-save-btn"}
    //                 text={dataMapperStep === DataMapperSteps.SELECT_INPUT ? "Save" : "Next"}
    //                 fullWidth={false}
    //                 onClick={handleNextClick}
    //             />
    //         </div>
    //     </div>
    // </FormControl>
}

export function generateFieldStructureForJsonSample(obj: any): DataMapperOutputField[] {
    const fields: DataMapperOutputField[] = [];

    Object.keys(obj).forEach((key: string) => {
        const currentField: DataMapperOutputField = { name: key, type: '', isChanged: false }
        switch (typeof obj[key]) {
            case 'string':
                currentField.type = PrimitiveBalType.String;
                break;
            case 'boolean':
                currentField.type = PrimitiveBalType.Boolean;
                break;
            case 'number':
                currentField.type = PrimitiveBalType.Float;
                break;
            case 'object':
                if (Array.isArray(obj[key])) {
                    currentField.type = PrimitiveBalType.Collection;
                } else {
                    currentField.type = 'object'; // todo: revisit with a proper field type
                    currentField.fields = generateFieldStructureForJsonSample(obj[key]);
                }
                break;
            default:
            // ignored
        }

        fields.push(currentField);
    })

    return fields;
}
