// components/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Home, ShoppingBag } from 'lucide-react';

interface PaymentSuccessProps {
  orderData?: any;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ orderData }) => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(orderData);
  
  // Extract payment parameters from URL
  const paymentData = {
    transactionId: searchParams.get('tidx') || searchParams.get('transaction_id'),
    purchaseOrderId: searchParams.get('purchase_order_id'),
    amount: searchParams.get('amount'),
    status: searchParams.get('status'),
    mobile: searchParams.get('mobile')
  };

  useEffect(() => {
    // If no order data passed as prop, fetch order details
    if (!orderData && paymentData.purchaseOrderId) {
      fetchOrderDetails(paymentData.purchaseOrderId);
    }
  }, [paymentData.purchaseOrderId, orderData]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const orderDetails = await response.json();
      setOrder(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const downloadReceipt = () => {
    // Implement receipt download logic
    const receiptData = {
      ...paymentData,
      order,
      date: new Date().toLocaleDateString()
    };
    console.log('Download receipt:', receiptData);
    // Generate PDF or receipt
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-green-500 px-6 py-8 text-center">
          <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
          <p className="text-green-100 mt-2">
            Thank you for your order
          </p>
        </div>

        {/* Order Details */}
        <div className="px-6 py-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{order?.id || paymentData.purchaseOrderId}</span>
              </div>
            
              
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-green-600">
                  NPR {paymentData.amount}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600 capitalize">
                  {paymentData.status?.toLowerCase()}
                </span>
              </div>
              
              {order?.vendor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-medium">{order.vendor.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll receive order confirmation via SMS</li>
              <li>• Vendor will start preparing your order</li>
              <li>• Track your order in real-time</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={downloadReceipt}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>
            
            <Link
              to="/orders"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              View My Orders
            </Link>
            
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;