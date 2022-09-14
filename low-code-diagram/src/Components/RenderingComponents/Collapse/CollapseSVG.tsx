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
import React from 'react';

import './style.scss';

export function CollapseSVG(props: { x: number, y: number }) {
    return (
        <svg className='collapse-component' {...props} version="1.1" width="46px" height="26px" viewBox="0 0 46.0 26.0" >
            <defs>
                <clipPath id="i0">
                    <path d="M2130,0 L2130,1221 L0,1221 L0,0 L2130,0 Z" />
                </clipPath>
                <clipPath id="i1">
                    <path d="M38,0 C41.3137085,-6.08718376e-16 44,2.6862915 44,6 L44,18 C44,21.3137085 41.3137085,24 38,24 L6,24 C2.6862915,24 4.05812251e-16,21.3137085 0,18 L0,6 C-4.05812251e-16,2.6862915 2.6862915,6.08718376e-16 6,0 L38,0 Z" />
                </clipPath>
                <clipPath id="i2">
                    <path d="M14,0 C15.1045695,-2.02906125e-16 16,0.8954305 16,2 L16,14 C16,15.1045695 15.1045695,16 14,16 L2,16 C0.8954305,16 1.3527075e-16,15.1045695 0,14 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 L14,0 Z" />
                </clipPath>
                <clipPath id="i3">
                    <path d="M2.5,-7.06101844e-14 L4.85358222,2.35044479 C5.04882844,2.54543074 5.04880263,2.86153966 4.85352456,3.05649382 C4.67994406,3.22978641 4.41051809,3.24902077 4.21566095,3.1142108 L4.14641778,3.05643625 L3,1.911 L3,8.911 L4.14641778,7.76676865 C4.31996998,7.59344781 4.58939281,7.57416957 4.78427196,7.70894782 L4.85352456,7.76671109 C5.02710507,7.94000367 5.04641218,8.20902348 4.91143202,8.40361111 L4.85358222,8.47276012 L2.5,10.8232049 L0.146417785,8.47276012 C-0.0488284405,8.27777417 -0.0488026288,7.96166525 0.146475437,7.76671109 C0.320055939,7.5934185 0.589481912,7.57418413 0.784339045,7.70899411 L0.853582216,7.76676865 L2,8.911 L2,1.911 L0.853582216,3.05643625 C0.680030016,3.2297571 0.410607188,3.24903534 0.215728041,3.11425709 L0.146475437,3.05649382 C-0.0271050659,2.88320123 -0.0464121829,2.61418143 0.08856798,2.4195938 L0.146417784,2.35044479 L2.5,-7.06101844e-14 Z" />
                </clipPath>
                <clipPath id="i4">
                    <path d="M1,0 C1.55228475,0 2,0.44771525 2,1 C2,1.55228475 1.55228475,2 1,2 C0.44771525,2 0,1.55228475 0,1 C0,0.44771525 0.44771525,0 1,0 Z M5,0 C5.55228475,0 6,0.44771525 6,1 C6,1.55228475 5.55228475,2 5,2 C4.44771525,2 4,1.55228475 4,1 C4,0.44771525 4.44771525,0 5,0 Z M9,0 C9.55228475,0 10,0.44771525 10,1 C10,1.55228475 9.55228475,2 9,2 C8.44771525,2 8,1.55228475 8,1 C8,0.44771525 8.44771525,0 9,0 Z" />
                </clipPath>
            </defs>
            <g transform="translate(-868.0 -485.0)">
                <g clip-path="url(#i0)">
                    <g transform="translate(869.0 486.0)">
                        <g clip-path="url(#i1)">
                            <polygon points="0,0 44,0 44,24 0,24 0,0" stroke="none" fill="#F7F7FB" />
                        </g>
                        <path d="M6,0 L38,0 C41.3137085,-6.08718376e-16 44,2.6862915 44,6 L44,18 C44,21.3137085 41.3137085,24 38,24 L6,24 C2.6862915,24 4.05812251e-16,21.3137085 0,18 L0,6 C-4.05812251e-16,2.6862915 2.6862915,6.08718376e-16 6,0 Z" stroke="#5567D5" stroke-width="1" fill="none" stroke-miterlimit="10" stroke-dasharray=" 2.0 3.0" />
                        <g transform="translate(24.0 4.0)">
                            <path d="M14,-1 C14.8284271,-1 15.5784271,-0.664213562 16.1213203,-0.121320344 C16.6642136,0.421572875 17,1.17157288 17,2 L17,14 C17,14.8284271 16.6642136,15.5784271 16.1213203,16.1213203 C15.5784271,16.6642136 14.8284271,17 14,17 L2,17 C1.17157288,17 0.421572875,16.6642136 -0.121320344,16.1213203 C-0.664213562,15.5784271 -1,14.8284271 -1,14 L-1,2 C-1,1.17157288 -0.664213562,0.421572875 -0.121320344,-0.121320344 C0.421572875,-0.664213562 1.17157288,-1 2,-1 Z" stroke="none" fill="rgba(161, 161, 161, 0.325807)" />
                            <path className='expand-button-container' d="M2,0 L14,0 C15.1045695,-2.02906125e-16 16,0.8954305 16,2 L16,14 C16,15.1045695 15.1045695,16 14,16 L2,16 C0.8954305,16 1.3527075e-16,15.1045695 0,14 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 Z" />
                            <g clip-path="url(#i2)">
                                <polygon points="0,0 16,0 16,16 0,16 0,0" stroke="none" fill="#FFFFFF" />
                            </g>
                            <g transform="translate(5.499999999989049 2.5894876744811635)">
                                <g clip-path="url(#i3)">
                                    <polygon points="-3.71369602e-14,-7.06101844e-14 5,-7.06101844e-14 5,10.8232049 -3.71369602e-14,10.8232049 -3.71369602e-14,-7.06101844e-14" stroke="none" fill="#3F3F4A" />
                                </g>
                            </g>
                        </g>
                        <g transform="translate(7.0 11.0)">
                            <g clip-path="url(#i4)">
                                <polygon points="0,0 10,0 10,2 0,2 0,0" stroke="none" fill="#3F3F4A" />
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}
