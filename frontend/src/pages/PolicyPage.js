import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const policies = {
  shipping: {
    title: 'Shipping Policy',
    content: `
## Shipping Information

At Beautivra, we want to ensure your self-care essentials reach you quickly and safely. Here's everything you need to know about our shipping.

### Shipping Destinations
We currently ship within Canada only. We're working on expanding to international destinations soon.

### Shipping Rates
- **Standard Shipping**: $9.95 CAD (5-7 business days)
- **Free Shipping**: On orders over $75 CAD

### Processing Time
Orders are processed within 1-2 business days. You will receive a confirmation email with tracking information once your order ships.

### Tracking Your Order
Once your order ships, you'll receive an email with a Canada Post tracking number. You can track your package at canadapost.ca or through the link provided in your shipping confirmation email.

### Delivery Issues
If your package is delayed, lost, or damaged during transit, please contact us at hello@beautivra.com with your order number. We'll work with the carrier to resolve the issue or send a replacement.

### P.O. Boxes
Yes, we can ship to P.O. Boxes within Canada.

### Address Changes
If you need to change your shipping address after placing an order, please contact us immediately. We can only update addresses before the order has shipped.
    `
  },
  returns: {
    title: 'Return Policy',
    content: `
## Returns & Exchanges

Your satisfaction is our priority. If you're not completely happy with your purchase, we're here to help.

### Return Window
You have 30 days from the date of delivery to return unused items in their original packaging.

### Eligibility
- Items must be unused and in original packaging
- Items must be in resalable condition
- Sale items are final sale and cannot be returned

### How to Initiate a Return
1. Email us at hello@beautivra.com with your order number
2. Include the reason for your return
3. We'll provide a return authorization and shipping instructions
4. Ship the item back to us

### Refunds
Once we receive and inspect your return, we'll process your refund within 5-7 business days. Refunds will be credited to your original payment method.

### Return Shipping Costs
- **Defective/Wrong Items**: We cover return shipping
- **Change of Mind**: Customer pays return shipping

### Exchanges
Want to exchange for a different variant or product? Contact us and we'll arrange the exchange. You'll only pay the difference in price (if applicable) plus any shipping costs.

### Damaged Items
If you receive a damaged item, please contact us within 48 hours with photos. We'll send a replacement at no cost to you.

### Warranty
All Beautivra products come with a 1-year warranty against manufacturing defects.
    `
  },
  privacy: {
    title: 'Privacy Policy',
    content: `
## Privacy Policy

At Beautivra, we respect your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.

### Information We Collect
- **Personal Information**: Name, email, phone number, shipping address when you place an order
- **Payment Information**: Processed securely through Stripe; we never store your credit card details
- **Usage Data**: Website browsing behavior, pages visited, and products viewed

### How We Use Your Information
- Process and fulfill your orders
- Send order confirmations and shipping updates
- Respond to customer service inquiries
- Send marketing emails (with your consent)
- Improve our website and products

### Information Sharing
We do not sell your personal information. We share data only with:
- **Stripe**: For secure payment processing
- **Canada Post**: For order fulfillment
- **Email Service Provider**: For order communications

### Cookies
We use cookies to enhance your browsing experience, remember your preferences, and analyze website traffic. You can disable cookies in your browser settings.

### Your Rights
You have the right to:
- Access your personal data
- Correct inaccurate information
- Request deletion of your data
- Unsubscribe from marketing emails

### Data Security
We implement industry-standard security measures to protect your information, including SSL encryption and secure payment processing.

### Contact Us
For privacy-related questions, contact us at hello@beautivra.com.

### Updates
We may update this policy periodically. Check this page for the latest version.

*Last updated: ${new Date().toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}*
    `
  }
};

const PolicyPage = () => {
  const { type } = useParams();
  const policy = policies[type];

  if (!policy) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-brand-dark mb-4">Policy not found</h1>
          <Link to="/" className="font-body text-brand-dark/60 hover:text-brand-dark">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  // Simple markdown-like rendering
  const renderContent = (content) => {
    const lines = content.trim().split('\n');
    const elements = [];
    let currentList = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('## ')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc list-inside space-y-2 mb-6 font-body text-brand-dark/70">
              {currentList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h2 key={index} className="font-heading text-2xl text-brand-dark mt-8 mb-4">
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc list-inside space-y-2 mb-6 font-body text-brand-dark/70">
              {currentList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h3 key={index} className="font-heading text-xl text-brand-dark mt-6 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('- ')) {
        currentList.push(trimmed.replace('- ', ''));
      } else if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc list-inside space-y-2 mb-6 font-body text-brand-dark/70">
              {currentList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <p key={index} className="font-body text-sm text-brand-dark/50 italic mt-8">
            {trimmed.replace(/\*/g, '')}
          </p>
        );
      } else if (trimmed) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc list-inside space-y-2 mb-6 font-body text-brand-dark/70">
              {currentList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <p key={index} className="font-body text-brand-dark/70 mb-4 leading-relaxed">
            {trimmed}
          </p>
        );
      }
    });
    
    if (currentList.length > 0) {
      elements.push(
        <ul key="list-final" className="list-disc list-inside space-y-2 mb-6 font-body text-brand-dark/70">
          {currentList.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    }
    
    return elements;
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="policy-page">
      {/* Header */}
      <section className="bg-brand-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 font-body text-sm text-brand-dark/60 hover:text-brand-dark mb-4">
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-5xl text-brand-dark"
          >
            {policy.title}
          </motion.h1>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderContent(policy.content)}
        </motion.div>
      </div>
    </div>
  );
};

export default PolicyPage;
