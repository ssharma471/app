import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/newsletter`, { email });
      toast.success(response.data.message);
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const footerLinks = {
    shop: [
      { name: 'All Products', path: '/shop' },
      { name: 'Face Rollers', path: '/shop?category=face-rollers' },
      { name: 'Gua Sha', path: '/shop?category=gua-sha' },
      { name: 'Ice Rollers', path: '/shop?category=ice-rollers' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
    ],
    policies: [
      { name: 'Shipping Policy', path: '/policies/shipping' },
      { name: 'Return Policy', path: '/policies/returns' },
      { name: 'Privacy Policy', path: '/policies/privacy' },
    ],
  };

  return (
    <footer className="bg-brand-dark text-white/90" data-testid="main-footer">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-heading text-2xl md:text-3xl text-white mb-3">
              Join the Ritual
            </h3>
            <p className="text-white/60 mb-6 font-body text-sm">
              Subscribe for exclusive offers, skincare tips, and early access to new arrivals.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-3" data-testid="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold font-body text-sm"
                data-testid="newsletter-email"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-white text-brand-dark font-body text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                data-testid="newsletter-submit"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-heading text-2xl text-white" data-testid="footer-logo">
              Beautivra
            </Link>
            <p className="mt-4 text-white/50 text-sm font-body leading-relaxed">
              Everyday Beauty, Elevated.<br />
              Premium self-care tools for your daily ritual.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/50 hover:text-brand-gold transition-colors"
                data-testid="social-instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="mailto:hello@beautivra.com"
                className="text-white/50 hover:text-brand-gold transition-colors"
                data-testid="social-email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-body text-sm font-medium text-white mb-4 uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-white/50 hover:text-white text-sm font-body transition-colors"
                    data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-body text-sm font-medium text-white mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-white/50 hover:text-white text-sm font-body transition-colors"
                    data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies Links */}
          <div>
            <h4 className="font-body text-sm font-medium text-white mb-4 uppercase tracking-wider">
              Policies
            </h4>
            <ul className="space-y-3">
              {footerLinks.policies.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-white/50 hover:text-white text-sm font-body transition-colors"
                    data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs font-body">
            © {new Date().getFullYear()} Beautivra. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white/40 text-xs font-body">
            <MapPin size={14} />
            <span>Ships across Canada</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
