"use strict";(self.webpackChunk_wso2_enterprise_mi_diagram=self.webpackChunk_wso2_enterprise_mi_diagram||[]).push([[235],{"./src/index.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>index_stories});var icons_namespaceObject={};__webpack_require__.r(icons_namespaceObject),__webpack_require__.d(icons_namespaceObject,{ArchitectureViewIcon:()=>ArchitectureViewIcon,BitBucketIcon:()=>BitBucketIcon,CellViewIcon:()=>CellViewIcon,ChoreoIcon:()=>ChoreoIcon,GithubIcon:()=>GithubIcon});var react=__webpack_require__("../../../common/temp/node_modules/.pnpm/react@17.0.2/node_modules/react/index.js"),dist=__webpack_require__("../../../common/temp/node_modules/.pnpm/@projectstorm+react-diagrams@7.0.2_mhyhhzsw64oitotbri7og2fdsu/node_modules/@projectstorm/react-diagrams/dist/index.js"),emotion_styled_browser_esm=__webpack_require__("../../../common/temp/node_modules/.pnpm/@emotion+styled@11.11.0_kcy66xtke3z2bfqltnbzzpvana/node_modules/@emotion/styled/dist/emotion-styled.browser.esm.js");const background=__webpack_require__("./src/resources/assets/PatternBg.svg"),Container=emotion_styled_browser_esm.Z.div`
  // should take up full height minus the height of the header
  height: calc(100vh - ${110}px);
  background-image: url('${background}');
  background-repeat: repeat;
  display: flex;
  font-family: 'GilmerRegular';

  > * {
    height: 100%;
    min-height: 100%;
    width: 100%;
  }
  svg:not(:root) {
    overflow: visible;
  }
`,CanvasContainer=props=>react.createElement(Container,{className:"dotted-background"},props.children);CanvasContainer.displayName="CanvasContainer";try{Container.displayName="Container",Container.__docgenInfo={description:"",displayName:"Container",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/Canvas.tsx#Container"]={docgenInfo:Container.__docgenInfo,name:"Container",path:"src/Canvas.tsx#Container"})}catch(__react_docgen_typescript_loader_error){}try{CanvasContainer.displayName="CanvasContainer",CanvasContainer.__docgenInfo={description:"",displayName:"CanvasContainer",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/Canvas.tsx#CanvasContainer"]={docgenInfo:CanvasContainer.__docgenInfo,name:"CanvasContainer",path:"src/Canvas.tsx#CanvasContainer"})}catch(__react_docgen_typescript_loader_error){}var S,CustomCanvasWidget_S,react_canvas_core_dist=__webpack_require__("../../../common/temp/node_modules/.pnpm/@projectstorm+react-canvas-core@7.0.1_@types+react@17.0.65/node_modules/@projectstorm/react-canvas-core/dist/index.js"),emotion_react_browser_esm=__webpack_require__("../../../common/temp/node_modules/.pnpm/@emotion+react@11.11.1_tyycang6qukenpkpyvpj65l3la/node_modules/@emotion/react/dist/emotion-react.browser.esm.js");!function(S){const shared=emotion_react_browser_esm.iv`
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      position: absolute;
      pointer-events: none;
      transform-origin: 0 0;
      width: 100%;
      height: 100%;
      overflow: visible;
    `;S.DivLayer=emotion_styled_browser_esm.Z.div`
      ${shared}
    `,S.SvgLayer=emotion_styled_browser_esm.Z.svg`
      ${shared}
    `}(S||(S={}));class CustomTransformLayerWidget extends react.Component{constructor(props){super(props),this.state={}}getTransform(){const model=this.props.layer.getParent();return`\n\t\t\ttranslate(\n\t\t\t\t${model.getOffsetX()}px,\n\t\t\t\t${model.getOffsetY()}px)\n\t\t\tscale(\n\t\t\t\t${model.getZoomLevel()/100}\n\t\t\t)\n  \t`}getTransformStyle(){return this.props.layer.getOptions().transformed?this.props.isNodeFocused?{transform:this.getTransform(),transition:"transform 0.5s ease-in-out"}:{transform:this.getTransform()}:{}}render(){return this.props.layer.getOptions().isSvg?react.createElement(S.SvgLayer,{style:this.getTransformStyle()},this.props.children):react.createElement(S.DivLayer,{style:this.getTransformStyle()},this.props.children)}}CustomTransformLayerWidget.displayName="CustomTransformLayerWidget",CustomTransformLayerWidget.__docgenInfo={description:"",methods:[{name:"getTransform",docblock:null,modifiers:[],params:[],returns:null},{name:"getTransformStyle",docblock:null,modifiers:[],params:[],returns:null}],displayName:"CustomTransformLayerWidget"},function(S){S.Canvas=emotion_styled_browser_esm.Z.div`
      position: relative;
      cursor: move;
      overflow: hidden;
    `}(CustomCanvasWidget_S||(CustomCanvasWidget_S={}));class CustomCanvasWidget extends react.Component{constructor(props){super(props),this.ref=react.createRef(),this.state={action:null,diagramEngineListener:null}}componentWillUnmount(){this.props.engine.deregisterListener(this.canvasListener),this.props.engine.setCanvas(null),document.removeEventListener("keyup",this.keyUp),document.removeEventListener("keydown",this.keyDown)}registerCanvas(){this.props.engine.setCanvas(this.ref.current),this.props.engine.iterateListeners((list=>{list.rendered&&list.rendered()}))}componentDidUpdate(){this.registerCanvas()}componentDidMount(){this.canvasListener=this.props.engine.registerListener({repaintCanvas:()=>{this.forceUpdate()}}),this.keyDown=event=>{this.props.engine.getActionEventBus().fireAction({event})},this.keyUp=event=>{this.props.engine.getActionEventBus().fireAction({event})},document.addEventListener("keyup",this.keyUp),document.addEventListener("keydown",this.keyDown),this.registerCanvas()}render(){const model=this.props.engine.getModel();return react.createElement(CustomCanvasWidget_S.Canvas,{className:this.props.className,ref:this.ref,onWheel:event=>{this.props.engine.getActionEventBus().fireAction({event})},onMouseDown:event=>{this.props.engine.getActionEventBus().fireAction({event})},onMouseUp:event=>{this.props.engine.getActionEventBus().fireAction({event})},onMouseMove:event=>{this.props.engine.getActionEventBus().fireAction({event})},onTouchStart:event=>{this.props.engine.getActionEventBus().fireAction({event})},onTouchEnd:event=>{this.props.engine.getActionEventBus().fireAction({event})},onTouchMove:event=>{this.props.engine.getActionEventBus().fireAction({event})}},model.getLayers().map((layer=>react.createElement(CustomTransformLayerWidget,{layer,key:layer.getID(),isNodeFocused:this.props.isNodeFocused},react.createElement(react_canvas_core_dist.Px,{layer,engine:this.props.engine,key:layer.getID()})))))}}function NavigationWrapperCanvasWidget(props){const{diagramEngine,focusedNode,className}=props;return(0,react.useEffect)((()=>{focusedNode&&setTimeout((()=>{!function focusToNode(node,currentZoomLevel,diagramEngine){const canvasBounds=diagramEngine.getCanvas().getBoundingClientRect(),nodeBounds=node.getBoundingBox(),zoomOffset=currentZoomLevel/100,offsetX=canvasBounds.width/2-(nodeBounds.getTopLeft().x+nodeBounds.getWidth()/2)*zoomOffset,offsetY=canvasBounds.height/2-(nodeBounds.getTopLeft().y+nodeBounds.getHeight()/2)*zoomOffset;diagramEngine.getModel().setOffset(offsetX,offsetY),diagramEngine.repaintCanvas()}(focusedNode,diagramEngine.getModel().getZoomLevel(),diagramEngine)}),300)}),[diagramEngine,focusedNode]),react.createElement(CustomCanvasWidget,{engine:diagramEngine,isNodeFocused:!!focusedNode,className})}CustomCanvasWidget.displayName="CustomCanvasWidget",CustomCanvasWidget.__docgenInfo={description:"",methods:[{name:"registerCanvas",docblock:null,modifiers:[],params:[],returns:null}],displayName:"CustomCanvasWidget"},NavigationWrapperCanvasWidget.__docgenInfo={description:"",methods:[],displayName:"NavigationWrapperCanvasWidget"};var emotion_css_esm=__webpack_require__("../../../common/temp/node_modules/.pnpm/@emotion+css@11.11.2/node_modules/@emotion/css/dist/emotion-css.esm.js"),combobox=__webpack_require__("../../../common/temp/node_modules/.pnpm/@headlessui+react@1.7.17_sfoxds7t5ydpegc3knd667wn6m/node_modules/@headlessui/react/dist/components/combobox/combobox.js"),transition=__webpack_require__("../../../common/temp/node_modules/.pnpm/@headlessui+react@1.7.17_sfoxds7t5ydpegc3knd667wn6m/node_modules/@headlessui/react/dist/components/transitions/transition.js");const DropdownContainer=emotion_styled_browser_esm.Z.div`
    position: absolute;
    max-height: 100px;
    width: ${props=>`calc(var(--input-min-width) + ${props.widthOffset}px)`};
    overflow: auto;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    outline: none;
    border: 1px solid var(--vscode-list-dropBackground);
    padding-top: 5px;
    padding-bottom: 5px;
    ul {
        margin: 0;
        padding: 0;
    }
`,ComboboxOption=emotion_styled_browser_esm.Z.div`
    position: relative;
    cursor: default;
    user-select: none;
    color: var(--vscode-editor-foreground);
    background-color: ${props=>props.active?"var(--vscode-editor-selectionBackground)":"var(--vscode-editor-background)"};
    list-style: none;
`,OptionContainer=(0,emotion_css_esm.cx)(emotion_css_esm.iv`
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-selectionBackground);
    padding: 3px 5px 3px 5px;
    list-style-type: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
`),ActiveOptionContainer=(0,emotion_css_esm.cx)(emotion_css_esm.iv`
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-background);
    list-style-type: none;
    padding: 3px 5px 3px 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
`),NothingFound=emotion_styled_browser_esm.Z.div`
    position: relative;
    cursor: default;
    user-select: none;
    padding-left: 8px;
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-background);
`;function Dropdown(props){const{query,filteredResults,notItemsFoundMessage,widthOffset=108,onQueryChange}=props,ComboboxOptionContainer=({active})=>active?OptionContainer:ActiveOptionContainer;return react.createElement(transition.u,{as:react.Fragment,afterLeave:()=>{onQueryChange("")}},react.createElement(DropdownContainer,{widthOffset},react.createElement(combobox.h.Options,null,0===filteredResults.length&&""!==query?react.createElement(NothingFound,null,notItemsFoundMessage||"No options"):filteredResults.map(((item,i)=>react.createElement(ComboboxOption,{key:i},react.createElement(combobox.h.Option,{className:ComboboxOptionContainer,value:item,key:item},item)))))))}Dropdown.__docgenInfo={description:"",methods:[],displayName:"Dropdown"};(0,emotion_css_esm.cx)(emotion_css_esm.iv`
    position: absolute;
    padding-right: 5px;
    background-color: var(--vscode-input-background);
    border-right: 1px solid var(--vscode-focusBorder);
    border-bottom: 1px solid var(--vscode-focusBorder);
    border-top: 1px solid var(--vscode-focusBorder);
    border-left: 0 solid var(--vscode-focusBorder);
