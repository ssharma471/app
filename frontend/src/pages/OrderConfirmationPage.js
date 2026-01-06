import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Loader2, XCircle } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [pollingCount, setPollingCount] = useState(0);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const checkPaymentAndFetchOrder = async () => {
      if (!sessionId) {
        setLoading(false);
        setPaymentStatus('error');
        return;
      }

      try {
        // Poll for payment status
        const statusRes = await axios.get(`${API}/checkout/status/${sessionId}`);
        
        if (statusRes.data.payment_status === 'paid') {
          setPaymentStatus('success');
          clearCart();
          localStorage.removeItem('beautivra-pending-order');
          
          // Fetch order details
          const pendingOrder = JSON.parse(localStorage.getItem('beautivra-pending-order') || '{}');
          if (pendingOrder.order_id) {
            const orderRes = await axios.get(`${API}/orders/${pendingOrder.order_id}`);
            setOrder(orderRes.data);
          } else if (statusRes.data.metadata?.order_id) {
            const orderRes = await axios.get(`${API}/orders/${statusRes.data.metadata.order_id}`);
            setOrder(orderRes.data);
          }
          setLoading(false);
        } else if (statusRes.data.status === 'expired') {
          setPaymentStatus('expired');
          setLoading(false);
        } else {
          // Continue polling
          if (pollingCount < 5) {
            setPollingCount(prev => prev + 1);
            setTimeout(checkPaymentAndFetchOrder, 2000);
          } else {
            setPaymentStatus('pending');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error checking payment:', error);
        if (pollingCount < 3) {
          setPollingCount(prev => prev + 1);
          setTimeout(checkPaymentAndFetchOrder, 2000);
        } else {
          setPaymentStatus('error');
          setLoading(false);
        }
      }
    };

    checkPaymentAndFetchOrder();
  }, [sessionId, clearCart, pollingCount]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 flex items-center justify-center" data-testid="order-confirmation-loading">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-gold mx-auto mb-4" />
          <p className="font-body text-brand-dark/60">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error' || paymentStatus === 'expired') {
    return (
      <div className="min-h-screen pt-20 md:pt-24 flex items-center justify-center" data-testid="order-confirmation-error">
        <div className="text-center max-w-md px-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="font-heading text-2xl text-brand-dark mb-2">
            {paymentStatus === 'expired' ? 'Session Expired' : 'Payment Error'}
          </h1>
          <p className="font-body text-brand-dark/60 mb-6">
            {paymentStatus === 'expired' 
              ? 'Your payment session has expired. Please try again.'
              : 'Something went wrong with your payment. Please try again.'}
          </p>
          <Link to="/cart">
            <Button className="btn-primary">Return to Cart</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-brand" data-testid="order-confirmation-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-brand-dark mb-3">
            Thank You for Your Order!
          </h1>
          <p className="font-body text-brand-dark/60">
            We've received your order and will begin processing it shortly.
          </p>
        </motion.div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-brand-dark/10 p-6 md:p-8"
          >
            {/* Order Number */}
            <div className="text-center pb-6 border-b border-brand-dark/10">
              <p className="font-body text-sm text-brand-dark/60 mb-1">Order Number</p>
              <p className="font-heading text-xl text-brand-dark" data-testid="order-number">
                {order.order_number}
              </p>
            </div>

            {/* Order Timeline */}
            <div className="py-8 border-b border-brand-dark/10">
              <div className="flex justify-between items-center max-w-sm mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-body text-xs mt-2 text-brand-dark/60">Confirmed</span>
                </div>
                <div className="flex-1 h-0.5 bg-brand-dark/10 mx-4" />
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-brand-secondary rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-brand-dark/40" />
                  </div>
                  <span className="font-body text-xs mt-2 text-brand-dark/40">Processing</span>
                </div>
                <div className="flex-1 h-0.5 bg-brand-dark/10 mx-4" />
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-brand-secondary rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-brand-dark/40" />
                  </div>
                  <span className="font-body text-xs mt-2 text-brand-dark/40">Shipped</span>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="py-6 border-b border-brand-dark/10">
              <h3 className="font-body font-medium text-brand-dark mb-4">Order Details</h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between font-body text-sm">
                    <span className="text-brand-dark">
                      {item.product_name} {item.variant && `(${item.variant})`} × {item.quantity}
                    </span>
                    <span className="text-brand-dark">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-6 border-b border-brand-dark/10 space-y-2">
              <div className="flex justify-between font-body text-sm">
                <span className="text-brand-dark/60">Subtotal</span>
                <span className="text-brand-dark">${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-brand-dark/60">Shipping</span>
                <span className="text-brand-dark">
                  {order.shipping_cost === 0 ? 'Free' : `$${order.shipping_cost?.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-brand-dark/60">Tax</span>
                <span className="text-brand-dark">${order.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brand-dark/10">
                <span className="font-body font-medium text-brand-dark">Total</span>
                <span className="font-body text-lg font-medium text-brand-dark">
                  ${order.total?.toFixed(2)} CAD
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="pt-6">
              <h3 className="font-body font-medium text-brand-dark mb-2">Shipping To</h3>
              <address className="font-body text-sm text-brand-dark/70 not-italic">
                {order.shipping_address?.first_name} {order.shipping_address?.last_name}<br />
                {order.shipping_address?.address}<br />
                {order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.postal_code}<br />
                {order.shipping_address?.country}
              </address>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/shop">
            <Button className="btn-primary" data-testid="continue-shopping-btn">
              Continue Shopping
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-center font-body text-sm text-brand-dark/50">
          A confirmation email has been sent to {order?.shipping_address?.email || 'your email address'}.
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
