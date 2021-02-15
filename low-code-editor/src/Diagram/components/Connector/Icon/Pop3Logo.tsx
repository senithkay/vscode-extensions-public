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
import * as React from "react";

export const POP3_LOGO_WIDTH = 48;
export const POP3_LOGO_HEIGHT = 48;

export function Pop3Logo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (POP3_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (POP3_LOGO_HEIGHT / 2)} width={POP3_LOGO_WIDTH} height={POP3_LOGO_HEIGHT} >
            <g id="Pop3Wrapper">
                <path id="Combined_Shape" data-name="Combined Shape" d="M17.115,11a5.572,5.572,0,0,1-4.057-1.579,5.316,5.316,0,0,1-1.6-3.931,5.276,5.276,0,0,1,1.615-3.921A5.6,5.6,0,0,1,17.125,0a5.6,5.6,0,0,1,4.056,1.569,5.272,5.272,0,0,1,1.6,3.921,5.315,5.315,0,0,1-1.6,3.931A5.556,5.556,0,0,1,17.135,11ZM14.969,3.328A3.019,3.019,0,0,0,14.142,5.5a3.019,3.019,0,0,0,.827,2.172,2.861,2.861,0,0,0,2.147.855,2.858,2.858,0,0,0,2.146-.855A3.019,3.019,0,0,0,20.088,5.5a3.019,3.019,0,0,0-.827-2.172,2.858,2.858,0,0,0-2.146-.855A2.861,2.861,0,0,0,14.969,3.328Zm22.059,6.54A4,4,0,0,1,35.7,7.512l2.266-.637a2.379,2.379,0,0,0,.67,1.26,1.7,1.7,0,0,0,1.243.533,1.665,1.665,0,0,0,1.22-.444,1.468,1.468,0,0,0,.022-2.1,1.587,1.587,0,0,0-1.182-.437,2.14,2.14,0,0,0-.972.2l-.421-1.459,1.747-2.178H36.042V0h7.6V1.66L41.441,3.993l-.023.015a3.461,3.461,0,0,1,1.875,1.1A3.044,3.044,0,0,1,44,7.172a3.425,3.425,0,0,1-1.137,2.607,3.98,3.98,0,0,1-2.831,1.067A4.354,4.354,0,0,1,37.028,9.869Zm-9.92.969H24.23V0l5.9.007A4.387,4.387,0,0,1,33.313,1.2a3.7,3.7,0,0,1,1.226,2.7A3.7,3.7,0,0,1,33.3,6.62a4.548,4.548,0,0,1-3.282,1.187H27.109v3.029h0Zm-.016-5.321h2.845l.009-.007a1.749,1.749,0,0,0,1.268-.476,1.494,1.494,0,0,0,.5-1.111,1.526,1.526,0,0,0-.472-1.111,1.609,1.609,0,0,0-1.182-.476H27.092ZM2.878,10.838H0V0L5.895.007A4.387,4.387,0,0,1,9.083,1.2a3.7,3.7,0,0,1,1.225,2.7A3.7,3.7,0,0,1,9.074,6.62,4.547,4.547,0,0,1,5.792,7.808H2.879v3.029h0ZM2.862,5.517H5.707l.008-.007a1.749,1.749,0,0,0,1.268-.476,1.49,1.49,0,0,0,.5-1.111,1.529,1.529,0,0,0-.472-1.111,1.61,1.61,0,0,0-1.183-.476H2.862Z" transform="translate(2 28.5)" fill="#5567d5" />
                <path id="Shape" d="M44,.5H0" transform="translate(2 45)" fill="none" stroke="#ccd1f2" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="3.175" />
                <path id="Combined_Shape-2" data-name="Combined Shape" d="M22.448,19.645a2.484,2.484,0,0,1-1.48-.485L1.021,4.515A2.5,2.5,0,0,1,2.5,0H42.4a2.5,2.5,0,0,1,1.48,4.515L23.927,19.159A2.481,2.481,0,0,1,22.448,19.645ZM4.025,3,22.448,16.524,40.87,3Z" transform="translate(1.552 1)" fill="#ccd1f2" />
            </g>
        </svg>
    )
}
