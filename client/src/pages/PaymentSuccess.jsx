import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { refreshUser, isPremium } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncPlan = async () => {
      try {
        await refreshUser(); // fetch /api/user/me
        setLoading(false);
      } catch (err) {
        setError("Failed to verify subscription status");
        setLoading(false);
      }
    };

    syncPlan();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Confirming your payment…</p>
          <p className="text-gray-500 mt-2">
            This may take a few seconds.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Something went wrong
          </h2>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            className="mt-6 px-6 py-2 bg-primary text-white rounded"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-semibold">
          Payment Successful 🎉
        </h1>

        <p className="text-gray-600 mt-4">
          Your subscription has been activated.
        </p>

        {isPremium && (
          <p className="mt-2 text-green-600 font-medium">
            Premium access unlocked
          </p>
        )}

        <button
          className="mt-8 px-6 py-3 bg-primary text-white rounded-lg"
          onClick={() => navigate("/ai")}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
