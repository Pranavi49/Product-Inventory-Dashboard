
"use strict";

const STORAGE_KEY = "inventoryProProducts";

const defaultProducts = [
    { id: 1, name: "Laptop", price: 800 },
    { id: 2, name: "Mouse", price: 25 },
    { id: 3, name: "Monitor", price: 150 }
];

let inventory = loadInventory();
let nextId = inventory.reduce(
    (largest, product) => Math.max(largest, product.id),
    0
) + 1;

function loadInventory() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved !== null) {
            const parsed = JSON.parse(saved);

            if (
                Array.isArray(parsed) &&
                parsed.every(product =>
                    product &&
                    Number.isSafeInteger(product.id) &&
                    product.id > 0 &&
                    typeof product.name === "string" &&
                    product.name.trim() !== "" &&
                    typeof product.price === "number" &&
                    Number.isFinite(product.price) &&
                    product.price > 0
                ) &&
                new Set(parsed.map(product => product.id)).size === parsed.length
            ) {
                return parsed;
            }
        }
    } catch (error) {
        console.warn("Saved inventory could not be loaded.", error);
    }

    return defaultProducts.map(product => ({ ...product }));
}

function saveInventory() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
        return true;
    } catch (error) {
        console.error("Unable to save inventory.", error);
        showMessage("Changes could not be saved in browser storage.", true);
        return false;
    }
}

function getCategory(price) {
    if (price < 100) {
        return "Budget";
    } else if (price < 500) {
        return "Standard";
    } else {
        return "Premium";
    }
}

function getBadgeClass(category) {
    switch (category) {
        case "Budget":
            return "budget";
        case "Standard":
            return "standard";
        case "Premium":
            return "premium";
        default:
            return "";
    }
}

const formatPrice = price =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(price);

function validateProduct(nameInput, priceInput, editingId = null) {
    const name = String(nameInput).trim();
    const priceText = String(priceInput).trim();
    const price = Number(priceText);

    if (name === "") {
        return { error: "Product name cannot be empty." };
    }

    if (name.length > 60) {
        return { error: "Product name must be 60 characters or fewer." };
    }

    if (
        priceText === "" ||
        !Number.isFinite(price) ||
        price <= 0 ||
        !Number.isFinite(Math.round(price * 100) / 100) ||
        Math.round(price * 100) / 100 <= 0
    ) {
        return { error: "Enter a valid price greater than zero." };
    }

    for (const product of inventory) {
        if (product.id === editingId) {
            continue;
        }

        if (product.name.toLowerCase() === name.toLowerCase()) {
            return { error: "A product with this name already exists." };
        }
    }

    return {
        product: {
            name,
            price: Math.round(price * 100) / 100
        }
    };
}

function showMessage(text, isError = false) {
    const message = document.getElementById("message");
    message.textContent = text;
    message.style.color = isError ? "#dc2626" : "#15803d";
}

function addProduct(nameInput, priceInput) {
    const result = validateProduct(nameInput, priceInput);

    if (result.error) {
        showMessage(result.error, true);
        return false;
    }

    inventory.push({
        id: nextId++,
        ...result.product
    });

    saveInventory();
    renderDashboard();
    showMessage(`${result.product.name} added successfully!`);
    return true;
}

function quickAddProduct() {
    const name = prompt("Enter the new product name:");

    if (name === null) {
        showMessage("Product addition cancelled.", true);
        return;
    }

    const price = prompt("Enter the product price in USD:");

    if (price === null) {
        showMessage("Product addition cancelled.", true);
        return;
    }

    addProduct(name, price);
}

function editProduct(id) {
    const product = inventory.find(item => item.id === id);

    if (!product) {
        showMessage("Product not found.", true);
        return;
    }

    const name = prompt("Enter the updated product name:", product.name);

    if (name === null) {
        return;
    }

    const price = prompt("Enter the updated price:", String(product.price));

    if (price === null) {
        return;
    }

    const result = validateProduct(name, price, id);

    if (result.error) {
        showMessage(result.error, true);
        return;
    }

    product.name = result.product.name;
    product.price = result.product.price;

    saveInventory();
    renderDashboard();
    showMessage(`${product.name} updated successfully!`);
}

function deleteProduct(id) {
    const product = inventory.find(item => item.id === id);

    if (!product) {
        showMessage("Product not found.", true);
        return;
    }

    if (!confirm(`Delete "${product.name}" from the inventory?`)) {
        return;
    }

    inventory = inventory.filter(item => item.id !== id);

    saveInventory();
    renderDashboard();
    showMessage(`${product.name} deleted successfully!`);
}


