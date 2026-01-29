import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

const Plan = () => {
  const { isPremium } = useAuth();

  const upgrade = async () => {
    try {
      const { data } = await api.post("/billing/create-checkout-session");
      window.location.href = data.url;
    } catch (err) {
      alert("Unable to start checkout");
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-24 text-center">
      <h2 className="text-4xl font-semibold">Choose your plan</h2>

      <div className="mt-10 p-6 border rounded-xl">
        <h3 className="text-xl font-semibold">Premium Plan</h3>
        <p className="text-gray-500 mt-2">
          Unlimited access to all AI tools
        </p>
        <p className="text-2xl font-bold mt-4">18 $ Yearly</p>

        {isPremium ? (
          <button
            disabled
            className="mt-6 px-6 py-2 bg-gray-300 text-gray-600 rounded"
          >
            You are already Premium
          </button>
        ) : (
          <button
            onClick={upgrade}
            className="mt-6 px-6 py-2 bg-primary text-white rounded cursor-pointer"
          >
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  );
};

export default Plan;

