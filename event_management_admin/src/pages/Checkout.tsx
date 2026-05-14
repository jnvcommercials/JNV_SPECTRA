import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { fetchApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/images/logo.png';

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
  const { toast } = useToast();
  const [paymentType, setPaymentType] = useState<PaymentType>('deposit');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isBalanceMode = searchParams.get('type') === 'balance';

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await fetchApi(`/api/v1/orders/${orderId}`);
      return response.data as Order;
    }
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
        // In balance mode, only redirect if balance is paid
        if (order.balance_paid_at) {
          navigate(`/orders/${order.id}`);
        }
      } else {
        // In normal mode, redirect if order is confirmed or paid
        if (order.order_status === 'confirmed' || order.order_status === 'paid') {
          navigate(`/orders/${order.id}`);
        }
      }
    }
  }, [order, navigate, isBalanceMode]);

  const handlePaymentLinkGeneration = async () => {
    if (!orderId) {
      toast({
        title: 'Error',
        description: 'Order ID is missing.',
        variant: 'destructive'
      });
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
        // Store the payment link in the order
        if (isBalanceMode) {
          await fetchApi(`/api/v1/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({
              balance_payment_link: paymentLink
            })
          });
        }
        window.open(paymentLink, '_blank');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate payment link',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load order details. Please try again later.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Return Home
            </Button>
          </CardContent>
        </Card>
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
          <Card className="shadow-none border border-gray-200">
            <CardContent className="p-6">
              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.order_details.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(order.order_details.tax)}</span>
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
                  <RadioGroup
                    value={paymentType}
                    onValueChange={(value) => setPaymentType(value as PaymentType)}
                    className="space-y-4"
                  >
                    <div className={`flex items-center px-4 py-3 rounded-md border cursor-pointer transition-colors ${paymentType === 'deposit' ? 'bg-[#F5F6FA] border-[#5B4FFF]' : 'bg-[#F5F6FA] border-transparent'}`}
                      onClick={() => setPaymentType('deposit')}
                    >
                      <RadioGroupItem value="deposit" id="deposit" />
                      <Label htmlFor="deposit" className="ml-3 font-medium cursor-pointer">
                        Deposit Payment - {formatCurrency(order.deposit_amount)}
                      </Label>
                    </div>
                    <div className={`flex items-center px-4 py-3 rounded-md border cursor-pointer transition-colors ${paymentType === 'full' ? 'bg-[#F5F6FA] border-[#5B4FFF]' : 'bg-[#F5F6FA] border-transparent'}`}
                      onClick={() => setPaymentType('full')}
                    >
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="ml-3 font-medium cursor-pointer">
                        Full Payment - {formatCurrency(order.total_amount)}
                      </Label>
                    </div>
                    <div className={`flex items-center px-4 py-3 rounded-md border cursor-pointer transition-colors ${paymentType === 'custom' ? 'bg-[#F5F6FA] border-[#5B4FFF]' : 'bg-[#F5F6FA] border-transparent'}`}
                      onClick={() => setPaymentType('custom')}
                    >
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="ml-3 font-medium cursor-pointer">
                        Other Amount
                      </Label>
                    </div>
                  </RadioGroup>
                )}
                {/* Custom Amount Input */}
                {!isBalanceMode && paymentType === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount" className="text-sm mb-1 block">Enter Amount</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      min={order.deposit_amount}
                      max={order.total_amount}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      disabled={paymentType !== 'custom'}
                      placeholder="Enter amount"
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum: {formatCurrency(order.deposit_amount)}</p>
                  </div>
                )}
              </div>

              {/* Payment Button */}
              <Button
                className="w-full mt-4 bg-[#5B4FFF] hover:bg-[#4739cc] text-white font-semibold text-base py-3 rounded-md"
                onClick={handlePaymentLinkGeneration}
                disabled={isGeneratingLink}
              >
                {isGeneratingLink ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Payment Link...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
            </CardContent>
          </Card>
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