`),(0,emotion_css_esm.cx)(emotion_css_esm.iv`
    position: absolute;
    padding-right: 5px;
    background-color: var(--vscode-input-background);
    border-right: 1px solid var(--vscode-dropdown-border);
    border-bottom: 1px solid var(--vscode-dropdown-border);
    border-top: 1px solid var(--vscode-dropdown-border);
    border-left: 0 solid var(--vscode-dropdown-border);
`),(0,emotion_css_esm.cx)(emotion_css_esm.iv`
    color: var(--vscode-symbolIcon-colorForeground);
    padding-top: 5px;
    height: 20px;
    width: 10px;
    padding-right: 8px;
`),(0,emotion_css_esm.cx)(emotion_css_esm.iv`
    color: var(--vscode-input-foreground);
    background-color: var(--vscode-input-background);
    height: 25px;
    width: 170px;
    padding-left: 8px;
    border-left: 1px solid var(--vscode-dropdown-border);
    border-bottom: 1px solid var(--vscode-dropdown-border);
    border-top: 1px solid var(--vscode-dropdown-border);
    border-right: 0 solid var(--vscode-dropdown-border);
    &:focus {
      outline: none;
      border-left: 1px solid var(--vscode-focusBorder);
      border-bottom: 1px solid var(--vscode-focusBorder);
      border-top: 1px solid var(--vscode-focusBorder);
      border-right: 0 solid var(--vscode-focusBorder);
    }
