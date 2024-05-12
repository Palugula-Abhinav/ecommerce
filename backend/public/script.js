document.addEventListener("DOMContentLoaded", function () {
  // const searchIcon = document.getElementById("search-icon");
  const nav = document.querySelector(".nav");
  const searchInput = document.querySelector(".search-input");
  const menuToggle = document.querySelector(".menu-toggle");

  // Handle click on menu toggle button
  menuToggle.addEventListener("click", function () {
    nav.classList.toggle("mobile-nav");
    this.classList.toggle("is-active");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const productsData = [
    {
      imageUrl:
        "https://store-bixbang.myshopify.com/cdn/shop/products/1-11_600x.jpg?v=1561601648",
      name: "Fancy Mules",
      price: "$45.00 USD",
      keywords: ["new arrivals", "shoes"],
    },
    {
      imageUrl:
        "https://store-bixbang.myshopify.com/cdn/shop/products/1-11_600x.jpg?v=1561601648",
      name: "Fancy Mules",
      price: "$45.00 USD",
      keywords: ["new arrivals", "shoes"],
    },
    {
      imageUrl:
        "https://store-bixbang.myshopify.com/cdn/shop/products/1-11_600x.jpg?v=1561601648",
      name: "Fancy Mules",
      price: "$45.00 USD",
      keywords: ["new arrivals", "shoes"],
    },
    {
      imageUrl:
        "https://store-bixbang.myshopify.com/cdn/shop/products/1-11_600x.jpg?v=1561601648",
      name: "Denim Jacket",
      price: "$65.00 USD",
      keywords: ["denim", "denim collection"],
    },
    {
      imageUrl:
        "https://store-bixbang.myshopify.com/cdn/shop/products/1-11_600x.jpg?v=1561601648",
      name: "Swimsuit",
      price: "$35.00 USD",
      keywords: ["swimwear"],
    },
    {
      imageUrl:
        "https://store-bixbang.myshopify.com/cdn/shop/products/1-11_600x.jpg?v=1561601648",
      name: "Bestseller T-Shirt",
      price: "$25.00 USD",
      keywords: ["bestsellers", "t-shirt"],
    },
    // Add more product objects as needed
  ];

  const productsContainer = document.getElementById("products");
  const filterButtons = document.querySelectorAll("#filters button");

  // Function to create product elements based on data
  function renderProducts(data) {
    productsContainer.innerHTML = ""; // Clear existing products

    data.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.className = "product";

      const imageElement = document.createElement("img");
      imageElement.src = product.imageUrl;
      imageElement.alt = product.name;
      productElement.appendChild(imageElement);

      const nameElement = document.createElement("p");
      nameElement.className = "product-name";
      nameElement.textContent = product.name;
      productElement.appendChild(nameElement);

      const priceElement = document.createElement("p");
      priceElement.className = "product-price";
      priceElement.textContent = product.price;
      productElement.appendChild(priceElement);

      productsContainer.appendChild(productElement);
    });
  }

  // Initial render of products (all products)
  renderProducts(productsData);

  // Add click event listeners to filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterValue = button.textContent.toLowerCase().trim();
      const filteredProducts = productsData.filter((product) =>
        product.keywords.includes(filterValue)
      );
      renderProducts(filteredProducts);

      // Remove 'selectedFilter' class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("selectedFilter"));

      // Add 'selectedFilter' class to the clicked button
      button.classList.add("selectedFilter");
    });
  });
});
