class Person {
    private string name;
    private int age;

    function init(string name, int age) {
        self.name = name;
        self.age = age;
    }

    function getName() returns string {
        return self.name;
    }
}
