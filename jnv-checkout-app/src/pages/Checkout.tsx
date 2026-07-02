import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { fetchApi } from '../lib/api';
import logo from '@/assets/logo.png';

// SVGs for payment icons
const VisaIcon = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="4" fill="#F5F6FA"/><text x="16" y="14" textAnchor="middle" fontSize="10" fill="#1A1F36" fontFamily="Arial">VISA</text></svg>
);
const MastercardIcon = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="4" fill="#F5F6FA"/><circle cx="13" cy="10" r="6" fill="#FF5F00"/><circle cx="19" cy="10" r="6" fill="#EB001B" fillOpacity="0.7"/><text x="16" y="16" textAnchor="middle" fontSize="7" fill="#1A1F36" fontFamily="Arial">MC</text></svg>
);
const PaypalIcon = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="4" fill="#F5F6FA"/><text x="16" y="14" textAnchor="middle" fontSize="10" fill="#1A1F36" fontFamily="Arial">PayPal</text></svg>
);

interface Order {
   id: string;
   customer_name: string;
   email: string;
   event_date: string;
   order_details: {
     items: Array<{
       name: string;
       price: number;
       quantity: number;
     }>;
     total: number;
     subtotal: number;
     tax: number;
     tax_percentage?: number;
     tax_amount?: number;
   };
   total_amount: number;
   deposit_amount: number;
   balance_amount: number;
   order_status: string;
   balance_paid_at?: string;
 }

