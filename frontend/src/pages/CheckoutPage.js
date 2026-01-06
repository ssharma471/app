import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: 'ON',
    postal_code: '',
    country: 'Canada'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    const calculateTotals = async () => {
      try {
        const response = await axios.post(`${API}/calculate-shipping`, { items });
        setTotals(response.data);
      } catch (error) {
        console.error('Error calculating totals:', error);
      }
    };
    calculateTotals();
  }, [items, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProvinceChange = (value) => {
    setFormData(prev => ({ ...prev, province: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.postal_code) newErrors.postal_code = 'Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/checkout`, {
        items,
        shipping_address: formData,
        origin_url: window.location.origin
      });

      // Redirect to Stripe checkout
      if (response.data.checkout_url) {
        // Store order info for confirmation page
        localStorage.setItem('beautivra-pending-order', JSON.stringify({
          order_id: response.data.order_id,
          order_number: response.data.order_number,
          session_id: response.data.session_id
        }));
        
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-brand" data-testid="checkout-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link to="/cart" className="inline-flex items-center gap-2 font-body text-sm text-brand-dark/60 hover:text-brand-dark mb-8">
          <ArrowLeft size={16} />
          Back to bag
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Checkout Form */}
          <div>
            <h1 className="font-heading text-3xl text-brand-dark mb-8">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact */}
              <div>
                <h2 className="font-body font-medium text-brand-dark mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="font-body text-sm">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="your@email.com"
                      data-testid="checkout-email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="font-body text-sm">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="(416) 555-0123"
                      data-testid="checkout-phone"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h2 className="font-body font-medium text-brand-dark mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name" className="font-body text-sm">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`mt-1 ${errors.first_name ? 'border-red-500' : ''}`}
                        data-testid="checkout-first-name"
                      />
                      {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="last_name" className="font-body text-sm">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`mt-1 ${errors.last_name ? 'border-red-500' : ''}`}
                        data-testid="checkout-last-name"
                      />
                      {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="font-body text-sm">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`mt-1 ${errors.address ? 'border-red-500' : ''}`}
                      placeholder="123 Main Street, Apt 4"
                      data-testid="checkout-address"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="font-body text-sm">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`mt-1 ${errors.city ? 'border-red-500' : ''}`}
                        data-testid="checkout-city"
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="province" className="font-body text-sm">Province</Label>
                      <Select value={formData.province} onValueChange={handleProvinceChange}>
                        <SelectTrigger className="mt-1" data-testid="checkout-province">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCES.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postal_code" className="font-body text-sm">Postal Code</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        className={`mt-1 ${errors.postal_code ? 'border-red-500' : ''}`}
                        placeholder="M5V 2K1"
                        data-testid="checkout-postal-code"
                      />
                      {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
                    </div>
                    <div>
                      <Label className="font-body text-sm">Country</Label>
                      <Input
                        value="Canada"
                        disabled
                        className="mt-1 bg-brand-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
                data-testid="place-order-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Processing...
                  </>
                ) : (
                  `Pay ${totals.total.toFixed(2)} CAD`
                )}
              </Button>

              <p className="font-body text-xs text-brand-dark/50 text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="bg-white p-6 border border-brand-dark/10">
              <h2 className="font-heading text-xl text-brand-dark mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 pb-6 border-b border-brand-dark/10">
                {items.map((item, index) => (
                  <div key={`${item.product_id}-${item.variant}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-brand-secondary flex-shrink-0 relative">
                      <img
                        src={item.product_image || 'https://images.pexels.com/photos/5928035/pexels-photo-5928035.jpeg'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-dark text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm text-brand-dark">{item.product_name}</p>
                      {item.variant && (
                        <p className="font-body text-xs text-brand-dark/50">{item.variant}</p>
                      )}
                    </div>
                    <p className="font-body text-sm text-brand-dark">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-brand-dark/60">Subtotal</span>
                  <span className="text-brand-dark">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-brand-dark/60">Shipping</span>
                  <span className="text-brand-dark">
                    {totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-brand-dark/60">HST (13%)</span>
                  <span className="text-brand-dark">${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-brand-dark/10">
                  <span className="font-body font-medium text-brand-dark">Total</span>
                  <span className="font-body text-xl font-medium text-brand-dark">
                    ${totals.total.toFixed(2)} CAD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