function calculateTotalValue() {
    let total = 0;

    for (const product of inventory) {
        total += product.price;
    }

    return Math.round(total * 100) / 100;
}

const calculateProductCount = () => inventory.length;

function calculateAveragePrice() {
    if (inventory.length === 0) {
        return 0;
    }

    return calculateTotalValue() / inventory.length;
}
function calculateFinalPrice(total, taxRate, discountRate) {
    const tax = total * taxRate / 100;
    const discount = total * discountRate / 100;

    return {
        tax,
        discount,
        finalPrice: total + tax - discount
    };
}

function getVisibleProducts() {
    const searchTerm = document
        .getElementById("searchInput")
        .value.trim()
        .toLowerCase();

    const selectedCategory =
        document.getElementById("categoryFilter").value;

    const sortOption =
        document.getElementById("sortSelect").value;

    const visibleProducts = inventory.filter(product => {
        const matchesName = product.name
            .toLowerCase()
            .includes(searchTerm);

        const matchesCategory =
            selectedCategory === "All" ||
            getCategory(product.price) === selectedCategory;

        return matchesName && matchesCategory;
    });

    switch (sortOption) {
        case "low":
            visibleProducts.sort((a, b) => a.price - b.price);
            break;
        case "high":
            visibleProducts.sort((a, b) => b.price - a.price);
            break;
        case "name":
            visibleProducts.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            break;
        default:
            visibleProducts.sort((a, b) => a.id - b.id);
    }

    return visibleProducts;
}

function renderInventoryTable() {
    const table = document.getElementById("inventoryTable");
    const visibleProducts = getVisibleProducts();

    table.replaceChildren();

    if (visibleProducts.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.className = "empty-state";
        cell.textContent = inventory.length === 0
            ? "Your inventory is empty. Add a product to begin."
            : "No products match your search or filter.";

        row.appendChild(cell);
        table.appendChild(row);
    }

    visibleProducts.forEach(product => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        const name = document.createElement("span");
        const subtitle = document.createElement("span");

        name.className = "product-name";
        name.textContent = product.name;

        subtitle.className = "product-subtitle";
        subtitle.textContent = `Product ID: ${product.id}`;

        nameCell.append(name, subtitle);

        const priceCell = document.createElement("td");
        priceCell.textContent = formatPrice(product.price);

        const categoryCell = document.createElement("td");
        const badge = document.createElement("span");
        const category = getCategory(product.price);

        badge.className = `badge ${getBadgeClass(category)}`;
        badge.textContent = category;
        categoryCell.appendChild(badge);

        const actionsCell = document.createElement("td");
        const actionGroup = document.createElement("div");

        actionGroup.className = "action-group";

        const editButton = document.createElement("button");
        editButton.className = "action-button";
        editButton.textContent = "Edit";
        editButton.setAttribute(
            "aria-label",
            `Edit ${product.name}`
        );
        editButton.addEventListener("click", () => editProduct(product.id));

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-button delete";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${product.name}`
        );
        deleteButton.addEventListener(
            "click",
            () => deleteProduct(product.id)
        );

        actionGroup.append(editButton, deleteButton);
        actionsCell.appendChild(actionGroup);

        row.append(nameCell, priceCell, categoryCell, actionsCell);
        table.appendChild(row);
    });

    document.getElementById("tableCount").textContent =
        `Showing ${visibleProducts.length} of ${inventory.length} products`;
}


function renderCategoryBreakdown() {
    const container = document.getElementById("categoryBreakdown");
    container.replaceChildren();

    const categories = ["Budget", "Standard", "Premium"];

    categories.forEach(category => {
        const count = inventory.filter(
            product => getCategory(product.price) === category
        ).length;

        const percentage = inventory.length === 0
            ? 0
            : count / inventory.length * 100;

        const item = document.createElement("div");
        item.className = "breakdown-item";

        const label = document.createElement("div");
        label.className = "breakdown-label";

        const name = document.createElement("span");
        name.textContent = category;

        const amount = document.createElement("span");
        amount.textContent = `${count} product${count === 1 ? "" : "s"}`;

        label.append(name, amount);

        const track = document.createElement("div");
        track.className = "bar-track";

        const fill = document.createElement("div");
        fill.className = "bar-fill";
        fill.style.width = `${percentage}%`;

        track.appendChild(fill);
        item.append(label, track);
        container.appendChild(item);
    });
}


