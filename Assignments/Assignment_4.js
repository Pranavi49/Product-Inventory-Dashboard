console.log("-- Multiplication Table of 5 --");

for (let i = 1; i <= 5; i++) {
    console.log(`5 x ${i} = ${5 * i}`);
}

console.log("-- First number > 10 divisible by 6 --");

let number = 11;

while (true) {
    if (number > 10 && number % 6 === 0) {
        console.log(`Found: ${number}`);
        break;
    }

    number++;
}

console.log("-- Skipping numbers using continue --");

let count = 0;

do {
    count++;

    if (count === 3 || count === 5) {
        continue;
    }

    console.log(`Number: ${count}`);

} while (count < 5);
