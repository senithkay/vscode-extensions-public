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
import { SelectDropdownWithButton } from "../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { FormActionButtons } from "../../../FormFieldComponents/FormActionButtons";
import { FormGeneratorProps } from "../../../FormGenerator";
import { wizardStyles as useFormStyles } from "../../style";
import "../style.scss";

export function TriggerForm(props: FormGeneratorProps) {
    const { onCancel, onSave, targetPosition, configOverlayFormStatus } = props
    const { formArgs, isLoading } = configOverlayFormStatus;
    const { id, moduleName, displayAnnotation: { label } } = formArgs;
    const formClasses = useFormStyles();
    const intl = useIntl();
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [addNewChannel, setNewChannel] = useState(false);
    const [channelList, setChannelList] = useState<string[]>([]);
    const [unSelectedChannels, setUnSelectedChannels] = useState<string[]>(channelList);
    const [isTriggersLoading, setIsTriggersLoading] = useState(isLoading)
    const [triggerInfo, setTriggerInfo] = useState<BallerinaTriggerResponse>();
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([]);
    const addnewChannelView = () => setNewChannel(true);

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

    const handleOnChannelSelect = (channel: string) => {
        setSelectedChannels([...selectedChannels, channel]);
        const serviceType = triggerInfo.serviceTypes.filter(type => type.name === channel)
        setSelectedServiceTypes([...selectedServiceTypes, ...serviceType])
        setNewChannel(false);
    }
    const createTriggerCode = () => {
        const newTriggerInfo = { ...triggerInfo, serviceTypes: selectedServiceTypes }
        modifyDiagram([
            createImportStatement(
                "ballerina",
                "http",
                targetPosition
            ),
            createImportStatement(
                "ballerinax",
                moduleName,
                targetPosition
            ),
            createTrigger(newTriggerInfo, targetPosition)
        ]);
        onSave();
    }

    const onDeleteChannel = (channelName: string) => {
        setSelectedChannels(selectedChannels.filter((currentChannel) => currentChannel !== channelName));
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

    const dropDownWithButton = (
        isTriggersLoading ? preLoader : (
            <SelectDropdownWithButton
                defaultValue={""}
                onChange={handleOnChannelSelect}
                customProps={{ disableCreateNew: true, values: unSelectedChannels }}
                placeholder=""
                label="Select Channel"
            />
        )
    );

    const addNewChannelButton = (
        <span onClick={addnewChannelView} className={formClasses.addPropertyBtn}    >
            <AddIcon />
            <p><FormattedMessage id="lowcode.develop.triggerConfigForm.trigger.addChannel.title" defaultMessage="Add Channel" /></p>
        </span>
    );

    const formActionButtons = (
        !isTriggersLoading ? (
            <FormActionButtons
                cancelBtnText="Cancel"
                saveBtnText={"Create"}
                isMutationInProgress={selectedChannels?.length === 0}
                validForm={true}
                onSave={createTriggerCode}
                onCancel={onCancel}
            />
        ) : null
    )

    return (
        <>
            <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
                <FormHeaderSection
                    onCancel={onCancel}
                    statementEditor={false}
                    formTitle={"lowcode.develop.triggerConfigForm.trigger.title"}
                    defaultMessage={`${label} Trigger`}
                />
                <div className={formClasses.formWrapper}>
                    <div>
                        <Typography>
                            Service Config
                        </Typography>
                    </div>
                    <div>
                        {selectedChannels?.map((channel, index) => (<SelectedTriggerItem key={index} channelName={channel} />))}
                        {addNewChannel || selectedChannels?.length === 0 ? dropDownWithButton : (unSelectedChannels?.length !== 0 ? addNewChannelButton : (null))}
                    </div>
                    <div>
                        {formActionButtons}
                    </div>
                </div>
            </FormControl>
        </>
    );
}
