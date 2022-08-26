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

// tslint:disable: jsx-no-multiline-js
import React, { useContext, useRef, useState } from "react";

import { DeleteButton, EditButton, LabelTryIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

// import { UnsupportedConfirmButtons } from "../../FormComponents/DialogBoxes/UnsupportedConfirmButtons";
import { ComponentExpandButton } from "../Components/ComponentExpandButton";
import { Context } from "../Context/diagram";

import "./style.scss";

export interface HeaderActionsProps {
    model: STNode;
    isExpanded: boolean;
    deleteText: string;
    formType?: string;
    showOnRight?: boolean;
    onExpandClick: () => void;
    onConfirmDelete: () => void;
    onClickTryIt?: () => void;
    onClickRun?: () => void;
    onConfirmEdit?: () => void;
    unsupportedType?: boolean;
    isResource?: boolean;
}

export function HeaderActionsWithMenu(props: HeaderActionsProps) {
    const {
        model,
        isExpanded,
        deleteText,
        showOnRight,
        onExpandClick,
        formType,
        onConfirmDelete,
        onConfirmEdit,
        onClickTryIt,
        onClickRun,
        unsupportedType,
        isResource
    } = props;

    const diagramContext = useContext(Context);
    const { isReadOnly } = diagramContext.props;
    const gotoSource = diagramContext?.api?.code?.gotoSource;
    const renderEditForm = diagramContext?.api?.edit?.renderEditForm;
    const renderDialogBox = diagramContext?.api?.edit?.renderDialogBox;

    const deleteBtnRef = useRef(null);
    const [isDeleteViewVisible, setIsDeleteViewVisible] = useState(false);
    const handleDeleteBtnClick = (e: any) => { 
        e.stopPropagation();
        onConfirmDelete();
    }
    // const handleCancelDeleteBtn = () => setIsDeleteViewVisible(false);

    const [isEditViewVisible, setIsEditViewVisible] = useState(false);
    const [isUnSupported, setIsUnSupported] = useState(false);

    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const catMenu = useRef(null);

    const closeOpenMenus = (e: any)=>{
        if(catMenu.current && isMenuVisible && !catMenu.current.contains(e.target)){
            setIsMenuVisible(false)
        }
    }

    document.addEventListener('mousedown',closeOpenMenus);

    const handleEditBtnClick = (e: any) => {
        e.stopPropagation();
        if (unsupportedType) {
            if (renderDialogBox) {
                renderDialogBox("Unsupported", unsupportedEditConfirm, unSupportedEditCancel);
            }
        } else {
            if (renderEditForm) {
                renderEditForm(model, model?.position, { formType: (formType ? formType : model.kind), isLoading: false }, handleEditBtnCancel, handleEditBtnCancel);
            }
        }
    }

    const handleEditBtnCancel = () => setIsEditViewVisible(false);
    const handleEnumEditBtnConfirm = () => {
        // setIsEditViewVisible(false);
        // onConfirmEdit();
    }

    const unsupportedEditConfirm = () => {
        if (model && gotoSource) {
            const targetposition = model.position;
            setIsUnSupported(false);
            gotoSource({ startLine: targetposition.startLine, startColumn: targetposition.startColumn });
        }
    }

    const unSupportedEditCancel = () => setIsUnSupported(false);

    React.useEffect(() => {
        setIsDeleteViewVisible(false);
    }, [model]);

    const run = (
        <svg id="run-button" width="13px" height="11px">
        <g id="Home" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="VSC-service-design-separrated-" transform="translate(-823.000000, -34.000000)" fill="#40404B" fill-rule="nonzero">
            <g id="Group-6" transform="translate(803.000000, 20.000000)">
                <g id="Group-4" transform="translate(16.000000, 6.000000)">
                    <g id="Icon/docs-Copy-7" transform="translate(4.000000, 8.766190)">
                        <path d="M1,0 C1.18124395,0 1.35908035,0.0492578333 1.51449576,0.142507074 L8.57084512,4.3763167 C9.04442539,4.66046485 9.19799045,5.27472511 8.91384229,5.74830538 C8.82939253,5.88905498 8.71159473,6.00685278 8.57084512,6.09130255 L1.51449576,10.3251122 C1.04091549,10.6092603 0.426655234,10.4556953 0.142507074,9.982115 C0.0492578333,9.8266996 0,9.64886319 0,9.46761924 L0,1 C0,0.44771525 0.44771525,0 1,0 Z M1,1 L1,9.46580962 L8.05634937,5.23380962 L1,1 Z" id="Rectangle" />
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
    )


    const tryIt = ( <svg id="try-button" width="13px" height="11px" >
   <defs>
        <path d="M5.98827402,0.141022054 L10.7926407,4.94538872 C10.8234708,4.97621886 10.8492459,5.01018981 10.869966,5.04627161 C10.9504719,5.13545227 11,5.25377355 11,5.38366274 C11,5.51343457 10.9505613,5.63165938 10.869491,5.72053018 C10.8497141,5.75651775 10.8237511,5.79082634 10.7926407,5.82193676 L5.98827402,10.6263034 C5.80024462,10.8143328 5.49538872,10.8143328 5.30735931,10.6263034 C5.11932991,10.438274 5.11932991,10.1334181 5.30735931,9.94538872 L9.368,5.883 L0.5,5.88366274 C0.223857625,5.88366274 3.38176876e-17,5.65980512 0,5.38366274 C-3.38176876e-17,5.10752037 0.223857625,4.88366274 0.5,4.88366274 L9.37,4.883 L5.30735931,0.821936764 C5.11932991,0.633907359 5.11932991,0.329051459 5.30735931,0.141022054 C5.49538872,-0.0470073513 5.80024462,-0.0470073513 5.98827402,0.141022054 Z" id="path-1" />
    </defs>
    <g id="Home" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="VSC-service-design-separrated-" transform="translate(-901.000000, -34.000000)">
            <g id="Group-6" transform="translate(803.000000, 20.000000)">
                <g id="Group-3" transform="translate(96.000000, 6.000000)">
                    <g id="Icon/docs-Copy-7" transform="translate(2.450000, 8.616337)">
                        <mask id="mask-2" fill="white">
                            <use xlinkHref="#path-1" />
                        </mask>
                        <use id="Combined-Shape" fill="#40404B" fill-rule="nonzero" xlinkHref="#path-1" />
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>)

const showMenuClick = (e: any) => {
    setIsMenuVisible(!isMenuVisible);
    e.stopPropagation();
}

const showMenu = ( <svg id="menu-button" x="0px" y="0px" width="13px" height="15px" 
viewBox="0 0 32.055 32.055" onClick={showMenuClick} >
<g>
	<path d="M3.968,12.061C1.775,12.061,0,13.835,0,16.027c0,2.192,1.773,3.967,3.968,3.967c2.189,0,3.966-1.772,3.966-3.967
		C7.934,13.835,6.157,12.061,3.968,12.061z M16.233,12.061c-2.188,0-3.968,1.773-3.968,3.965c0,2.192,1.778,3.967,3.968,3.967
		s3.97-1.772,3.97-3.967C20.201,13.835,18.423,12.061,16.233,12.061z M28.09,12.061c-2.192,0-3.969,1.774-3.969,3.967
		c0,2.19,1.774,3.965,3.969,3.965c2.188,0,3.965-1.772,3.965-3.965S30.278,12.061,28.09,12.061z"/>
</g>
</svg>)


const delteBtn = (<svg id="delete-button" width="13px" height="15px" >
<defs>
    <path d="M6.5,0 C7.80625206,0 8.91751442,0.834850101 9.32932572,2.00008893 L12.5,2 C12.7761424,2 13,2.22385763 13,2.5 C13,2.77614237 12.7761424,3 12.5,3 L12,3 L12,11 C12,12.6568542 10.6568542,14 9,14 L4,14 C2.34314575,14 1,12.6568542 1,11 L1,2.999 L0.5,3 C0.223857625,3 0,2.77614237 0,2.5 C0,2.22385763 0.223857625,2 0.5,2 L3.67067428,2.00008893 C4.08248558,0.834850101 5.19374794,0 6.5,0 Z M11,3 L2,3 L2,11 C2,12.0543618 2.81587779,12.9181651 3.85073766,12.9945143 L4,13 L9,13 C10.0543618,13 10.9181651,12.1841222 10.9945143,11.1492623 L11,11 L11,3 Z M4.5,5 C4.77614237,5 5,5.22385763 5,5.5 L5,10.5 C5,10.7761424 4.77614237,11 4.5,11 C4.22385763,11 4,10.7761424 4,10.5 L4,5.5 C4,5.22385763 4.22385763,5 4.5,5 Z M8.5,5 C8.77614237,5 9,5.22385763 9,5.5 L9,10.5 C9,10.7761424 8.77614237,11 8.5,11 C8.22385763,11 8,10.7761424 8,10.5 L8,5.5 C8,5.22385763 8.22385763,5 8.5,5 Z M6.5,1 C5.7595136,1 5.11301752,1.40242038 4.76727851,2.00049436 L8.23239368,1.99992752 C7.88657394,1.40216612 7.24025244,1 6.5,1 Z" id="delete-path" />
</defs>
<g id="delete" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g id="delete-service-design-separrated-" transform="translate(-1069.000000, -32.000000)">
        <g id="delete-1" transform="translate(803.000000, 20.000000)">
            <g id="delete-2" transform="translate(265.000000, 6.000000)">
                <g id="delete-7" transform="translate(1.500000, 6.000000)">
                    <mask id="mask-2" fill="white">
                        <use xlinkHref="#delete-path" />
                    </mask>
                    <use id="delete-shape" fill="#FE523C" fill-rule="nonzero" xlinkHref="#delete-path" />
                </g>
            </g>
        </g>
    </g>
</g>
</svg>)

const editBtn = ( <svg id="edit-button" width="13px" height="15px" >
<g id="Home" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g id="VSC-service-design-separrated-" transform="translate(-989.000000, -32.000000)" fill="#40404B" fill-rule="nonzero">
        <g id="Group-6" transform="translate(803.000000, 20.000000)">
            <g id="Group-2" transform="translate(185.000000, 6.000000)">
                <g id="Icon/docs-Copy-7" transform="translate(1.000000, 6.000000)">
                    <path d="M7,2.28261854e-13 C7.27614237,2.28261854e-13 7.5,0.223857625 7.5,0.5 C7.5,0.776142375 7.27614237,1 7,1 C3.6862915,1 1,3.6862915 1,7 C1,10.3137085 3.6862915,13 7,13 C10.3137085,13 13,10.3137085 13,7 C13,6.72385763 13.2238576,6.5 13.5,6.5 C13.7761424,6.5 14,6.72385763 14,7 C14,10.8659932 10.8659932,14 7,14 C3.13400675,14 0,10.8659932 0,7 C0,3.13400675 3.13400675,2.28261854e-13 7,2.28261854e-13 Z M10.7645042,0.556025946 C11.4914446,-0.179341475 12.6768794,-0.186172916 13.4122468,0.540767497 C14.1682678,1.28812479 14.1950055,2.50050757 13.4726677,3.28046834 L9.0375037,8.06943845 L5.62291462,8.90938018 L6.33956953,5.3676207 Z M12.7092266,1.25193739 C12.3666275,0.913264307 11.8143472,0.916446996 11.4819888,1.25254138 L7.24469958,5.85998623 L6.77469958,7.65998623 L8.49469958,7.18198623 L12.7389782,2.6009834 C13.0673016,2.24646868 13.0813391,1.71052476 12.7887559,1.34072489 Z" id="Combined-Shape" />
                </g>
            </g>
        </g>
    </g>
</g>
</svg>)

const handleOnClickRun = (e: any) => {
    e.stopPropagation();
    onClickRun();
}

const handleOnClickTryIt = (e: any) => {
    e.stopPropagation();
    onClickTryIt();
}

const optionMenu = (
    <div ref={catMenu} className={"rectangle-menu"}>
        <>
            <div onClick={handleOnClickRun} className={classNames("menu-option", "line-vertical", "left")}>
                <div className="icon">
                    {run} 
                </div>
                <div className="other">Run</div> 
            </div>
            <div onClick={handleOnClickTryIt} className={classNames("menu-option", "line-vertical", "middle")}>
                <div className="icon">
                    {tryIt} 
                </div>
                <div className="other">Try It</div> 
            </div>
            <div onClick={handleEditBtnClick} className={classNames("menu-option", "line-vertical", "middle")}>
                <div className={classNames("icon", "icon-adjust")}>
                    {editBtn} 
                </div>
                <div className="other">Edit</div> 
            </div>
            <div onClick={handleDeleteBtnClick} className={classNames("menu-option", "right")}>
                <div className={classNames("icon", "icon-adjust")}>
                    {delteBtn} 
                </div>
                <div className="delete">Delete</div> 
            </div>
        </>
    </div>
)

const resourceOptionMenu = (
    <div ref={catMenu} className={"rectangle-menu-resource"}>
        <>
            <div onClick={handleEditBtnClick} className={classNames("menu-option", "line-vertical", "left")}>
                <div className={classNames("icon", "icon-adjust")}>
                    {editBtn} 
                </div>
                <div className="other">Edit</div> 
            </div>
            <div onClick={handleDeleteBtnClick} className={classNames("menu-option", "right")}>
                <div className={classNames("icon", "icon-adjust")}>
                    {delteBtn} 
                </div>
                <div className="delete">Delete</div> 
            </div>
        </>
    </div>
)

    return (
        <>
            {isMenuVisible && (!isResource ? optionMenu : resourceOptionMenu)}
            <div ref={catMenu} className={"header-amendment-options"}>
                {!isReadOnly && (
                    <>
                        <div className={classNames("amendment-option")}>
                            {showMenu}
                        </div>
                    </>
                )}
                <div className={classNames("amendment-option")}>
                    <ComponentExpandButton
                        isExpanded={isExpanded}
                        onClick={onExpandClick}
                        />
                </div>
            </div>
        </>
    );
}
