import React from "react";

import { STModification } from "../Definitions";
import { TriggerType } from "../Diagram/models";

import { Provider as DiagramProvider } from "./contexts/Diagram";

export default function Provider(props: any) {
  const {
    children,
    onMutate,
    diagramPanLocation,
    createManualConnection,
    triggerErrorNotification,
    triggerSuccessNotification,
    ...restProps
  } = props;

  const initialState = restProps;

  const modifyTrigger = (
    triggerType: TriggerType,
    model?: any,
    configObject?: any
  ) => {
    onMutate("TRIGGER", { triggerType, model, configObject });
  };

  const modifyDiagram = (mutations: STModification[], options: any = {}) => {
    onMutate("DIAGRAM", { mutations, ...options });
  };

  const callbacks = {
    modifyDiagram,
    modifyTrigger,
    diagramPanLocation,
    createManualConnection,
    triggerErrorNotification,
    triggerSuccessNotification
  };

  return (
    <DiagramProvider initialState={initialState} callbacks={callbacks}>
      {children}
    </DiagramProvider>
  );
}