`),emotion_styled_browser_esm.Z.div`
	* {
		box-sizing: border-box;
	}
	position: absolute;
	left: 0;
	top: 0;
	z-index: 5;
	height: 2px;
	width: 100%;
	overflow: hidden;

	.progress-bar {
		background-color: var(--vscode-progressBar-background);
		display: none;
		position: absolute;
		left: 0;
		width: 2%;
		height: 2px;
	}

	&.active .progress-bar {
		display: inherit;
	}

	&.discrete .progress-bar {
		left: 0;
		transition: width 0.1s linear;
	}

	&.discrete.done .progress-bar {
		width: 100%;
	}

	&.infinite .progress-bar {
		animation-name: progress;
		animation-duration: 4s;
		animation-iteration-count: infinite;
		animation-timing-function: steps(100);
		transform: translateZ(0);
	}

	@keyframes progress {
		0% {
			transform: translateX(0) scaleX(1);
		}

		50% {
			transform: translateX(2500%) scaleX(3);
		}

		to {
			transform: translateX(4900%) scaleX(1);
		}
	}

`;const colors_textLinkForeground="var(--vscode-textLink-foreground)",colors_editorForeground="var(--vscode-editor-foreground)",colors_indentGuideActiveBackgound="var(--vscode-editorIndentGuide-activeBackground)",RightSign=emotion_styled_browser_esm.Z.div`
    position: relative;
    top: 15%;
    left: 35%;
    width: 5px;
    height: 12px;
    border: 2px solid white;
    border-bottom: none;
    border-right: none;
    transform: rotate(225deg);
