const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");

menuToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menu");
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menu");
  }
});

const mainProductImage = document.querySelector(".product-main-image");
const galleryThumbs = document.querySelectorAll(".gallery-thumb");
const buyButton = document.querySelector(".buy-button");
const cartFeedback = document.querySelector(".cart-feedback");
const searchForms = document.querySelectorAll(".site-search");
const productCards = document.querySelectorAll(".catalog-grid .product-card");
const emptyState = document.querySelector(".search-empty-state");
const authForms = document.querySelectorAll("[data-auth-form]");
const userLinks = document.querySelectorAll(".user-link");
const cartLinks = document.querySelectorAll(".cart-link");
const cartItemsContainer = document.querySelector("[data-cart-items]");
const cartEmptyState = document.querySelector("[data-cart-empty]");
const cartTotal = document.querySelector("[data-cart-total]");

const catalogProducts = [
  { nome: "Bolsa Tote Siena", categoria: "ombro" },
  { nome: "Bolsa Estruturada Noir", categoria: "mao" },
  { nome: "Mochila Urban Soft", categoria: "ombro" },
  { nome: "Bolsa Weekend Couro", categoria: "ombro" },
  { nome: "Bolsa de Ombro Lumi", categoria: "ombro" },
  { nome: "Bolsa Transversal Aura", categoria: "transversal" },
  { nome: "Shoulder Bag Alba", categoria: "ombro" },
  { nome: "Bolsa para Garrafa Noma", categoria: "garrafa" },
];

const cartStorageKey = "skadCart";

function getCartItems() {
  try {
    const stored = window.localStorage.getItem(cartStorageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartItems(items) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
}

function formatCurrency(value) {
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function updateCartBadge() {
  const count = getCartItems().reduce((total, item) => total + item.quantity, 0);

  cartLinks.forEach((link) => {
    let badge = link.querySelector(".cart-badge");

    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      link.appendChild(badge);
    }

    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

function renderCartPage() {
  if (!cartItemsContainer || !cartTotal || !cartEmptyState) {
    return;
  }

  const items = getCartItems();
  cartItemsContainer.innerHTML = "";

  if (!items.length) {
    cartEmptyState.hidden = false;
    cartTotal.textContent = formatCurrency(0);
    return;
  }

  cartEmptyState.hidden = true;

  let total = 0;

  items.forEach((item) => {
    total += item.priceCents * item.quantity;

    const article = document.createElement("article");
    article.className = "cart-item";
    article.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-meta">
        <strong>${item.name}</strong>
        <div class="cart-item-controls">
          <button class="qty-button" type="button" data-cart-action="decrease" data-cart-name="${item.name}">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-button" type="button" data-cart-action="increase" data-cart-name="${item.name}">+</button>
          <button class="remove-item-button" type="button" data-cart-action="remove" data-cart-name="${item.name}">Remover item</button>
        </div>
      </div>
      <strong>${formatCurrency(item.priceCents * item.quantity)}</strong>
    `;
    cartItemsContainer.appendChild(article);
  });

  cartTotal.textContent = formatCurrency(total);
}

function updateCartItemQuantity(name, change) {
  const items = getCartItems();
  const item = items.find((entry) => entry.name === name);

  if (!item) {
    return;
  }

  item.quantity += change;

  const nextItems = items.filter((entry) => entry.quantity > 0);
  saveCartItems(nextItems);
  updateCartBadge();
  renderCartPage();
}

function removeCartItem(name) {
  const items = getCartItems().filter((entry) => entry.name !== name);
  saveCartItems(items);
  updateCartBadge();
  renderCartPage();
}

galleryThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const image = thumb.getAttribute("data-image");

    if (mainProductImage && image) {
      mainProductImage.setAttribute("src", image);
    }

    galleryThumbs.forEach((item) => item.classList.remove("active"));
    thumb.classList.add("active");
  });
});

buyButton?.addEventListener("click", () => {
  const items = getCartItems();
  const name = buyButton.getAttribute("data-cart-name") || "Produto SKAD";
  const priceCents = Number(buyButton.getAttribute("data-cart-price-cents") || "0");
  const image = buyButton.getAttribute("data-cart-image") || "";
  const existingItem = items.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    items.push({
      name,
      priceCents,
      image,
      quantity: 1,
    });
  }

  saveCartItems(items);
  updateCartBadge();
  renderCartPage();
  cartFeedback?.classList.add("visible");

  window.setTimeout(() => {
    cartFeedback?.classList.remove("visible");
  }, 2800);
});

cartItemsContainer?.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.getAttribute("data-cart-action");
  const name = target.getAttribute("data-cart-name");

  if (!action || !name) {
    return;
  }

  if (action === "increase") {
    updateCartItemQuantity(name, 1);
  }

  if (action === "decrease") {
    updateCartItemQuantity(name, -1);
  }

  if (action === "remove") {
    removeCartItem(name);
  }
});

searchForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector(".search-input");
    const term = input?.value.trim() ?? "";
    const url = new URL("bolsas.html", window.location.href);

    if (term) {
      url.searchParams.set("busca", term);
    }

    window.location.href = url.toString();
  });
});

if (productCards.length) {
  const params = new URLSearchParams(window.location.search);
  const searchTerm = (params.get("busca") || "").trim().toLowerCase();

  const normalizedTerm = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let visibleCount = 0;

  productCards.forEach((card, index) => {
    const product = catalogProducts[index];
    const searchable = `${product.nome} ${product.categoria}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const matches = !normalizedTerm || searchable.includes(normalizedTerm);

    card.hidden = !matches;
    if (matches) {
      visibleCount += 1;
    }
  });

  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }

  document.querySelectorAll(".search-input").forEach((input) => {
    input.value = params.get("busca") || "";
  });
}

authForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.localStorage.setItem("usuarioLogado", "true");
    window.location.href = "./index.html";
  });
});

const loggedIn = window.localStorage.getItem("usuarioLogado") === "true";

userLinks.forEach((link) => {
  if (loggedIn) {
    link.setAttribute("title", "Minha Conta");
    link.setAttribute("aria-label", "Minha Conta");
  }
});

updateCartBadge();
renderCartPage();