function renderReports() {
    const affordableList = document.getElementById("affordableList");
    const reportList = document.getElementById("reportList");

    affordableList.replaceChildren();
    reportList.replaceChildren();

    const affordableProducts = inventory.filter(
        product => product.price < 200
    );

    if (affordableProducts.length === 0) {
        const item = document.createElement("li");
        item.textContent = "No affordable products found.";
        affordableList.appendChild(item);
    }

    affordableProducts.forEach(product => {
        const item = document.createElement("li");
        item.textContent = `${product.name} — ${formatPrice(product.price)}`;
        affordableList.appendChild(item);
    });

    const report = inventory.map(
        product => `${product.name.toUpperCase()}: ${formatPrice(product.price)}`
    );

    if (report.length === 0) {
        const item = document.createElement("li");
        item.textContent = "No products to report.";
        reportList.appendChild(item);
    }

    report.forEach(line => {
        const item = document.createElement("li");
        item.textContent = line;
        reportList.appendChild(item);
    });

    console.log("--- Processing Inventory Roster (forEach) ---");

    inventory.forEach(product => {
        console.log(
            `* Item: ${product.name} (${formatPrice(product.price)})` +
            ` -> Category: ${getCategory(product.price)}`
        );
    });

    console.log("--- Financial Analytics ---");
    console.log("Total Inventory Value:", formatPrice(calculateTotalValue()));
    console.log(
        "Filtered Affordable Items (Under $200):",
        affordableProducts.map(product => product.name)
    );
    console.log("Formatted Report List:", report);
}

function renderDashboard() {
    document.getElementById("totalProducts").textContent =
        calculateProductCount();

    document.getElementById("inventoryValue").textContent =
        formatPrice(calculateTotalValue());

    document.getElementById("averagePrice").textContent =
        formatPrice(calculateAveragePrice());

    document.getElementById("premiumProducts").textContent =
        inventory.filter(product => product.price >= 500).length;

    renderInventoryTable();
    renderCategoryBreakdown();
    renderReports();
}


function calculateFinancials() {
    const taxText = document.getElementById("taxRate").value.trim();
    const discountText = document.getElementById("discountRate").value.trim();

    const taxRate = Number(taxText);
    const discountRate = Number(discountText);
    const resultElement = document.getElementById("financialResult");

    if (
        taxText === "" ||
        discountText === "" ||
        !Number.isFinite(taxRate) ||
        !Number.isFinite(discountRate) ||
        taxRate < 0 ||
        taxRate > 100 ||
        discountRate < 0 ||
        discountRate > 100
    ) {
        resultElement.textContent =
            "Enter valid tax and discount rates from 0 to 100.";
        return;
    }

    const total = calculateTotalValue();
    const result = calculateFinalPrice(total, taxRate, discountRate);

    resultElement.replaceChildren();

    const lines = [
        ["Subtotal", total],
        ["Tax", result.tax],
        ["Discount", result.discount],
        ["Final Price", result.finalPrice]
    ];

    lines.forEach(([label, amount]) => {
        const line = document.createElement("div");
        const strong = document.createElement("strong");

        strong.textContent = `${label}: `;
        line.append(strong, document.createTextNode(formatPrice(amount)));
        resultElement.appendChild(line);
    });
}


function exportCSV() {
    if (inventory.length === 0) {
        showMessage("There are no products to export.", true);
        return;
    }

    const headers = ["Product ID", "Product Name", "Price", "Category"];

    const escapeCSV = value =>
        `"${String(value).replace(/"/g, '""')}"`;

    const rows = inventory.map(product => [
        product.id,
        product.name,
        product.price.toFixed(2),
        getCategory(product.price)
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(escapeCSV).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventory-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showMessage("Inventory CSV exported successfully!");
}


document.getElementById("quickAddButton")
    .addEventListener("click", quickAddProduct);

document.getElementById("addButton")
    .addEventListener("click", quickAddProduct);

document.getElementById("searchInput")
    .addEventListener("input", renderInventoryTable);

document.getElementById("categoryFilter")
    .addEventListener("change", renderInventoryTable);

document.getElementById("sortSelect")
    .addEventListener("change", renderInventoryTable);

document.getElementById("calculateButton")
    .addEventListener("click", calculateFinancials);

document.getElementById("exportButton")
    .addEventListener("click", exportCSV);

renderDashboard();

console.log("Inventory dashboard initialized successfully.");