`,CompletedStepCard=props=>react.createElement(StepCard,null,"right"===props.titleAlignment?react.createElement(react.Fragment,null,react.createElement(StepCircle,{color:colors_textLinkForeground},react.createElement(RightSign,null)),react.createElement(StepTitle,{color:colors_editorForeground},props.step.title),props.totalSteps===props.step.id+1?null:react.createElement(HorizontalBar,null)):react.createElement(react.Fragment,null,react.createElement(IconTitleWrapper,null,react.createElement(StepCircle,{color:colors_textLinkForeground},react.createElement(RightSign,null)),props.totalSteps===props.step.id+1?null:react.createElement(BottomTitleHorizontalBar,null),react.createElement(BottomTitleWrapper,{color:colors_editorForeground},props.step.title))));CompletedStepCard.__docgenInfo={description:"",methods:[],displayName:"CompletedStepCard"};const StepNumber=emotion_styled_browser_esm.Z.div`
    display: flex;
    justify-content: center;
    margin-top: 4px;
    margin-left: 8px;
    color: var(--vscode-editor-background);
`,InCompletedStepCard=props=>react.createElement(StepCard,null,"right"===props.titleAlignment?react.createElement(react.Fragment,null,react.createElement(StepCircle,{color:colors_indentGuideActiveBackgound},react.createElement(StepNumber,null,props.step.id+1)),react.createElement(StepTitle,{color:colors_indentGuideActiveBackgound},props.step.title),props.totalSteps===props.step.id+1?null:react.createElement(HorizontalBar,null)):react.createElement(react.Fragment,null,react.createElement(IconTitleWrapper,null,react.createElement(StepCircle,{color:colors_indentGuideActiveBackgound},react.createElement(StepNumber,null,props.step.id+1)),props.totalSteps===props.step.id+1?null:react.createElement(BottomTitleHorizontalBar,null),react.createElement(BottomTitleWrapper,{color:colors_indentGuideActiveBackgound},props.step.title))));InCompletedStepCard.__docgenInfo={description:"",methods:[],displayName:"InCompletedStepCard"};emotion_styled_browser_esm.Z.div`
    display: flex;
    flex-direction: row;
    flex-grow: initial;
    justify-content: ${props=>props.allignment};
`;const StepCard=emotion_styled_browser_esm.Z.div`
    display: flex;
    flex-direction: row;
`,StepTitle=emotion_styled_browser_esm.Z.div`
    font-size: 14px;
    padding-top: 12px;
    padding-left: 5px;
    color: ${props=>props.color};
    font-weight: 600;
`,BottomTitleWrapper=emotion_styled_browser_esm.Z.div`
    display: flex;
    font-size: 14px;
    font-weight: 600;
    flex-direction: column;
    color: ${props=>props.color};
    align-items: center;
    text-align: center;
    margin-top: 15px;
`,StepCircle=(emotion_styled_browser_esm.Z.div`
    font-size: 14px;
    padding-top: 12px;
    padding-left: 5px;
    padding-right: 5px;
    color: ${props=>props.color};
    font-weight: 600;
`,emotion_styled_browser_esm.Z.div`
    color: ${props=>props.color};
    padding-top: 5px;
    font-size: 9px;
