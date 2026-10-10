const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter the bill amount: $", function (billInput) {
    rl.question("Enter the tip percentage: ", function (tipInput) {

        // Convert string inputs into numbers
        const subtotal = Number(billInput);
        const tipPercentage = Number(tipInput);

        // Validate the inputs
        if (
            billInput.trim() === "" ||
            tipInput.trim() === "" ||
            !Number.isFinite(subtotal) ||
            !Number.isFinite(tipPercentage) ||
            subtotal < 0 ||
            tipPercentage < 0
        ) {
            console.log("Invalid input. Enter valid non-negative numbers.");
            rl.close();
            return;
        }

        // Calculate the tip and total
        const tip = subtotal * tipPercentage / 100;
        let total = subtotal;
        total += tip;

        // Display the results
        console.log(`Subtotal: $${subtotal}`);
        console.log(`Tip Percentage: ${tipPercentage}%`);
        console.log(`Calculated Tip: $${tip}`);
        console.log(`Total Amount to Pay: $${total}`);

        rl.close();
    });
});
