import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import CartDrawer from './CartDrawer';

const Header = () => {
  const location = useLocation();
  const { itemCount, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-header shadow-sm' : 'bg-transparent'
      }`}
      data-testid="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link 
            to="/" 
            className="font-heading text-xl md:text-2xl tracking-tight"
            data-testid="logo-link"
          >
            Beautivra
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-sm tracking-wide transition-colors duration-200 ${
                  isActive(link.path) 
                    ? 'text-brand-dark' 
                    : 'text-brand-dark/60 hover:text-brand-dark'
                }`}
                data-testid={`nav-link-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-brand-dark/60 hover:text-brand-dark transition-colors"
              data-testid="search-btn"
            >
              <Search size={20} />
            </button>
            
            <Sheet>
              <SheetTrigger asChild>
                <button 
                  className="p-2 relative text-brand-dark/60 hover:text-brand-dark transition-colors"
                  onClick={() => setIsOpen(true)}
                  data-testid="cart-btn"
                >
                  <ShoppingBag size={20} />
                  {itemCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 bg-brand-dark text-white text-xs rounded-full flex items-center justify-center"
                      data-testid="cart-count"
                    >
                      {itemCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <CartDrawer />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t" data-testid="mobile-menu">
          <nav className="flex flex-col py-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-6 py-3 font-body text-sm tracking-wide ${
                  isActive(link.path) 
                    ? 'text-brand-dark bg-brand-secondary' 
                    : 'text-brand-dark/60'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-nav-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