`,emotion_styled_browser_esm.Z.div`
    display: flex;
    align-self: center;
    background-color: ${props=>props.color};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    position: relative;
    left: 12px;
    top: 18px;
    transform: translate(-50%, -50%);
`),HorizontalBar=emotion_styled_browser_esm.Z.div`
    width: 120px;
    background-color: var(--vscode-editorIndentGuide-activeBackground);
    height: 1px;
    position: relative;
    top: 20px;
    margin-left: 5px;
    margin-right: 5px;
`,IconTitleWrapper=emotion_styled_browser_esm.Z.div`
    display: flex;
    width: 150px;
    flex-direction: column;
    justify-content: flex-start;
`,BottomTitleHorizontalBar=emotion_styled_browser_esm.Z.div`
    width: 120px;
    background-color: var(--vscode-editorIndentGuide-activeBackground);
    height: 1px;
    position: relative;
    top: -5px;
    left: 85px;
    margin-left: 5px;
    margin-right: 5px;
`;var webview_ui_toolkit_react=__webpack_require__("../../../common/temp/node_modules/.pnpm/@vscode+webview-ui-toolkit@1.2.2_react@17.0.2/node_modules/@vscode/webview-ui-toolkit/react/index.js");const ErrorBanner_Container=emotion_styled_browser_esm.Z.div`
    align-items: center;
    display: flex;
    flex-direction: row;
    background-color: var(--vscode-toolbar-activeBackground);
    padding: 6px;
`,codiconStyles=emotion_css_esm.iv`
    color: var(--vscode-errorForeground);
    margin-right: 6px;
    vertical-align: middle;
`;(0,emotion_css_esm.cx)(emotion_css_esm.iv`
    color: var(--vscode-errorForeground);
`);function ErrorBanner(props){const{errorMsg}=props;return react.createElement(ErrorBanner_Container,null,react.createElement("i",{className:`codicon codicon-warning ${(0,emotion_css_esm.cx)(codiconStyles)}`}),errorMsg)}ErrorBanner.__docgenInfo={description:"",methods:[],displayName:"ErrorBanner"};const RequiredElement=emotion_styled_browser_esm.Z.span`
    color: var(--vscode-errorForeground);
    font-size: 14px;
