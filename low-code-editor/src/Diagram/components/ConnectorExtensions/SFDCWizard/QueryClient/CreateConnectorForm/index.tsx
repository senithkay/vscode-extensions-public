/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, {ReactNode, useContext, useState} from "react";

import { CaptureBindingPattern, LocalVarDecl } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";
import classNames from "classnames";

import { ActionConfig, ConnectorConfig, FormField } from "../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../Contexts/Diagram";
import { Connector } from "../../../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../../../utils/mixins";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { RadioControl } from "../../../../Portals/ConfigForm/Elements/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import "../../../../Portals/ConfigForm/forms/ConnectorInitForm/Wizard/style.scss"
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { FormElementProps } from "../../../../Portals/ConfigForm/types";
import { genVariableName, getConnectorIcon } from "../../../../Portals/utils";
import { tooltipMessages } from "../../../../Portals/utils/constants";

interface CreateConnectorFormProps {
    actions: Map<string, FormField[]>;
    connector: Connector;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave?: () => void;
    isNewConnectorInitWizard?: boolean;
    homePageEnabled: boolean;
}

interface NameState {
    value: string;
    isNameProvided: boolean;
    isValidName: boolean;
}

export const DEFINE_BASE_CLIENT: string = "Define Base Url";
export const EXISTING_BASE_CLIENT: string = "Existing Base Client";

