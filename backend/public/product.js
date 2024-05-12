let infoStatus = "Info";
let infoDiv = document.querySelectorAll(".headings > span");
infoDiv.forEach((item) => {
  item.addEventListener("click", (e) => {
    if (!(infoStatus == item.innerText)) {
      document
        .querySelector(`#${item.innerText}`)
        .classList.add("darkBorderBottom");

      document
        .querySelector(`#${infoStatus}`)
        .classList.remove("darkBorderBottom");

      document
        .querySelector(`#${item.innerText}-Para`)
        .classList.add("visibleTransition");

      document
        .querySelector(`#${infoStatus}-Para`)
        .classList.remove("visibleTransition");

      infoStatus = item.innerText;
    }
  });
});

let colorsList = productInfo.color;
let sizeList = ["S", "M", "L"];
let colorSelected = colorsList[0];
if (colorsList.length > 0) {
  let colorListDiv = document.querySelector("#color-list");

  for (let i = 0; i < colorsList.length; i++) {
    let colorDiv = document.createElement("div");
    colorDiv.classList.add("colorDiv");
    colorDiv.style.backgroundColor = colorsList[i];
    colorDiv.id = colorsList[i];

    colorListDiv.append(colorDiv);
  }
  let colors = document.querySelectorAll(".colorDiv");
  colors[0].classList.add("selectedColor");

  colors.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (!(item.id == colorSelected)) {
        item.classList.add("selectedColor");
        document
          .querySelector(`#${colorSelected}`)
          .classList.remove("selectedColor");
        colorSelected = item.id;
      }
    });
  });
} else if (colorsList.length == 0) {
  document.querySelector("#available-colors").style.display = "none  ";
}

if (sizeList.length > 0) {
  let sizesListDiv = document.querySelector("#size-list");
  let sizeSelected = sizeList[0];

  for (let i = 0; i < sizeList.length; i++) {
    let sizeDiv = document.createElement("div");
    sizeDiv.classList.add("sizeDiv");
    sizeDiv.innerText = sizeList[i];
    sizeDiv.id = sizeList[i];

    sizesListDiv.append(sizeDiv);
  }

  let sizes = document.querySelectorAll(".sizeDiv");
  sizes[0].classList.add("selectedSize");

  sizes.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (!(item.id == sizeSelected)) {
        item.classList.add("selectedSize");
        document
          .querySelector(`#${sizeSelected}`)
          .classList.remove("selectedSize");
        sizeSelected = item.id;
      }
    });
  });
} else {
  document.querySelector("#available-sizes").style.display = "none";
} 

document.querySelector("#add-to-cart").addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default form submission
  let productId = productInfo._id;
  let quantity = document.querySelector("#quantity").value;
  fetch("/addToCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      productId,
      quantity,
      colorSelected
    })
  }).then(response => {
    return response.json()
  }).then(data => {
    if (data.status == "success") {
      document.querySelector("#add-to-cart").style.display = "none"
      document.querySelector("#remove-from-cart").style.display = "block"
    }
  })
});

// Event listener for "remove-from-cart" button
document.querySelector("#remove-from-cart").addEventListener("click", () => {
  let productId = productInfo._id;
  fetch("/removeFromCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      productId,
    })
  }).then(response => {
    return response.json()
  }).then(data => {
    if (data.status == "success") {
      document.querySelector("#add-to-cart").style.display = "block"
      document.querySelector("#remove-from-cart").style.display = "none"
    }
  })
});