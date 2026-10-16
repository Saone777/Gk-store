import React, { useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS } from "./products.js";

const WHATSAPP_NUMBER = "919531880095"; // India country code + number
const FREE_DELIVERY_THRESHOLD = 300;
const DELIVERY_FEE = 25;
const SHOP_ADDRESS = "KG Mart (Kalawathi Groceries Mart), Main Road, Near Bus Stand, Your Neighborhood";

export default function App() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [cart, setCart] = useState({}); // id -> qty
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState("");

  const productsByCategory = useMemo(
    () => PRODUCTS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = PRODUCTS.find((p) => p.id === id);
        return { ...product, qty };
      });
  }, [cart]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const grandTotal = subtotal + deliveryFee;

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  function updateQty(id, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[id] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        delete next[id];
      } else {
        next[id] = updated;
      }
      return next;
    });
  }

  function addToCart(product) {
    updateQty(product.id, 1);
    showToast(`${product.name} added to cart`);
  }

  return (
    <div>
      <Header
        totalItems={totalItems}
        onCartClick={() => setDrawerOpen(true)}
      />

      <div className="categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-chip ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="section-title">{activeCategory}</div>
      <div className="product-grid">
        {productsByCategory.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            qty={cart[product.id] || 0}
            onAdd={() => addToCart(product)}
            onInc={() => updateQty(product.id, 1)}
            onDec={() => updateQty(product.id, -1)}
          />
        ))}
      </div>

      <div className="footer-shop">
        🛒 KG Mart delivers fresh groceries to your doorstep.
        <br />
        📍 {SHOP_ADDRESS}
      </div>

      {totalItems > 0 && !drawerOpen && (
        <div className="floating-bar">
          <span>{totalItems} item{totalItems > 1 ? "s" : ""} · ₹{subtotal}</span>
          <button onClick={() => setDrawerOpen(true)}>View Cart</button>
        </div>
      )}

      {drawerOpen && !checkoutOpen && (
        <CartDrawer
          cartItems={cartItems}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          grandTotal={grandTotal}
          onInc={(id) => updateQty(id, 1)}
          onDec={(id) => updateQty(id, -1)}
          onClose={() => setDrawerOpen(false)}
          onCheckout={() => setCheckoutOpen(true)}
        />
      )}

      {checkoutOpen && (
        <CheckoutDrawer
          cartItems={cartItems}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          grandTotal={grandTotal}
          onBack={() => setCheckoutOpen(false)}
          onClose={() => {
            setCheckoutOpen(false);
            setDrawerOpen(false);
          }}
          onOrderPlaced={() => {
            setCart({});
          }}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Header({ totalItems, onCartClick }) {
  return (
    <div className="header">
      <div className="header-top">
        <div className="brand">
          <span className="brand-name">KG Mart</span>
          <span className="brand-tag">Kalawathi Groceries Mart</span>
        </div>
        <button className="cart-btn" onClick={onCartClick}>
          🛒 Cart
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
      </div>
      <div className="shop-info">
        📍 {SHOP_ADDRESS}
        <br />
        🚲 Free delivery on orders above ₹{FREE_DELIVERY_THRESHOLD} · Otherwise ₹{DELIVERY_FEE} delivery fee
      </div>
    </div>
  );
}

function ProductCard({ product, qty, onAdd, onInc, onDec }) {
  return (
    <div className="product-card">
      <img className="product-img" src={product.img} alt={product.name} loading="lazy" />
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        <div className="product-unit">per {product.unit}</div>
        <div className="product-price">₹{product.price}</div>
        <div className="product-footer">
          {qty === 0 ? (
            <button className="add-btn" onClick={onAdd}>
              Add
            </button>
          ) : (
            <div className="qty-control">
              <button onClick={onDec}>−</button>
              <span>{qty}</span>
              <button onClick={onInc}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  cartItems,
  subtotal,
  deliveryFee,
  grandTotal,
  onInc,
  onDec,
  onClose,
  onCheckout,
}) {
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart">Your cart is empty. Add some items to get started!</div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.img} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">
                    ₹{item.price} x {item.qty} = ₹{item.price * item.qty}
                  </div>
                </div>
                <div className="qty-control">
                  <button onClick={() => onDec(item.id)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => onInc(item.id)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="delivery-note">
                Add items worth ₹{300 - subtotal} more for free delivery.
              </div>
            )}
            <button className="checkout-btn" onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CheckoutDrawer({
  cartItems,
  subtotal,
  deliveryFee,
  grandTotal,
  onBack,
  onClose,
  onOrderPlaced,
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});
  const [placed, setPlaced] = useState(false);

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = "Please enter your name";
    if (!phone.trim() || !/^[0-9]{10}$/.test(phone.trim())) {
      errs.phone = "Please enter a valid 10-digit phone number";
    }
    if (!address.trim()) errs.address = "Please enter your delivery address";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function placeOrder() {
    if (!validate()) return;

    const lines = [
      `*New Order - KG Mart*`,
      ``,
      `*Customer:* ${name.trim()}`,
      `*Phone:* ${phone.trim()}`,
      `*Address:* ${address.trim()}`,
      ``,
      `*Items:*`,
      ...cartItems.map((i) => `- ${i.name} x ${i.qty} (${i.unit}) = ₹${i.price * i.qty}`),
      ``,
      `Subtotal: ₹${subtotal}`,
      `Delivery Fee: ${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}`,
      `*Total: ₹${grandTotal}*`,
      ``,
      `Payment: Cash on Delivery or UPI (to be confirmed on WhatsApp)`,
    ];

    const message = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, "_blank");
    setPlaced(true);
    onOrderPlaced();
  }

  if (placed) {
    return (
      <>
        <div className="overlay" onClick={onClose} />
        <div className="drawer">
          <div className="drawer-header">
            <h2>Order Sent</h2>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="drawer-body">
            <div className="empty-cart">
              ✅ Your order details have been opened in WhatsApp. Please tap send there to notify
              KG Mart. The owner will confirm your order and delivery.
            </div>
          </div>
          <div className="drawer-footer">
            <button className="checkout-btn" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h2>Checkout</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="drawer-body">
          <button className="back-link" onClick={onBack}>
            ← Back to cart
          </button>

          <div className="payment-note">
            💰 Payment is Cash on Delivery, or UPI — arranged with the owner over WhatsApp after
            your order is confirmed. No online payment is required now.
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House no, street, landmark"
            />
            {errors.address && <div className="error-text">{errors.address}</div>}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
        <div className="drawer-footer">
          <button className="checkout-btn" onClick={placeOrder}>
            Send Order on WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}
