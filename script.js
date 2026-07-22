// ==========================================
// CONFIGURAZIONE
// ==========================================

// Questo è il tuo Cloudflare Worker.
// NON inserire qui il Webhook Discord.

const WORKER_URL =
  "https://agdelivery.massibohhdeveloper.workers.dev";


// ==========================================
// CARRELLO
// ==========================================

let cart = [];


// ==========================================
// AGGIUNGI PRODOTTO
// ==========================================

function addToCart(name, price) {

  const existingProduct = cart.find(
    product => product.name === name
  );

  if (existingProduct) {

    existingProduct.quantity++;

  } else {

    cart.push({
      name: name,
      price: price,
      quantity: 1
    });

  }

  updateCart();

  openCart();

}


// ==========================================
// RIMUOVI PRODOTTO
// ==========================================

function removeFromCart(name) {

  const product = cart.find(
    product => product.name === name
  );

  if (!product) return;

  product.quantity--;

  if (product.quantity <= 0) {

    cart = cart.filter(
      item => item.name !== name
    );

  }

  updateCart();

}


// ==========================================
// AGGIORNA CARRELLO
// ==========================================

function updateCart() {

  const cartItems =
    document.getElementById("cart-items");

  const cartCount =
    document.getElementById("cart-count");

  const cartTotal =
    document.getElementById("cart-total");


  cartItems.innerHTML = "";


  if (cart.length === 0) {

    cartItems.innerHTML = `
      <p class="empty-cart">
        Il carrello è vuoto.
      </p>
    `;

  }


  let total = 0;

  let itemCount = 0;


  cart.forEach(product => {

    const productTotal =
      product.price * product.quantity;


    total += productTotal;

    itemCount += product.quantity;


    const item = document.createElement("div");

    item.className = "cart-item";


    item.innerHTML = `

      <div class="cart-item-top">

        <span class="cart-item-name">
          ${product.name}
        </span>

        <span class="cart-item-price">
          € ${productTotal.toFixed(2)}
        </span>

      </div>


      <div class="cart-controls">

        <button
          onclick="removeFromCart('${product.name}')"
        >
          −
        </button>

        <span>
          ${product.quantity}
        </span>

        <button
          onclick="addToCart('${product.name}', ${product.price})"
        >
          +
        </button>

      </div>

    `;


    cartItems.appendChild(item);

  });


  cartCount.textContent =
    itemCount;


  cartTotal.textContent =
    total.toFixed(2);

}


// ==========================================
// APRI CARRELLO
// ==========================================

function openCart() {

  document
    .getElementById("cart-overlay")
    .classList.add("open");

}


// ==========================================
// CHIUDI CARRELLO
// ==========================================

function toggleCart() {

  document
    .getElementById("cart-overlay")
    .classList.toggle("open");

}


function closeCartOutside(event) {

  if (
    event.target.id === "cart-overlay"
  ) {

    toggleCart();

  }

}


// ==========================================
// SCROLL MENU
// ==========================================

function scrollToMenu() {

  document
    .getElementById("menu")
    .scrollIntoView({
      behavior: "smooth"
    });

}


// ==========================================
// FILTRO CATEGORIE
// ==========================================

function filterProducts(category, button) {

  const products =
    document.querySelectorAll(".product-card");


  const buttons =
    document.querySelectorAll(".category");


  buttons.forEach(btn => {

    btn.classList.remove("active");

  });


  button.classList.add("active");


  products.forEach(product => {

    const productCategory =
      product.dataset.category;


    if (
      category === "all" ||
      productCategory === category
    ) {

      product.style.display = "block";

    } else {

      product.style.display = "none";

    }

  });

}


// ==========================================
// INVIO ORDINE
// ==========================================

async function sendOrder() {

  const status =
    document.getElementById("order-status");


  const button =
    document.querySelector(".order-button");


  const customerName =
    document
      .getElementById("customer-name")
      .value
      .trim();


  const deliveryLocation =
    document
      .getElementById("delivery-location")
      .value
      .trim();


  const notes =
    document
      .getElementById("order-notes")
      .value
      .trim();


  // CONTROLLO CARRELLO

  if (cart.length === 0) {

    status.textContent =
      "❌ Il carrello è vuoto.";

    return;

  }


  // CONTROLLO NOME

  if (!customerName) {

    status.textContent =
      "❌ Inserisci il tuo nome RP.";

    return;

  }


  // CONTROLLO POSIZIONE

  if (!deliveryLocation) {

    status.textContent =
      "❌ Inserisci la posizione.";

    return;

  }


  // CREA TESTO ORDINE

  const orderText = cart
    .map(product => {

      const total =
        product.price *
        product.quantity;

      return (
        `${product.quantity}x ${product.name}` +
        ` — €${total.toFixed(2)}`
      );

    })
    .join("\n");


  // CALCOLA TOTALE

  const total =
    cart.reduce(
      (sum, product) =>
        sum +
        product.price *
        product.quantity,
      0
    );


  // BLOCCA PULSANTE

  button.disabled = true;

  button.textContent =
    "Invio in corso...";


  status.textContent =
    "⏳ Invio dell'ordine...";


  try {

    const response =
      await fetch(
        WORKER_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            cliente:
              customerName,

            posizione:
              deliveryLocation,

            ordine:
              `${orderText}\n\nTotale: €${total.toFixed(2)}`,

            note:
              notes

          })

        }
      );


    if (!response.ok) {

      throw new Error(
        "Errore del server"
      );

    }


    // SUCCESSO

    status.textContent =
      "✅ Ordine inviato con successo!";


    // RESET

    cart = [];

    updateCart();


    document
      .getElementById("customer-name")
      .value = "";


    document
      .getElementById("delivery-location")
      .value = "";


    document
      .getElementById("order-notes")
      .value = "";


  } catch (error) {

    console.error(error);


    status.textContent =
      "❌ Impossibile inviare l'ordine. Riprova.";

  }


  button.disabled = false;

  button.textContent =
    "🛵 INVIA ORDINE";

}


// ==========================================
// INIZIALIZZAZIONE
// ==========================================

updateCart();