`;function RequiredFormInput(){return react.createElement(RequiredElement,null,"*")}RequiredFormInput.__docgenInfo={description:"",methods:[],displayName:"RequiredFormInput"};var __rest=function(s,e){var t={};for(var p in s)Object.prototype.hasOwnProperty.call(s,p)&&e.indexOf(p)<0&&(t[p]=s[p]);if(null!=s&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(p=Object.getOwnPropertySymbols(s);i<p.length;i++)e.indexOf(p[i])<0&&Object.prototype.propertyIsEnumerable.call(s,p[i])&&(t[p[i]]=s[p[i]])}return t};const ArchitectureViewIcon=props=>{const{color="var(--vscode-foreground)"}=props,rest=__rest(props,["color"]);return react.createElement("svg",Object.assign({width:"14",height:"16",viewBox:"0 0 14 16",fill:"none",xmlns:"http://www.w3.org/2000/svg"},rest),react.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M0 0V5H6.5V7.02746C4.25002 7.27619 2.5 9.18372 2.5 11.5C2.5 13.9853 4.51472 16 7 16C9.48528 16 11.5 13.9853 11.5 11.5C11.5 9.18372 9.74998 7.27619 7.5 7.02746V5H14V0H0ZM13 1H1V4H13V1ZM7 15C8.933 15 10.5 13.433 10.5 11.5C10.5 9.567 8.933 8 7 8C5.067 8 3.5 9.567 3.5 11.5C3.5 13.433 5.067 15 7 15Z",fill:color}))};ArchitectureViewIcon.__docgenInfo={description:"",methods:[],displayName:"ArchitectureViewIcon"};var BitBucketIcon_rest=function(s,e){var t={};for(var p in s)Object.prototype.hasOwnProperty.call(s,p)&&e.indexOf(p)<0&&(t[p]=s[p]);if(null!=s&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(p=Object.getOwnPropertySymbols(s);i<p.length;i++)e.indexOf(p[i])<0&&Object.prototype.propertyIsEnumerable.call(s,p[i])&&(t[p[i]]=s[p[i]])}return t};const BitBucketIcon=props=>{const{color="var(--vscode-foreground)"}=props,rest=BitBucketIcon_rest(props,["color"]);return react.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",width:"auto",height:"100%",viewBox:"0 0 50 50",preserveAspectRatio:"xMidYMid",style:{transform:"scale(1.4)"},fill:"none"},rest),react.createElement("path",{fill:"url(#a)",d:"M 42.109375 19.113281 L 30.871094 19.113281 L 28.996094 30.167969 L 21.191406 30.167969 L 12.011719 41.09375 C 12.011719 41.09375 12.449219 41.46875 13.074219 41.46875 L 37.550781 41.46875 C 38.113281 41.46875 38.613281 41.03125 38.738281 40.46875 Z M 42.109375 19.113281 "}),react.createElement("path",{fill:color,d:"M 7.453125 7.8125 C 6.703125 7.8125 6.140625 8.5 6.265625 9.1875 L 11.324219 40.15625 C 11.386719 40.53125 11.574219 40.90625 11.886719 41.15625 C 11.886719 41.15625 12.324219 41.53125 12.949219 41.53125 L 22.441406 30.167969 L 21.128906 30.167969 L 19.066406 19.113281 L 42.109375 19.113281 L 43.734375 9.1875 C 43.859375 8.4375 43.296875 7.8125 42.546875 7.8125 Z M 7.453125 7.8125 "}),react.createElement("defs",null,react.createElement("linearGradient",{id:"a",x1:27.898,x2:16.618,y1:15.387,y2:23.023,gradientUnits:"userSpaceOnUse"},react.createElement("stop",{offset:.072,stopColor:color,stopOpacity:.4}),react.createElement("stop",{offset:1,stopColor:color}))))};BitBucketIcon.__docgenInfo={description:"",methods:[],displayName:"BitBucketIcon"};var CellViewIcon_rest=function(s,e){var t={};for(var p in s)Object.prototype.hasOwnProperty.call(s,p)&&e.indexOf(p)<0&&(t[p]=s[p]);if(null!=s&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(p=Object.getOwnPropertySymbols(s);i<p.length;i++)e.indexOf(p[i])<0&&Object.prototype.propertyIsEnumerable.call(s,p[i])&&(t[p[i]]=s[p[i]])}return t};const CellViewIcon=props=>{const{color="var(--vscode-foreground)"}=props,rest=CellViewIcon_rest(props,["color"]);return react.createElement("svg",Object.assign({width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg"},rest),react.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8ZM6 7C6.55228 7 7 6.55228 7 6C7 5.44772 6.55228 5 6 5C5.44772 5 5 5.44772 5 6C5 6.55228 5.44772 7 6 7Z",fill:color}),react.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M12 10C12 11.1046 11.1046 12 10 12C8.89543 12 8 11.1046 8 10C8 8.89543 8.89543 8 10 8C11.1046 8 12 8.89543 12 10ZM11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10C9 9.44772 9.44772 9 10 9C10.5523 9 11 9.44772 11 10Z",fill:color}),react.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M5.51472 0C4.98429 0 4.47558 0.210714 4.1005 0.585787L0.585787 4.1005C0.210714 4.47558 0 4.98429 0 5.51472V10.4853C0 11.0157 0.210714 11.5244 0.585787 11.8995L4.1005 15.4142C4.47558 15.7893 4.98429 16 5.51472 16H10.4853C11.0157 16 11.5244 15.7893 11.8995 15.4142L15.4142 11.8995C15.7893 11.5244 16 11.0157 16 10.4853V5.51472C16 4.98429 15.7893 4.47558 15.4142 4.1005L11.8995 0.585786C11.5244 0.210714 11.0157 0 10.4853 0H5.51472ZM10.4853 1L5.51472 1C5.2495 1 4.99515 1.10536 4.80761 1.29289L1.29289 4.80761C1.10536 4.99515 1 5.2495 1 5.51472L1 10.4853C1 10.7505 1.10536 11.0049 1.29289 11.1924L4.80761 14.7071C4.99515 14.8946 5.2495 15 5.51472 15H10.4853C10.7505 15 11.0049 14.8946 11.1924 14.7071L14.7071 11.1924C14.8946 11.0049 15 10.7505 15 10.4853V5.51472C15 5.2495 14.8946 4.99515 14.7071 4.80761L11.1924 1.29289C11.0049 1.10536 10.7505 1 10.4853 1Z",fill:color}))};CellViewIcon.__docgenInfo={description:"",methods:[],displayName:"CellViewIcon"};var ChoreoIcon_rest=function(s,e){var t={};for(var p in s)Object.prototype.hasOwnProperty.call(s,p)&&e.indexOf(p)<0&&(t[p]=s[p]);if(null!=s&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(p=Object.getOwnPropertySymbols(s);i<p.length;i++)e.indexOf(p[i])<0&&Object.prototype.propertyIsEnumerable.call(s,p[i])&&(t[p[i]]=s[p[i]])}return t};const ChoreoIcon=props=>{const{color="var(--vscode-foreground)"}=props,rest=ChoreoIcon_rest(props,["color"]);return react.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",xmlSpace:"preserve",x:0,y:0,viewBox:"0 0 96 96"},rest),react.createElement("path",{d:"M4 57.6v1.9m0-4.1v2.1M4 41v.9m0 17.6V74c.4 10.4 8.9 18.5 19.2 18.5h50.9c10.3-.4 18.4-9 18.4-19.3V21.9c-.4-10.4-8.9-18.6-19.2-18.6h-51C12.1 3.7 4 12.3 4 22.6V41m79.6 32.3v.6c-.3 5.5-4.8 9.8-10.3 9.8H22.6c-5.4-.3-9.7-4.9-9.7-10.4V22.1c.3-5.5 4.8-9.8 10.3-9.8h50.2c5.7 0 10.3 4.7 10.3 10.4v50.6z",className:"st0",fill:color}),react.createElement("path",{d:"M56.8 36.7c1.9 1.2 3.4 3 4.1 5.1.9 2 3.2 3 5.3 2.3 2-.5 3.1-2.5 2.7-4.5-1.1-3.6-3.5-6.7-6.6-8.7-3.8-2.6-8.4-4-13-3.8-5.7-.2-11.3 2-15.5 6-4 3.8-6.3 9.2-6.1 14.8-.1 5.6 2.1 11 6.2 14.9 4.2 4 9.8 6.2 15.5 6 4.6.1 9.2-1.2 13-3.9 3.1-2 5.4-5 6.5-8.6.1-2-1.2-3.8-3.1-4.2-1.9-.5-3.9.4-4.8 2.2-.7 2.1-2.2 3.9-4.1 5-2.2 1.4-4.8 2.1-7.5 2.1-3.6.1-7.1-1.3-9.6-4-2.4-2.5-3.8-5.9-3.7-9.5 0-2.8.8-5.5 2.4-7.8 4-6.1 12.3-7.6 18.3-3.4z",className:"st0",fill:color}))};ChoreoIcon.__docgenInfo={description:"",methods:[],displayName:"ChoreoIcon"};var GithubIcon_rest=function(s,e){var t={};for(var p in s)Object.prototype.hasOwnProperty.call(s,p)&&e.indexOf(p)<0&&(t[p]=s[p]);if(null!=s&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(p=Object.getOwnPropertySymbols(s);i<p.length;i++)e.indexOf(p[i])<0&&Object.prototype.propertyIsEnumerable.call(s,p[i])&&(t[p[i]]=s[p[i]])}return t};const GithubIcon=props=>{const{color="var(--vscode-foreground)"}=props,rest=GithubIcon_rest(props,["color"]);return react.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",width:"auto",height:"100%",viewBox:"0 0 50 50",preserveAspectRatio:"xMidYMid"},rest),react.createElement("path",{fill:color,d:"M 24.925781 0 C 11.140625 0 0 11.457031 0 25.632812 C 0 36.964844 7.140625 46.558594 17.042969 49.953125 C 18.28125 50.207031 18.734375 49.398438 18.734375 48.722656 C 18.734375 48.128906 18.695312 46.089844 18.695312 43.96875 C 11.761719 45.496094 10.316406 40.910156 10.316406 40.910156 C 9.203125 37.941406 7.550781 37.175781 7.550781 37.175781 C 5.28125 35.605469 7.71875 35.605469 7.71875 35.605469 C 10.234375 35.777344 11.554688 38.238281 11.554688 38.238281 C 13.78125 42.144531 17.375 41.039062 18.816406 40.359375 C 19.023438 38.707031 19.683594 37.558594 20.386719 36.921875 C 14.855469 36.328125 9.039062 34.121094 9.039062 24.277344 C 9.039062 21.472656 10.027344 19.183594 11.597656 17.402344 C 11.347656 16.765625 10.480469 14.132812 11.84375 10.609375 C 11.84375 10.609375 13.949219 9.929688 18.695312 13.242188 C 20.726562 12.679688 22.820312 12.394531 24.925781 12.390625 C 27.03125 12.390625 29.175781 12.691406 31.15625 13.242188 C 35.902344 9.929688 38.007812 10.609375 38.007812 10.609375 C 39.371094 14.132812 38.503906 16.765625 38.253906 17.402344 C 39.863281 19.183594 40.8125 21.472656 40.8125 24.277344 C 40.8125 34.121094 34.996094 36.285156 29.421875 36.921875 C 30.332031 37.730469 31.117188 39.257812 31.117188 41.675781 C 31.117188 45.113281 31.074219 47.871094 31.074219 48.722656 C 31.074219 49.398438 31.527344 50.207031 32.765625 49.953125 C 42.671875 46.554688 49.808594 36.964844 49.808594 25.632812 C 49.851562 11.457031 38.667969 0 24.925781 0 Z M 24.925781 0 "}))};GithubIcon.__docgenInfo={description:"",methods:[],displayName:"GithubIcon"};emotion_styled_browser_esm.Z.div`
    height: 16px;
    width: 14px;
    cursor: pointer;
    ${props=>props.sx};
