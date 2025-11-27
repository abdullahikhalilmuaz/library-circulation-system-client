import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiTrash2, FiCheckCircle, FiCheck, FiX, FiClock, FiMessageSquare } from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/cart.css";

export default function Cart() {
  const [cart, setCart] = useState({
    items: [],
    status: "active",
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
        console.log("Cart data:", data);
        setCart(data);
        if (data.registrationNumber) {
          setRegistrationNumber(data.registrationNumber);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
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
      
      if (!response.ok) {
        throw new Error("Failed to remove item");
      }
      
      const updatedCart = await response.json();
      setCart(updatedCart);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Remove error:", error);
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
          }),
        }
      );

      const result = await response.json();
      console.log("Checkout result:", result);
      
      if (response.ok) {
        toast.success(result.message);
        setCart(result.cart);
      } else {
        throw new Error(result.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getBookStatusBadge = (book) => {
    if (!book.status || book.status === "pending") {
      return (
        <span className="book-status pending">
          <FiClock /> Pending
        </span>
      );
    } else if (book.status === "approved") {
      return (
        <span className="book-status approved">
          <FiCheck /> Approved
        </span>
      );
    } else if (book.status === "rejected") {
      return (
        <span className="book-status rejected">
          <FiX /> Rejected
        </span>
      );
    }
  };

  const getOverallStatus = () => {
    const items = cart.items || [];
    if (items.length === 0) return "empty";
    
    const approvedCount = items.filter(item => item.status === "approved").length;
    const rejectedCount = items.filter(item => item.status === "rejected").length;
    const pendingCount = items.filter(item => !item.status || item.status === "pending").length;

    if (approvedCount === items.length) return "fully_approved";
    if (rejectedCount === items.length) return "fully_rejected";
    if (approvedCount > 0 || rejectedCount > 0) return "partially_processed";
    return "pending";
  };

  const getStatusMessage = () => {
    const overallStatus = getOverallStatus();
    const items = cart.items || [];
    
    switch (overallStatus) {
      case "fully_approved":
        return "All books have been approved!";
      case "fully_rejected":
        return "All books have been rejected.";
      case "partially_processed":
        const approved = items.filter(item => item.status === "approved").length;
        const rejected = items.filter(item => item.status === "rejected").length;
        const pending = items.filter(item => !item.status || item.status === "pending").length;
        return `${approved} approved, ${rejected} rejected, and ${pending} pending`;
      case "pending":
        return "Waiting for admin approval";
      default:
        return "Cart is empty";
    }
  };

  const totalItems = cart.items.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const canCheckout = cart.status === "active" && cart.items.length > 0;
  const canRemoveItems = cart.status === "active";

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>
          <FiShoppingCart /> Your Book Cart
        </h2>
        <div className="cart-summary">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in cart
          {cart.status && cart.status !== "active" && (
            <span className={`status-badge ${cart.status} ${getOverallStatus()}`}>
              Status: {cart.status} • {getStatusMessage()}
            </span>
          )}
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          {cart.status === "approved" || cart.status === "confirmed" ? (
            <>
              <FiCheckCircle className="success-icon" />
              <p>Your order has been confirmed!</p>
              <p>Registration: {cart.registrationNumber}</p>
            </>
          ) : cart.status === "pending" ? (
            <>
              <FiClock className="pending-icon" />
              <p>Your request is pending approval</p>
              <p>Registration: {cart.registrationNumber}</p>
            </>
          ) : cart.status === "rejected" ? (
            <>
              <FiX className="rejected-icon" />
              <p>Your request has been rejected</p>
              <p>Registration: {cart.registrationNumber}</p>
            </>
          ) : (
            <>
              <FiShoppingCart className="empty-icon" />
              <p>Your cart is empty</p>
              <p>Browse books and add them to your cart</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className={`cart-item ${item.status || 'pending'}`}>
                <div className="item-info">
                  <h3>{item.title}</h3>
                  <p className="book-author">by {item.author}</p>
                  <div className="book-details">
                    <span>ISBN: {item.isbn}</span>
                    <span>Section: {item.section}</span>
                    <span>Quantity: {item.quantity || 1}</span>
                  </div>
                  
                  <div className="book-status-section">
                    {getBookStatusBadge(item)}
                    {item.adminNotes && (
                      <div className="admin-notes">
                        <FiMessageSquare className="notes-icon" />
                        <div className="notes-content">
                          <strong>Admin Message:</strong>
                          <p>{item.adminNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            ))}
          </div>

          {canCheckout && (
            <div className="checkout-section">
              <div className="form-group">
                <label htmlFor="regNumber">Registration Number *</label>
                <input
                  type="text"
                  id="regNumber"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="Enter your registration number"
                  required
                />
              </div>

              <div className="checkout-info">
                <p>After checkout, your books will be reviewed by admin for approval.</p>
                <p>You'll be able to see individual approval status for each book.</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || !registrationNumber.trim()}
                className="checkout-btn"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <FiCheckCircle /> Loan
                  </>
                )}
              </button>
            </div>
          )}

          {(cart.status === "pending" || cart.status === "approved" || cart.status === "rejected" || cart.status === "partially_approved") && (
            <div className="pending-message">
              <FiClock className="pending-icon" />
              <div>
                <h4>
                  Request{" "}
                  {cart.status === "approved" 
                    ? "Approved" 
                    : cart.status === "rejected" 
                    ? "Rejected" 
                    : "Under Review"}
                </h4>
                <p>
                  {cart.status === "approved" 
                    ? "Your book request has been approved!" 
                    : cart.status === "rejected"
                    ? "Your book request has been rejected."
                    : "Your book request has been submitted and is waiting for admin approval."}
                </p>
                <p>Registration: {cart.registrationNumber}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}