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
    let timeoutId;
    const syncPlan = async () => {
      try {
        // Poll for up to 10 seconds to allow webhook to process
        let attempts = 0;
        let isUpdated = false;
        
        while (attempts < 10 && !isUpdated) {
          await refreshUser();
          
          // We need to wait for AuthContext to update the state, but we can also
          // just fetch manually to be absolutely sure without relying on context state delay
          const { data } = await api.get("/api/user/me");
          
          if (data && data.plan === 'premium') {
            await refreshUser(); // Final sync with context
            isUpdated = true;
            break;
          }
          
          await new Promise(r => setTimeout(r, 1000));
          attempts++;
        }
        
        if (!isUpdated) {
          setError("Payment confirmed, but your plan hasn't updated yet. Please refresh the page in a minute.");
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to verify subscription status");
        setLoading(false);
      }
    };

    syncPlan();
    
    return () => clearTimeout(timeoutId);
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
