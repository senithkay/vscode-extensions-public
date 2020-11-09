
import ballerina/java;

# Ballerina object mapping for Java class `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
#
# + _BWebSocketRPCHandler - The field that represents this Ballerina object, which is used for Java subtyping.
# + _Object - The field that represents the superclass object `Object`.
@java:Binding {
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler"
}
class BWebSocketRPCHandler {

    *java:JObject;

    BWebSocketRPCHandlerT _BWebSocketRPCHandler = BWebSocketRPCHandlerT;
    ObjectT _Object = ObjectT;

    # The init function of the Ballerina object mapping `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler` Java class.
    #
    # + obj - The `handle` value containing the Java reference of the object.
    function init(handle obj) {
        self.jObj = obj;
    }

    # The function to retrieve the string value of a Ballerina object mapping a Java class.
    #
    # + return - The `string` form of the object instance.
    function toString() returns string {
        return java:jObjToString(self.jObj);
    }

    # The function that maps to the `close` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    function close() {
        () obj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_close(self.jObj);
    }

    # The function that maps to the `equals` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    #
    # + arg0 - The `Object` value required to map with the Java method parameter.
    # + return - The `boolean` value returning from the Java mapping.
    function 'equals(Object arg0) returns boolean {
        boolean externalObj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_equals(self.jObj, arg0.jObj);
        return externalObj;
    }

    # The function that maps to the `getClass` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    # 
    # + return - The `Class` value returning from the Java mapping.
    function getClass() returns Class {
        handle externalObj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_getClass(self.jObj);
        Class obj = new(externalObj);
        return obj;
    }

    # The function that maps to the `hashCode` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    # 
    # + return - The `int` value returning from the Java mapping.
    function hashCode() returns int {
        int externalObj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_hashCode(self.jObj);
        return externalObj;
    }

    # The function that maps to the `init` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    function 'init() {
        () obj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_init(self.jObj);
    }

    # The function that maps to the `notify` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    function notify() {
        () obj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_notify(self.jObj);
    }

    # The function that maps to the `notifyAll` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    function notifyAll() {
        () obj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_notifyAll(self.jObj);
    }

    # The function that maps to the `onMessage` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    #
    # + arg0 - The `string` value required to map with the Java method parameter.
    function onMessage(string arg0) {
        () obj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_onMessage(self.jObj, java:fromString(arg0));
    }

    # The function that maps to the `wait` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    # 
    # + return - The `error?` value returning from the Java mapping.
    function 'wait() returns error? {
        error|() obj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_wait(self.jObj);
        if (obj is error) {
            InterruptedException e = InterruptedException(INTERRUPTEDEXCEPTION, message = obj.message(), cause = obj);
            return e;
        }
    }

    # The function that maps to the `wait` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    #
    # + arg0 - The `int` value required to map with the Java method parameter.
    # + return - The `error?` value returning from the Java mapping.
    function 'wait2(int arg0) returns error? {
        error|() obj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_wait2(self.jObj, arg0);
        if (obj is error) {
            InterruptedException e = InterruptedException(INTERRUPTEDEXCEPTION, message = obj.message(), cause = obj);
            return e;
        }
    }

    # The function that maps to the `wait` method of `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler`.
    #
    # + arg0 - The `int` value required to map with the Java method parameter.
    # + arg1 - The `int` value required to map with the Java method parameter.
    # + return - The `error?` value returning from the Java mapping.
    function 'wait3(int arg0, int arg1) returns error? {
        error|() obj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_wait3(self.jObj, arg0, arg1);
        if (obj is error) {
            InterruptedException e = InterruptedException(INTERRUPTEDEXCEPTION, message = obj.message(), cause = obj);
            return e;
        }
    }
}

# Constructor function to generate an object of type `BWebSocketRPCHandler` representing the `org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler` Java class.
#
# + arg0 - The `BObject` value required to map with the Java constructor parameter.
# + return - The new `BWebSocketRPCHandler` object generated.
function newBWebSocketRPCHandler1(BObject arg0) returns BWebSocketRPCHandler {
    handle obj = org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_newBWebSocketRPCHandler1(arg0.jObj);
    BWebSocketRPCHandler _bWebSocketRPCHandler = new(obj);
    return _bWebSocketRPCHandler;
}

// External interop functions for mapping public constructors.

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_newBWebSocketRPCHandler1(handle arg0) returns handle = @java:Constructor {
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: ["io.ballerina.runtime.api.values.BObject"]
} external;

// External interop functions for mapping public methods.

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_close(handle receiver) = @java:Method {
    name: "close",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: []
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_equals(handle receiver, handle arg0) returns boolean = @java:Method {
    name: "equals",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: ["java.lang.Object"]
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_getClass(handle receiver) returns handle = @java:Method {
    name: "getClass",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: []
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_hashCode(handle receiver) returns int = @java:Method {
    name: "hashCode",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: []
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_init(handle receiver) = @java:Method {
    name: "init",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: []
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_notify(handle receiver) = @java:Method {
    name: "notify",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: []
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_notifyAll(handle receiver) = @java:Method {
    name: "notifyAll",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: []
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_onMessage(handle receiver, handle arg0) = @java:Method {
    name: "onMessage",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: ["java.lang.String"]
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_wait(handle receiver) returns error? = @java:Method {
    name: "wait",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: []
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_wait2(handle receiver, int arg0) returns error? = @java:Method {
    name: "wait",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: ["long"]
} external;

function org_wso2_choreo_workspace_langserver_BWebSocketRPCHandler_wait3(handle receiver, int arg0, int arg1) returns error? = @java:Method {
    name: "wait",
    'class: "org.wso2.choreo.workspace.langserver.BWebSocketRPCHandler",
    paramTypes: ["long", "int"]
} external;


