import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement("script");
    script.id = 'razorpay-script';
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PremiumModal = ({ onClose, onSuccess }) => {
  const currentUser = useSelector((state) => state.currentuserreducer);
  const userId = currentUser?.result?._id;
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  const handlePay = async () => {
    if (!userId) {
      alert("You must be logged in to make a payment.");
      return;
    }

    try {
      const res = await axios.post("https://play-tube-clone.onrender.com/api/razorpay/pay", {
        amount: 100,
        userId,
      });

      if (res.data.success && res.data.order) {
        setRazorpayLoading(true);
        const loaded = await loadRazorpayScript();
        setRazorpayLoading(false);
        if (!loaded) {
          alert("Failed to load Razorpay SDK. Try again later.");
          return;
        }
        const order = res.data.order;
        const options = {
          key: process.env.REACT_APP_Razorpay_KEY,
          amount: order.amount,
          currency: order.currency,
          name: "Your-Tube Premium",
          description: "Unlock unlimited downloads",
          order_id: order.id,
          handler: async function (response) {
            alert("Payment successful! You are now a premium user.");
            onSuccess();
          },
          prefill: {
            email: currentUser?.result?.email,
          },
          notes: {
            userId: userId,
          },
          theme: {
            color: "#3399cc",
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      alert("Failed to initiate payment. Try again later.");
    } catch (err) {
      console.error("Error during payment:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="premium-modal">
      <div className="modal-content">
        <h2>Go Premium</h2>
        <p>Pay ₹100 to unlock unlimited downloads.</p>
        <div className="premium_btns">
          <button className="pay-btn" onClick={handlePay} disabled={razorpayLoading}>
            {razorpayLoading ? "Loading..." : "Pay ₹100"}
          </button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
        <div className="premium-notes">
          <p>Note: This is a <b>Test Payment</b> and will not charge you any real money.</p>
          <p>Note: This payment gateway is for <b>Testing Purposes</b> only. On the next screen, <b>DO NOT USE</b> your Bank details, Credit Card details or UPI details. Instead use the test card details provided by Razorpay:</p>
          <ul>
            <li>Card Number: 5267 3181 8797 5449</li>
            <li>Expiry Date: Any future date</li>
            <li>CVV: Any random 3-digit number</li>
          </ul>
          <p>For more details, visit the <a href="https://razorpay.com/docs/payments/payments/test-card-details/" target="_blank" rel="noopener noreferrer">Razorpay Test Card Numbers</a> page.</p>
          <p>Note: On the payment page, you may be asked to enter your phone number, you will have to enter a valid phone number, but you will not receive any OTP or confirmation message or be charged any money. This is just a test payment flow to demonstrate the premium feature of this application.</p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;