`;__webpack_require__("../../../common/temp/node_modules/.pnpm/classnames@2.3.2/node_modules/classnames/index.js");emotion_styled_browser_esm.Z.div`
    // Flex Props
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    width: 120px;
    padding: 5px;
    // End Sizing Props
    // Border Props
    border-radius: 3px;
    border-style: solid;
    border-width: 1px;
    border-color: var(--vscode-panel-border);
    cursor: pointer;
    &:hover, &.active {
        border-color: var(--vscode-focusBorder);
    };
	&.not-allowed {
    	cursor: not-allowed;
  	};
	${props=>props.sx};
`,(0,emotion_styled_browser_esm.Z)(webview_ui_toolkit_react.No)`
    padding-left: 0px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    opacity: 0.7;
    color: var(--foreground); // Override the default color to match the theme
`,(0,emotion_styled_browser_esm.Z)(webview_ui_toolkit_react.No)`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--foreground); // Override the default color to match the theme
`;const dagreEngine=new dist.z6({graph:{rankdir:"LR",ranksep:175,edgesep:20,nodesep:60,ranker:"longest-path",marginx:40,marginy:40}});function MIDiagram(props){const[diagramEngine,setEngine]=(0,react.useState)(void 0),[model,setDiagramModel]=(0,react.useState)(new dist.Vm);(0,react.useEffect)((()=>{const e=(0,dist.ZP)();var node1=new dist.Fs({name:"Node 1",color:"rgb(0,192,255)"});let port1=node1.addOutPort("Out");var node2=new dist.Fs("Node 2","rgb(192,255,0)");let port2=node2.addInPort("In"),link1=port1.link(port2);link1.getOptions().testName="Test",link1.addLabel("Hello World!"),model.addAll(node1,node2,link1),e.setModel(model),dagreEngine.redistribute(e.getModel()),e.setModel(model),setDiagramModel(model),autoDistribute(),setEngine(e),console.log(`>>>${e.getModel().getNodes()[0].getID()}`)}),[]);const autoDistribute=()=>{setTimeout((()=>{dagreEngine.redistribute(diagramEngine.getModel()),diagramEngine.setModel(model)}),30)};return react.createElement(react.Fragment,null,diagramEngine&&diagramEngine.getModel()&&react.createElement("div",null,react.createElement(CanvasContainer,null,react.createElement(NavigationWrapperCanvasWidget,{diagramEngine,focusedNode:diagramEngine?.getModel()?.getNodes()[0]}))))}try{MIDiagram.displayName="MIDiagram",MIDiagram.__docgenInfo={description:"",displayName:"MIDiagram",props:{data:{defaultValue:null,description:"",name:"data",required:!1,type:{name:"string"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/MIDiagram.tsx#MIDiagram"]={docgenInfo:MIDiagram.__docgenInfo,name:"MIDiagram",path:"src/MIDiagram.tsx#MIDiagram"})}catch(__react_docgen_typescript_loader_error){}const index_stories={component:MIDiagram,title:"Components/MIDiagram"},Default={args:{data:"Hello World"}};Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:'{\n  args: {\n    data: "Hello World"\n  }\n}',...Default.parameters?.docs?.source}}};const __namedExportsOrder=["Default"]},"./src/resources/assets/PatternBg.svg":(module,__unused_webpack_exports,__webpack_require__)=>{module.exports=__webpack_require__.p+"static/media/PatternBg.58761021.svg"}}]);
//# sourceMappingURL=index-stories.4d037901.iframe.bundle.js.map