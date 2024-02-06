
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.Visualizer.ViewActive.updateView:invocation[0]": { type: "done.invoke.Visualizer.ViewActive.updateView:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.Visualizer.ViewActive.viewInit:invocation[0]": { type: "done.invoke.Visualizer.ViewActive.viewInit:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          
        };
        matchesStates: "Error" | "Init" | "Ready" | "ViewActive" | "ViewActive.updateView" | "ViewActive.viewError" | "ViewActive.viewInit" | "ViewActive.viewLoading" | "ViewActive.viewReady" | "ViewActive.webViewLoaded" | { "ViewActive"?: "updateView" | "viewError" | "viewInit" | "viewLoading" | "viewReady" | "webViewLoaded"; };
        tags: never;
      }
  