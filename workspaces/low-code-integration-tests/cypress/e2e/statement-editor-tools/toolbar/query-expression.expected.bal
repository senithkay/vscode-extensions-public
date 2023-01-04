public function main() {
    int[] nums = [1, 2, 3, 4];
    int[] evenNums = from var i in nums
        where i % 2 == 0
        select i;
}
