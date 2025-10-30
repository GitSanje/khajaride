
import React, {  useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Utensils, 
  ShoppingBag,
  Eye,
  MapPin
} from 'lucide-react';

import { useGetOrdersByUserId } from '@/api/hooks/use-order-query';
import type { PopulatedUserOrder } from '@khajaride/zod';



const UserOrders: React.FC = () => {
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  

  const { data:orders, isPending} = useGetOrdersByUserId({ })


  const getStatusIcon = (status: string) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (status) {
      case 'pending':
        return <Clock {...iconProps} />;
      case 'accepted':
      case 'preparing':
        return <Utensils {...iconProps} />;
      case 'ready_for_pickup':
      case 'assigned':
      case 'picked_up':
        return <Truck {...iconProps} />;
      case 'delivered':
        return <CheckCircle {...iconProps} />;
      case 'cancelled':
      case 'failed':
        return <XCircle {...iconProps} />;
      default:
        return <ShoppingBag {...iconProps} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready_for_pickup':
      case 'assigned':
      case 'picked_up':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFulfillmentText = (order: PopulatedUserOrder) => {
    return order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup';
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-lg shadow p-6 mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your food orders</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'accepted', 'preparing', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {status === 'all' ? 'All Orders' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders?.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {selectedStatus === 'all' 
                  ? "You haven't placed any orders yet."
                  : `No orders with status "${selectedStatus}" found.`
                }
              </p>
              {selectedStatus !== 'all' && (
                <button
                  onClick={() => setSelectedStatus('all')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all orders
                </button>
              )}
            </div>
          ) : (
            orders?.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.vendor.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status!)}`}>
                          {getStatusIcon(order.status!)}
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Order #{order.id} • {formatDate(order.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                      <Link
                        to={`/orders/${order.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Items List */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                      <div className="space-y-3">
                        {order.orderItems.map((item) => (
                          <div key={item.orderItem.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                {
                                  <Utensils className="w-5 h-5 text-gray-400" />
                                }
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.menuItem.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.orderItem.quantity} × NPR {item.orderItem.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium">
                              NPR {item.orderItem.subtotal}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>NPR {order.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Charge:</span>
                          <span>NPR {order.deliveryCharge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT:</span>
                          <span>NPR {order.vat}</span>
                        </div>
                        {order.vendorDiscount &&  order.vendorDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>- NPR {order.vendorDiscount}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>NPR {order.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Fulfillment Info */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          {order.fulfillmentType === 'delivery' ? (
                            <>
                              <MapPin className="w-4 h-4" />
                              <span>
                                {order.deliveryAddressId 
                                  ? `Delivery to ${order.deliveryAddress.detailAddressDirection},`
                                  : 'Delivery address not specified'
                                }
                              </span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span>Pickup from restaurant</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getFulfillmentText(order as PopulatedUserOrder)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrders;