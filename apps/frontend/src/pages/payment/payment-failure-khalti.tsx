
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, RotateCcw, Home, Phone } from 'lucide-react';

const PaymentFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const paymentData = {
    transactionId: searchParams.get('tidx') || searchParams.get('transaction_id'),
    purchaseOrderId: searchParams.get('purchase_order_id'),
    amount: searchParams.get('amount'),
    status: searchParams.get('status'),
    mobile: searchParams.get('mobile')
  };

  const retryPayment = () => {
    // Implement retry payment logic
    const orderId = paymentData.purchaseOrderId;
    if (orderId) {
      // Redirect to payment page with order ID
      window.location.href = `/payment/retry/${orderId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Failure Header */}
        <div className="bg-red-500 px-6 py-8 text-center">
          <XCircle className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
          <p className="text-red-100 mt-2">
            We couldn't process your payment
          </p>
        </div>

        {/* Error Details */}
        <div className="px-6 py-6">
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4">
              Payment Details
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-red-700">Order ID:</span>
                <span className="font-medium">{paymentData.purchaseOrderId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-red-700">Amount:</span>
                <span className="font-medium">NPR {paymentData.amount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-red-700">Status:</span>
                <span className="font-medium text-red-600 capitalize">
                  {paymentData.status?.toLowerCase() || 'failed'}
                </span>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">
              What could be wrong?
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Insufficient funds in your account</li>
              <li>• Incorrect card details entered</li>
              <li>• Network connectivity issues</li>
              <li>• Bank server temporarily unavailable</li>
            </ul>
          </div>

          {/* Support Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Need help?</span>
            </div>
            <p className="text-sm text-gray-600">
              Contact our support team at <strong>98XXXXX904</strong> or email support@example.com
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={retryPayment}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Retry Payment
            </button>
            
            <Link
              to="/cart"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back to Cart
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

export default PaymentFailure;