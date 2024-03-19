const plus = document.querySelectorAll(".plus");
const minus = document.querySelectorAll(".minus");
const display = document.querySelectorAll(".display");
const placeOrder = document.querySelectorAll(".placeOrder");
const finalPlaceOrder = document.querySelectorAll(".finalPlaceOrder");
const placeOrderForm = document.querySelectorAll(".placeOrderForm");
const cancelOrder = document.querySelectorAll(".cancelOrder");
const confirmOrder = document.querySelectorAll(".confirmOrder");
const cartItems = document.querySelectorAll(".cartItems");

for (let i = 0; i < display.length; i++) {
  plus[i].addEventListener("click", function () {
    display[i].value = parseInt(display[i].value) + 1;
  });
}

for (let i = 0; i < display.length; i++) {
  minus[i].addEventListener("click", function () {
    if (display[i].value > 1) {
      display[i].value = parseInt(display[i].value) - 1;
    }
  });
}

for (let i = 0; i < display.length; i++) {
  placeOrder[i].addEventListener("click", function () {
    for (let j = 0; j < display.length; j++) {
      if (j == i) {
        confirmOrder[i].style.display = "flex";
      } else {
        confirmOrder[j].style.display = "none";
      }
    }
  });
}

for (let i = 0; i < display.length; i++) {
  cancelOrder[i].addEventListener("click", function () {
    confirmOrder[i].style.display = "none";
  });
}

for (let i = 0; i < display.length; i++) {
  finalPlaceOrder[i].addEventListener("click", function () {
    placeOrderForm[i].submit();
  });
}

// Get all the "Add to Cart" buttons
const addToCartButtons = document.querySelectorAll(".addToCart");
const notificationOfAddCart = document.querySelectorAll(
  ".notificationOfAddCart"
);

// Add a click event listener to each button
for (let i = 0; i < addToCartButtons.length; i++) {
  addToCartButtons[i].addEventListener("click", addToCart);

  // Event handler for the "Add to Cart" button click
  function addToCart(event) {
    notificationOfAddCart[i].style.opacity = "1";
    notificationOfAddCart[i].style.visibility = "visible";
    setTimeout(() => {
      notificationOfAddCart[i].style.opacity = "0";
      notificationOfAddCart[i].style.visibility = "hidden";
    }, 2000);
    const button = event.target;
    const productId = button.value;

    // Create the POST request data
    const data = {
      product_id: productId,
    };

    // Send the POST request using AJAX
    fetch("/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        // Handle the response from the server
        console.log(result);
        // Add any necessary code here to update the UI or show a success message
      })
      .catch((error) => {
        console.error("Error:", error);
        // Add any necessary code here to handle errors
      });
  }
}

const RemoveFromCartButtons = document.querySelectorAll(".removeFromCart");
for (let i = 0; i < RemoveFromCartButtons.length; i++) {
  RemoveFromCartButtons[i].addEventListener("click", removeFromCart);

  // Event handler for the "Add to Cart" button click
  function removeFromCart(event) {
    const button = event.target;
    const productId = button.value;

    // Create the POST request data
    const data = {
      product_id: productId,
    };
    cartItems[i].style.display = "none";
    // Send the POST request using AJAX
    fetch("/removeFromCart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        // Handle the response from the server
        console.log(result);
        // Add any necessary code here to update the UI or show a success message
      })
      .catch((error) => {
        console.error("Error:", error);
        // Add any necessary code here to handle errors
      });
  }
}

const cancelOrder1 = document.querySelectorAll(".cancelOrder");
const corder = document.querySelectorAll('.corder');
for (let i = 0; i < cancelOrder.length; i++) {
  cancelOrder1[i].addEventListener("click", cancelCustomerOrder);

  // Event handler for the "Cancel Order" button click
  function cancelCustomerOrder(event) {
    const button = event.target;
    const tracking_number = button.value;

    // Create the POST request data
    const data = {
      tracking_number: tracking_number,
    };

    // Hide the order element when canceled
    corder[i].style.display = "none";

    // Send the POST request using fetch and handle the response
    fetch("/cancelorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        // Handle the response from the server
        console.log(result);
        // Add any necessary code here to update the UI or show a success message
      })
      .catch((error) => {
        console.error("Error:", error);
        // Add any necessary code here to handle errors
      });
  }
}