type PaymentType = 'deposit' | 'full' | 'custom' | 'balance';

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState<PaymentType>('deposit');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isBalanceMode = searchParams.get('type') === 'balance';

  console.log('Order ID:', orderId); // Debug log

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      console.log('Fetching order details for:', orderId); // Debug log
      try {
        const response = await fetchApi(`/api/v1/orders/${orderId}`);
        console.log('Order response:', response); // Debug log
        return response.data as Order;
      } catch (error) {
        console.error('Error fetching order:', error); // Debug log
        throw error;
      }
    },
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retrying
  });

  // Update custom amount when payment type changes or in balance mode
  useEffect(() => {
    if (order) {
      if (isBalanceMode) {
        setPaymentType('balance');
        setCustomAmount(order.balance_amount);
      } else {
        switch (paymentType) {
          case 'deposit':
            setCustomAmount(order.deposit_amount);
            break;
          case 'full':
            setCustomAmount(order.total_amount);
            break;
          case 'custom':
            setCustomAmount(order.deposit_amount);
            break;
        }
      }
    }
  }, [paymentType, order, isBalanceMode]);

  useEffect(() => {
    if (order) {
      if (isBalanceMode) {
        if (order.balance_paid_at) {
          navigate('/order-confirmation');
        }
      } else {
        if (order.order_status === 'confirmed' || order.order_status === 'paid') {
          navigate('/order-confirmation');
        }
      }
    }
  }, [order, navigate, isBalanceMode]);

  const handlePaymentLinkGeneration = async () => {
    if (!orderId) {
      alert('Order ID is missing.');
      return;
    }
    try {
      setIsGeneratingLink(true);
      const payload = isBalanceMode
        ? { 
            paymentType: 'custom',
            customAmount: Number(order?.balance_amount)
          }
        : {
            paymentType,
            customAmount: paymentType === 'custom' ? customAmount : undefined
          };
      const response = await fetchApi(`/api/v1/orders/${orderId}/checkout/payment-link`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Use the payment_link from the response
      const paymentLink = response.data.payment_link;
      if (paymentLink) {
        // Store the payment link in the order using the new endpoint
        if (isBalanceMode) {
          await fetchApi(`/api/v1/orders/${orderId}/payment-link`, {
            method: 'PUT',
            body: JSON.stringify({
              payment_link: paymentLink,
              payment_type: 'balance'
            })
          });
        }
        window.open(paymentLink, '_blank');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate payment link');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFBFC]">
        <header className="w-full border-b bg-[#3d093d] h-16 flex items-center px-8">
          <img src="/logo.png" alt="JNV Spectra" className="h-14" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <footer className="w-full border-t bg-white py-6 mt-auto flex flex-col items-center">
          <div className="flex space-x-6 mb-2">
            <VisaIcon />
            <MastercardIcon />
            <PaypalIcon />
          </div>
          <p className="text-xs text-gray-400">© 2025 JNV Spectra. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFBFC]">
        <header className="w-full border-b bg-[#3d093d] h-16 flex items-center px-8">
          <img src="/logo.png" alt="JNV Spectra" className="h-14" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Error</h2>
            <p>Failed to load order details. Please try again later.</p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return Home
            </button>
          </div>
        </main>
        <footer className="w-full border-t bg-white py-6 mt-auto flex flex-col items-center">
          <div className="flex space-x-6 mb-2">
            <VisaIcon />
            <MastercardIcon />
            <PaypalIcon />
          </div>
          <p className="text-xs text-gray-400">© 2025 JNV Spectra. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFC]">
      {/* Header */}
      <header className="w-full border-b bg-[#3d093d] h-16 flex items-center px-8">
        <img src={logo} alt="JNV Spectra" className="h-14" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-8">
        <h1 className="text-3xl font-semibold text-center mt-8 mb-2">Checkout</h1>
        <p className="text-gray-500 text-center mb-8">Select your payment amount</p>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Order Summary */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.order_details.subtotal)}</span>
              </div>
               <div className="flex justify-between text-sm mb-2">
                 <span className="text-gray-600">Tax {order.order_details.tax_percentage ? `(${order.order_details.tax_percentage}%)` : ''}</span>
                 <span className="font-medium">{formatCurrency(order.order_details.tax_amount || order.order_details.tax)}</span>
               </div>
              <div className="flex justify-between text-base border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Options</h3>
              {isBalanceMode ? (
                <div className="flex items-center px-4 py-3 rounded-md border bg-[#F5F6FA] border-[#5B4FFF]">
                  <span className="inline-block w-4 h-4 rounded-full bg-[#5B4FFF] mr-3 border-2 border-[#5B4FFF]" />
                  <span className="font-medium">
                    Balance Payment ({formatCurrency(order.balance_amount)})
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    className={`flex items-center px-4 py-3 rounded-md border cursor-pointer transition-colors ${paymentType === 'deposit' ? 'bg-[#F5F6FA] border-[#5B4FFF]' : 'bg-[#F5F6FA] border-transparent'}`}
                    onClick={() => setPaymentType('deposit')}
                  >
                    <input
                      type="radio"
                      id="deposit"
                      name="paymentType"
                      value="deposit"
                      checked={paymentType === 'deposit'}
                      onChange={() => setPaymentType('deposit')}
                      className="mr-3"
                    />
                    <label htmlFor="deposit" className="font-medium cursor-pointer">
                      Deposit Payment - {formatCurrency(order.deposit_amount)}
                    </label>
                  </div>
                  <div 
                    className={`flex items-center px-4 py-3 rounded-md border cursor-pointer transition-colors ${paymentType === 'full' ? 'bg-[#F5F6FA] border-[#5B4FFF]' : 'bg-[#F5F6FA] border-transparent'}`}
                    onClick={() => setPaymentType('full')}
                  >
                    <input
                      type="radio"
                      id="full"
                      name="paymentType"
                      value="full"
                      checked={paymentType === 'full'}
                      onChange={() => setPaymentType('full')}
                      className="mr-3"
                    />
                    <label htmlFor="full" className="font-medium cursor-pointer">
                      Full Payment - {formatCurrency(order.total_amount)}
                    </label>
                  </div>
                  <div 
                    className={`flex items-center px-4 py-3 rounded-md border cursor-pointer transition-colors ${paymentType === 'custom' ? 'bg-[#F5F6FA] border-[#5B4FFF]' : 'bg-[#F5F6FA] border-transparent'}`}
                    onClick={() => setPaymentType('custom')}
                  >
                    <input
                      type="radio"
                      id="custom"
                      name="paymentType"
                      value="custom"
                      checked={paymentType === 'custom'}
                      onChange={() => setPaymentType('custom')}
                      className="mr-3"
                    />
                    <label htmlFor="custom" className="font-medium cursor-pointer">
                      Custom Amount
                    </label>
                  </div>
                  {paymentType === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        min={0}
                        max={order.total_amount}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Enter amount"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Proceed Button */}
            <button
              onClick={handlePaymentLinkGeneration}
              disabled={isGeneratingLink}
              className="w-full mt-6 px-4 py-3 bg-[#5B4FFF] text-white rounded-md hover:bg-[#4A3FE0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingLink ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Generating Payment Link...
                </span>
              ) : (
                'Proceed to Checkout'
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white py-6 mt-auto flex flex-col items-center">
        <div className="flex space-x-6 mb-2">
          <VisaIcon />
          <MastercardIcon />
          <PaypalIcon />
        </div>
        <p className="text-xs text-gray-400">© 2025 JNV Spectra. All rights reserved.</p>
      </footer>
    </div>
  );
} 