export function CreateConnectorForm(props: CreateConnectorFormProps) {
    const { state: { stSymbolInfo } } = useContext(DiagramContext);

    const { onBackClick, onSave, actions, connectorConfig, connector, isNewConnectorInitWizard,
            homePageEnabled } = props;
    const connectorInitFormFields: FormField[] = connectorConfig && connectorConfig.connectorInit && connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit : actions.get("init") ?
        actions.get("init") : actions.get("__init");
    const classes = useStyles();

    const baseClientConnectors = stSymbolInfo.variables.get(connector.module + ":BaseClient");
    const baseClients: string[] = [];
    baseClientConnectors?.forEach((node: any) => {
        const varDef: LocalVarDecl = node as LocalVarDecl;
        const bindingPattern: CaptureBindingPattern = varDef.typedBindingPattern.bindingPattern as CaptureBindingPattern;
        baseClients.push(bindingPattern.variableName.value);
    });

    const [defineConnector, setDefineConnector] = useState(!(baseClients.length > 0));

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const initialNameState: NameState = {
        value: '',
        isValidName: true,
        isNameProvided: true
    };
    // Action for the connector
    let action: ActionConfig = new ActionConfig();
    if (connectorConfig.action) {
        action = connectorConfig.action;
    }

    const initActionNameSelect: string = action.name && action.name !== "get" && action.name !== "post" && action.name !== "put" ? action.name : "";
    const [nameState, setNameState] = useState<NameState>(initialNameState);
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(false);
    const [isBaseClientSelected, setIsBaseClientSelected] = useState(false);
    const [actionNameSelect, setActionNameSelect] = useState(initActionNameSelect);
    const [connectorNameError, setConnectorNameError] = useState('');

    // generate variable name and set to default text
    const defaultText: string = (connectorConfig.name === "" || connectorConfig.name === undefined) ?
        genVariableName(connector.name, getAllVariables(stSymbolInfo)) : connectorConfig.name;

    const lowerCasedAllVariables = getAllVariables(stSymbolInfo).map(name => name.toLowerCase());

    if ((connectorConfig.name === "" || connectorConfig.name === undefined) && nameState.isValidName) {
        connectorConfig.name = defaultText;
        setNameState({
            value: defaultText,
            isNameProvided: defaultText !== '',
            isValidName: nameRegex.test(defaultText)
        });
    }

    // Set init function of the connector.
    connectorConfig.connectorInit = connectorInitFormFields;

    const validateNameValue = (value: string) => {
        if (value && !nameRegex.test(value)) {
            setConnectorNameError('Invalid connector name');
            return false;
        }

        if (value !== connectorConfig.name && lowerCasedAllVariables?.includes(value.toLowerCase())){
            // new connection name already exist
            setConnectorNameError('Connector name already exists');
            return false;
        }

        return true;
    };

    const onNameChange = (text: string) => {
        setNameState({
            value : text,
            isNameProvided: text !== '',
            isValidName: validateNameValue(text)
        });
    };

    const onBaseUrlChange = (url: string) => {
        setDefineConnector(true);
        connectorConfig.subExitingConnection = undefined;
        setIsGenFieldsFilled((url !== "") && (url !== undefined));
        setIsBaseClientSelected(false);
    };

    const handleOnOperationChange = (selectedAction: string) => {
        connectorConfig.action = {
            name: selectedAction,
            fields: actions.get(selectedAction)
        };
        setActionNameSelect(selectedAction);
        if ((connectorConfig.isNewConnector !== undefined) && !connectorConfig.isNewConnector) {
            handleOnSave();
        }
    };

    const handleBaseClientChange = (client: string) => {
        setDefineConnector(false);
        connectorConfig.subExitingConnection = client;
        setIsBaseClientSelected(true);
        connectorInitFormFields[0].fields[0].value = "";
    };

    const handleOnSave = () => {
        // update config connector name, when user click next button
        // if connector name available skip setting new value
        if (!connectorConfig.name){
            connectorConfig.name = nameState.value;
        }
        onSave();
    };

    const titlePrefix = isNewConnectorInitWizard ? "New " : "Update ";

    const actionList: string[] = [];
    actions.forEach((value: FormField[], key: string) => {
        if ((key !== "init") && (key !== "__init")) {
            actionList.push(key);
        }
    });

    // TODO: Fix useEffect
    React.useEffect(() => {
        // if model has value or base client is selected make button enabled
        setIsGenFieldsFilled(connectorConfig.subExitingConnection !== undefined);
        setDefineConnector(!((baseClients.length > 0) && ((connectorInitFormFields[0].fields[0].value === "") ||
            (connectorInitFormFields[0].fields[0].value === undefined))));
    }, [connectorInitFormFields[0].fields[0].value]);

    const onExistingRadioBtnChange = (value: string) => {
        connectorConfig.subExitingConnection = undefined;
        connectorInitFormFields[0].fields[0].value = "";
        setDefineConnector(!(value === EXISTING_BASE_CLIENT));
    };

    const onDefineRadioBtnChange = (value: string) => {
        setDefineConnector(!(value === EXISTING_BASE_CLIENT));
        connectorConfig.subExitingConnection = undefined;
        setIsBaseClientSelected(false);
    };

    const defineDefaultVal: string = defineConnector ? DEFINE_BASE_CLIENT : "";
    const existingDefaultVal: string = defineConnector ? "" : EXISTING_BASE_CLIENT;

    const existingActiveClass = defineConnector ? classes.inActiveWrapper : null;
    const customActiveClass = !defineConnector ? classes.inActiveWrapper : null;

    const actionDefaultValue = (connectorConfig.action?.name === undefined) ? "" : connectorConfig.action?.name;

    const isExistingClientSelected: boolean = !((connectorConfig.isNewConnector === undefined) ||
        connectorConfig.isNewConnector);

    const existingBaseClientDefaultVal: string = (connectorConfig.subExitingConnection === undefined) ? "" :
        connectorConfig.subExitingConnection;

    const validateBaseUrl = (field: string, isInvalid: boolean) => {
        setIsGenFieldsFilled(!isInvalid);
    };

    const baseUrlExpElementProps: FormElementProps = {
        model: connectorInitFormFields[0].fields[0],
        onChange: onBaseUrlChange,
        customProps: {
            validate: validateBaseUrl
        }
    };

    const baseUrl: ReactNode = (<ExpressionEditor {...baseUrlExpElementProps} />);

    const formTitle: string = ((connectorConfig.isNewConnector !== undefined) && !connectorConfig.isNewConnector) ?
        "Query Connection" : titlePrefix + " Query Connection";

    return (
        <div>
            <Typography variant="h4" className={classes.titleWrapper}>
                <Box paddingTop={2} paddingBottom={2} className={classes.formTitle}>
                    <div className={classes.formTitleTag} >{formTitle}</div>
                    <div className={classes.formIcon}>{getConnectorIcon(`${connector.module}_${connector.name}`, { scale: 0.95 })}</div>
                </Box>
            </Typography>
            <div className={classes.configPanel}>
                <FormControl
                    classes={{
                        root: classNames(classes.wizardFormControl, classes.marginTop),
                    }}
                >
                    {
                        ((connectorConfig.isNewConnector === undefined) || connectorConfig.isNewConnector) ?
                            (
                                <>
                                    <FormTextInput
                                        customProps={{
                                            validate: validateNameValue,
                                            tooltipTitle: tooltipMessages.connectionName
                                        }}
                                        defaultValue={defaultText}
                                        onChange={onNameChange}
                                        label={"Connection Name"}
                                        errorMessage={connectorNameError}
                                        placeholder={"Enter Connection Name"}
                                    />
                                    <div className="groupedForm">
                                        <RadioControl
                                            onChange={onExistingRadioBtnChange}
                                            defaultValue={existingDefaultVal}
                                            customProps={{
                                                collection: [EXISTING_BASE_CLIENT],
                                                disabled: !(baseClients.length > 0)
                                            }}
                                        />
                                        {
                                            (connectorConfig.name !== undefined) && connectorConfig.name !== '' &&
                                            (
                                                <div className={existingActiveClass}>
                                                    <SelectDropdownWithButton
                                                        customProps={{
                                                            disableCreateNew: true,
                                                            values: baseClients,
                                                            clearSelection: defineConnector
                                                        }}
                                                        label=""
                                                        onChange={handleBaseClientChange}
                                                        placeholder="Select Base Client"
                                                        defaultValue={existingBaseClientDefaultVal}
                                                    />
                                                </div>
                                            )
                                        }

                                        <div className={classes.divider}/>

                                        <RadioControl
                                            onChange={onDefineRadioBtnChange}
                                            defaultValue={defineDefaultVal}
                                            customProps={{collection: [DEFINE_BASE_CLIENT]}}
                                        />
                                        <div className={customActiveClass}>
                                            {baseUrl}
                                        </div>
                                    </div>
                                </>
                            ) : null
                    }

                    <SelectDropdownWithButton
                        customProps={{disableCreateNew: true, values: actionList}}
                        label="Select an Operation"
                        onChange={handleOnOperationChange}
                        placeholder="Select Operation"
                        defaultValue={actionDefaultValue}
                    />
                    <div className={classes.wizardBtnHolder}>
                        <SecondaryButton
                            disabled={!homePageEnabled}
                            text="Back"
                            fullWidth={false}
                            onClick={onBackClick}
                        />
                        <PrimaryButton
                            text="Next"
                            disabled={
                                !(((isGenFieldsFilled && nameState.isNameProvided && nameState.isValidName) ||
                                    isBaseClientSelected || isExistingClientSelected) && ((actionNameSelect &&
                                    actionNameSelect !== "")))
                            }
                            fullWidth={false}
                            onClick={handleOnSave}
                        />
                    </div>
                </FormControl>
            </div>
        </div>
    );
}
