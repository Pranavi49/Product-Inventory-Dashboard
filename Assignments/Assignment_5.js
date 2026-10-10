function calculateArea(length = 5, width = 4) {
    return length * width;
}

console.log(
    `Standard Function Area (Default 5x4): ${calculateArea()}`
);

const calculateAreaArrow = (length = 5, width = 4) => {
    return length * width;
};

console.log(
    `Arrow Function Area (Custom 10x3): ${calculateAreaArrow(10, 3)}`
);

try {
    if (true) {
        let blockVar = "I exist only inside this block";
        console.log("Inside block:", blockVar);
    }

    // This variable cannot be accessed outside its block
    console.log(blockVar);

} catch (error) {
    console.log(`Scope Test Error: ${error.name}: ${error.message}`);
}
