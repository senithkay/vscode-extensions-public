import ballerina/java;
import ballerina/java.arrays as jarrays;

public function getArrayFromHandle(handle arg, typedesc<any> t = handle) returns any[] {
    any[] returnArray = [];
    if (!java:isNull(arg)) {
        int count = jarrays:getLength(arg);
        foreach int i in 0 ... count-1 {
            any element = jarrays:get(arg, i);
            if (element is int|boolean|float|byte) {
                returnArray[i] = element;
            } else if (element is handle) {
                if (t is typedesc<string>) {
                    returnArray[i] = java:toString(element);
                } else if (t is typedesc<handle>) {
                    returnArray[i] = element;
                }
            }
        }
    }
    return returnArray;
}

public function getHandleFromArray(any[] arg, string className) returns handle|error {
    handle returnHandle = jarrays:newInstance(check java:getClass(className), arg.length());
    int count=0;
    while (count < arg.length()) {
        if (className == "char" && arg is byte[]) {
            jarrays:set(returnHandle, count, wrapByteToChar(arg[count]));
            count+=1;
        } else if (className == "char" && arg is int[]) {
            jarrays:set(returnHandle, count, wrapIntToChar(arg[count]));
            count+=1;
        } else if (className == "char" && arg is float[]) {
            jarrays:set(returnHandle, count, wrapFloatToChar(arg[count]));
            count+=1;
        } else if (className == "short" && arg is byte[]) {
            jarrays:set(returnHandle, count, wrapByteToShort(arg[count]));
            count+=1;
        } else if (className == "short" && arg is int[]) {
            jarrays:set(returnHandle, count, wrapIntToShort(arg[count]));
            count+=1;
        } else if (className == "short" && arg is float[]) {
            jarrays:set(returnHandle, count, wrapFloatToShort(arg[count]));
            count+=1;
        } else if (className == "long" && arg is byte[]) {
            jarrays:set(returnHandle, count, wrapByteToLong(arg[count]));
            count+=1;
        } else if (className == "long" && arg is int[]) {
            jarrays:set(returnHandle, count, wrapIntToLong(arg[count]));
            count+=1;
        } else if (className == "long" && arg is float[]) {
            jarrays:set(returnHandle, count, wrapFloatToLong(arg[count]));
            count+=1;
        } else if (className == "double" && arg is byte[]) {
            jarrays:set(returnHandle, count, wrapByteToDouble(arg[count]));
            count+=1;
        } else if (className == "double" && arg is float[]) {
            jarrays:set(returnHandle, count, wrapFloatToDouble(arg[count]));
            count+=1;
        } else if (arg is byte[]) {
            jarrays:set(returnHandle, count, wrapByte(arg[count]));
            count+=1;
        } else if (arg is int[]) {
            jarrays:set(returnHandle, count, wrapInt(arg[count]));
            count+=1;
        } else if (arg is boolean[]) {
            jarrays:set(returnHandle, count, wrapBoolean(arg[count]));
            count+=1;
        } else if (arg is float[]) {
            jarrays:set(returnHandle, count, wrapFloat(arg[count]));
            count+=1;
        } else if (arg is string[]) {
            jarrays:set(returnHandle, count, java:fromString(arg[count]));
            count+=1;
        } else if (arg is JObject[]) {
            JObject jObject = arg[count];
            jarrays:set(returnHandle, count, jObject.jObj);
            count+=1;
        }
    }
    return returnHandle;
}

function wrapBoolean(boolean b) returns handle = @java:Constructor {
    class: "java.lang.Boolean",
    paramTypes: ["boolean"]
} external;

function wrapByte(byte b) returns handle = @java:Constructor {
    class: "java.lang.Byte",
    paramTypes: ["byte"]
} external;

function wrapInt(int i) returns handle = @java:Constructor {
    class: "java.lang.Integer",
    paramTypes: ["int"]
} external;

function wrapFloat(float f) returns handle = @java:Constructor {
    class: "java.lang.Float",
    paramTypes: ["float"]
} external;

function wrapByteToChar(byte b) returns handle = @java:Constructor {
    class: "java.lang.Character",
    paramTypes: ["char"]
} external;

function wrapIntToChar(int b) returns handle = @java:Constructor {
    class: "java.lang.Character",
    paramTypes: ["char"]
} external;

function wrapFloatToChar(float b) returns handle = @java:Constructor {
    class: "java.lang.Character",
    paramTypes: ["char"]
} external;

function wrapFloatToShort(float b) returns handle = @java:Constructor {
    class: "java.lang.Short",
    paramTypes: ["short"]
} external;

function wrapIntToShort(int b) returns handle = @java:Constructor {
    class: "java.lang.Short",
    paramTypes: ["short"]
} external;

function wrapByteToShort(byte b) returns handle = @java:Constructor {
    class: "java.lang.Short",
    paramTypes: ["short"]
} external;

function wrapByteToLong(byte b) returns handle = @java:Constructor {
    class: "java.lang.Long",
    paramTypes: ["long"]
} external;

function wrapIntToLong(int b) returns handle = @java:Constructor {
    class: "java.lang.Long",
    paramTypes: ["long"]
} external;

function wrapFloatToLong(float b) returns handle = @java:Constructor {
    class: "java.lang.Long",
    paramTypes: ["long"]
} external;

function wrapByteToDouble(byte b) returns handle = @java:Constructor {
    class: "java.lang.Double",
    paramTypes: ["double"]
} external;

function wrapFloatToDouble(float b) returns handle = @java:Constructor {
    class: "java.lang.Double",
    paramTypes: ["double"]
} external;

