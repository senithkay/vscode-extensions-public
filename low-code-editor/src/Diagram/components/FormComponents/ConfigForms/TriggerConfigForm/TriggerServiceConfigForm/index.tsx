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
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { FormControl, Typography } from "@material-ui/core";
import { BallerinaTriggerRequest, BallerinaTriggerResponse, DiagramEditorLangClientInterface, FormHeaderSection, ServiceType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { AddIcon } from "../../../../../../assets/icons";
import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { TextPreloaderVertical } from "../../../../../../PreLoader/TextPreloaderVertical";
import { createImportStatement, createTrigger } from "../../../../../utils/modification-util";
import { FormAutocomplete } from "../../../FormFieldComponents/Autocomplete";
import { FormActionButtons } from "../../../FormFieldComponents/FormActionButtons";
import { FormGeneratorProps } from "../../../FormGenerator";
import { wizardStyles as useFormStyles } from "../../style";
import "../style.scss";

export function TriggerForm(props: FormGeneratorProps) {
    const { onCancel, onSave, targetPosition, configOverlayFormStatus } = props
    const { formArgs, isLoading } = configOverlayFormStatus;
    const { id, moduleName, displayAnnotation: { label } } = formArgs;
    const formClasses = useFormStyles();
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [addNewChannel, setNewChannel] = useState(false);
    const [channelList, setChannelList] = useState<string[]>([]);
    const [unSelectedChannels, setUnSelectedChannels] = useState<string[]>(channelList);
    const [isTriggersLoading, setIsTriggersLoading] = useState(isLoading)
    const [triggerInfo, setTriggerInfo] = useState<BallerinaTriggerResponse>();
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([]);
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const addnewChannelView = () => setNewChannel(true);
    const intl = useIntl();
    useEffect(() => {
        handleFetchTrigger(id);
    }, []);

    useEffect(() => {
        if (channelList.length !== 0) {
            setUnSelectedChannels(channelList.filter((elements) => !selectedChannels.includes(elements)));
        }
    }, [selectedChannels]);

    const {
        api: {
            ls: { getDiagramEditorLangClient },
            code: { modifyDiagram }
        }
    } = useDiagramContext()

    const handleFetchTrigger = async (triggerId: string) => {
        const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient();
        const request: BallerinaTriggerRequest = {
            id: triggerId,
        };
        const triggerData = await langClient.getTrigger(request);
        setTriggerInfo(triggerData);
        if (triggerData.serviceTypes) {
            setChannelList(triggerData.serviceTypes.map(channel => channel.name));
            setUnSelectedChannels(triggerData.serviceTypes.map(channel => channel.name));
            setIsTriggersLoading(false);
        }
    }

    const handleOnChannelSelect = (event: object, value: string, reason: string) => {
        setSelectedChannels([...selectedChannels, value]);
        const serviceType = triggerInfo.serviceTypes.filter(type => type.name === value);
        setSelectedServiceTypes([...selectedServiceTypes, ...serviceType]);
        setNewChannel(false);
        setIsDropDownOpen(false);
    }
    // TODO: The function needs to be removed once the default value is
    // added from the ballerina central trigger api
    // This function will add the defaultValue property to the linstenerParams
    const handleListenerParamTypes = (triggerData: BallerinaTriggerResponse, triggerlabel: string) => {
        const listenerParamFields = triggerData.listenerParams[0].fields;
        const paramField = listenerParamFields.map((params) => {
            if (params.typeName === "string") {
                return { ...params, defaultValue: "\"\"" }
            } else if (params.typeName === "enum") {
                return { ...params, defaultValue: `${triggerlabel}:${params.members[0].typeName}` }
            } else if (params.typeName === "union") {
                return { ...params, defaultValue: params.members[0].typeName }
            }
        })
        triggerData.listenerParams[0] = { ...triggerData.listenerParams[0], fields: paramField }
        return triggerData.listenerParams;
    }
    const createTriggerCode = () => {
        let httpBased: boolean = true;
        const triggerStr = triggerInfo.moduleName.split(".");
        const triggerType = triggerStr[triggerStr.length - 1];
        if (triggerType === 'sfdc' || triggerType === 'asb') {
            httpBased = false;
        }
        const newListenerParams = handleListenerParamTypes(triggerInfo, triggerType)
        const newTriggerInfo = {
            ...triggerInfo,
            serviceTypes: selectedServiceTypes,
            triggerType, httpBased,
            listenerParams: newListenerParams
        };
        const httpStModification = [
            createImportStatement("ballerina", "http", targetPosition),
            createImportStatement("ballerinax", moduleName, targetPosition),
            createTrigger(newTriggerInfo, targetPosition)
        ];

        const nonHttpStModification = [
            createImportStatement("ballerinax", moduleName, targetPosition),
            createTrigger(newTriggerInfo, targetPosition)
        ];
        modifyDiagram(httpBased ? httpStModification : nonHttpStModification);
        onSave();
    }

    const onDeleteChannel = (channelName: string) => {
        setSelectedChannels(selectedChannels.filter((currentChannel) => currentChannel !== channelName));
    }

    const handleDropDownOpen = () => {
        setIsDropDownOpen(!isDropDownOpen)
    }

    const SelectedTriggerItem = (prop: any) => {
        return (
            <div className={formClasses.headerWrapper}>
                <div className={formClasses.headerLabel}>
                    {prop.channelName}
                </div>
                <div>
                    <DeleteButton
                        onClick={onDeleteChannel.bind(this, prop.channelName)}
                    />
                </div>
            </div>
        )
    }

    const preLoader = (
        <div className={formClasses.loaderWrapper}>
            <TextPreloaderVertical position="relative" />
        </div>
    )

    const operationDropdownPlaceholder = intl.formatMessage({
        id: "lowcode.develop.triggerConfigForm.placeholder",
        defaultMessage: "Select Channel"
    });
    const dropDownForm = (
        isTriggersLoading ? preLoader : (
            <div className={formClasses.triggerDropDownList}>
                <FormAutocomplete
                    itemList={unSelectedChannels}
                    onChange={handleOnChannelSelect}
                    placeholder={operationDropdownPlaceholder}
                    handleDropDownOpen={handleDropDownOpen}
                />
            </div>
        )
    )

    const addNewChannelButton = (
        <span onClick={addnewChannelView} className={formClasses.addPropertyBtn}    >
            <AddIcon />
            <p><FormattedMessage id="lowcode.develop.triggerConfigForm.trigger.addChannel.title" defaultMessage="Add Channel" /></p>
        </span>
    );

    const formActionButtons = (
        (!isTriggersLoading && !isDropDownOpen) ? (
            <div className={formClasses.formActionButton}>
                <FormActionButtons
                    cancelBtnText="Cancel"
                    saveBtnText={"Create"}
                    isMutationInProgress={selectedChannels?.length === 0}
                    validForm={true}
                    onSave={createTriggerCode}
                    onCancel={onCancel}
                />
            </div>

        ) : null
    )

    return (
        <>
            <FormControl data-testid="trigger-form" className={formClasses.wizardFormControl}>
                <FormHeaderSection
                    onCancel={onCancel}
                    statementEditor={false}
                    formTitle={"lowcode.develop.triggerConfigForm.trigger.header.title"}
                    defaultMessage={`${label} Trigger`}
                />
                <div className={formClasses.formWrapper}>
                    <div>
                        <Typography>
                            <FormattedMessage id="lowcode.develop.triggerConfigForm.configTitle" defaultMessage=" Service Config" />
                        </Typography>
                    </div>
                    <div>
                        {selectedChannels?.map((channel, index) => (<SelectedTriggerItem key={index} channelName={channel} />))}
                        {addNewChannel || selectedChannels?.length === 0 ? dropDownForm : (unSelectedChannels?.length !== 0 ? addNewChannelButton : (null))}
                    </div>
                    {formActionButtons}
                </div>
            </FormControl>
        </>
    );
}
