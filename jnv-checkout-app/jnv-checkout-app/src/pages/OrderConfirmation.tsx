import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function OrderConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Order Successful!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We will contact you shortly with more details.
          </p>
        </div>

        <button 
          onClick={() => window.location.href = "https://jnvspectra.com"}
          className="w-full max-w-xs mx-auto flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
} 