import ballerina/http;
import ballerina/io;

public function main() returns error? {

    worker A {
        // Use `-> W` to send a message to worker `W`.
        1 -> B;
        2 -> C;

    }

    worker B {
        // Use `<- W` to receive a message from worker `W`.
        int x1 = <- A;

        // Use `function` to refer to the function's default worker.
        x1 -> function;

    }

    worker C {
        int x2 = <- A;
        x2 -> function;
    }

    http:Client httpEp = check new (url = "https://foo.com");
    int y1 = <- B;
    int y2 = <- C;

    io:println(y1 + y2);
}
