const products = [
    { name: "Laptop", price: 800 },
    { name: "Mouse", price: 25 },
    { name: "Keyboard", price: 45 }
];
console.log("-- All Products (forEach) --");

products.forEach(function (product) {
    console.log(`Item: ${product.name} - Price: $${product.price}`);
});
console.log("-- Filtered Products (Price < $50) --");

const affordableProducts = products.filter(product => product.price < 50);

console.log(affordableProducts);
console.log("-- Mapped Product Tags (map) --");

const productTags = products.map(
    product => `${product.name.toUpperCase()} costs $${product.price}`
);

console.log(productTags);
