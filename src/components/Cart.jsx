import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/cart.css";

export default function Cart() {
  const [cart, setCart] = useState({
    items: [],
    status: "pending",
    registrationNumber: "",
  });
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const userData = JSON.parse(localStorage.getItem("dear-user"));

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/cart/${userData.id}`
        );
        const data = await response.json();
        setCart(data);
        // Set registration number if it exists
        if (data.registrationNumber) {
          setRegistrationNumber(data.registrationNumber);
        }
      } catch (error) {
        toast.error("Failed to load cart");
      }
    };

    fetchCart();
  }, [userData.id]);

  const removeFromCart = async (bookId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/cart/${userData.id}/items/${bookId}`,
        { method: "DELETE" }
      );
      const updatedCart = await response.json();
      setCart(updatedCart);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    if (!registrationNumber) {
      toast.error("Please enter your registration number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/cart/${userData.id}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            registrationNumber,
            status: "pending", // Initial status before admin confirmation
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        setCart({
          ...cart,
          items: [],
          status: "pending",
          registrationNumber,
        });
      } else {
        throw new Error(result.message || "Checkout failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cart.items.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>
          <FiShoppingCart /> Your Book Cart
        </h2>
        <div className="cart-summary">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in cart
          {cart.status && (
            <span className={`status-badge ${cart.status}`}>
              Status: {cart.status}
            </span>
          )}
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          {cart.status === "confirmed" ? (
            <>
              <p>Your order has been confirmed!</p>
              <p>Registration: {cart.registrationNumber}</p>
            </>
          ) : cart.status === "pending" ? (
            <>
              <p>Your request is pending approval</p>
              <p>Registration: {cart.registrationNumber}</p>
            </>
          ) : (
            <>
              <p>Your cart is empty</p>
              <p>Browse books and add them to your cart</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h3>{item.title}</h3>
                  <p>by {item.author}</p>
                  <p>ISBN: {item.isbn}</p>
                  <p>Section: {item.section}</p>
                  <p>Quantity: {item.quantity || 1}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  <FiTrash2 /> Remove
                </button>
              </div>
            ))}
          </div>

          <div className="checkout-section">
            <div className="form-group">
              <label htmlFor="regNumber">Registration Number</label>
              <input
                type="text"
                id="regNumber"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="Enter your registration number"
                required
              />
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cart.items.length === 0}
              className="checkout-btn"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <FiCheckCircle /> Checkout
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
