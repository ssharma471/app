import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

const FAQPage = () => {
  const [openItem, setOpenItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Orders & Shipping',
      questions: [
        {
          q: 'How long does shipping take?',
          a: 'Standard shipping within Canada takes 5-7 business days. We ship from Toronto using Canada Post. You will receive a tracking number once your order ships.'
        },
        {
          q: 'Do you offer free shipping?',
          a: 'Yes! We offer free standard shipping on all orders over $75 CAD within Canada.'
        },
        {
          q: 'Can I track my order?',
          a: 'Absolutely! Once your order ships, you will receive an email with your tracking number and a link to track your package.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Currently, we only ship within Canada. We are working on expanding our shipping to other countries. Sign up for our newsletter to be notified when international shipping becomes available.'
        }
      ]
    },
    {
      category: 'Returns & Exchanges',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return policy for unused items in their original packaging. To initiate a return, please contact us at hello@beautivra.com with your order number.'
        },
        {
          q: 'Can I exchange an item?',
          a: 'Yes! If you would like to exchange an item for a different variant or product, please contact us within 30 days of receiving your order. We will provide instructions for the exchange process.'
        },
        {
          q: 'How do I return a damaged item?',
          a: 'If you receive a damaged item, please contact us immediately at hello@beautivra.com with photos of the damage. We will arrange for a replacement or refund at no additional cost to you.'
        }
      ]
    },
    {
      category: 'Products',
      questions: [
        {
          q: 'Are your jade and rose quartz products authentic?',
          a: 'Yes, absolutely! We source our jade from Xiuyan, China—known as the jade capital of the world—and our rose quartz from reputable suppliers who provide certification of authenticity. Each stone is natural and unique.'
        },
        {
          q: 'How do I clean my beauty tools?',
          a: 'For stone tools (gua sha, face rollers), wipe with a soft, damp cloth after each use. Do not use harsh chemicals or submerge in water. For our ice rollers and metal tools, wash with mild soap and water, then dry thoroughly.'
        },
        {
          q: 'How often should I use face rollers or gua sha?',
          a: 'For best results, we recommend using your tools daily as part of your morning or evening skincare routine. Even just 5 minutes a day can make a noticeable difference in your skin\'s appearance.'
        },
        {
          q: 'Can I use the ice roller on sensitive skin?',
          a: 'Yes! Our ice roller is gentle enough for sensitive skin. We recommend starting with shorter sessions (2-3 minutes) to see how your skin responds. Always avoid rolling over active breakouts or irritated areas.'
        }
      ]
    },
    {
      category: 'Payment & Security',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, Mastercard, American Express) as well as Apple Pay and Google Pay through our secure Stripe checkout.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Absolutely! We use Stripe for payment processing, which is PCI Level 1 certified—the highest level of security certification. We never store your credit card information on our servers.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="faq-page">
      {/* Header */}
      <section className="bg-brand-secondary py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-4xl md:text-5xl text-brand-dark mb-4">
              Frequently Asked Questions
            </h1>
            <p className="font-body text-brand-dark/60 max-w-xl mx-auto mb-8">
              Find answers to common questions about our products, shipping, and policies.
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={20} />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3"
                data-testid="faq-search"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-brand-dark/60">No questions match your search.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredFaqs.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <h2 className="font-heading text-xl text-brand-dark mb-6">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((item, qIndex) => {
                    const itemKey = `${catIndex}-${qIndex}`;
                    const isOpen = openItem === itemKey;
                    
                    return (
                      <div
                        key={itemKey}
                        className="border-b border-brand-dark/10"
                      >
                        <button
                          onClick={() => setOpenItem(isOpen ? null : itemKey)}
                          className="w-full flex justify-between items-center py-4 text-left"
                          data-testid={`faq-item-${catIndex}-${qIndex}`}
                        >
                          <span className="font-body font-medium text-brand-dark pr-8">
                            {item.q}
                          </span>
                          <ChevronDown
                            className={`flex-shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            size={20}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="font-body text-brand-dark/70 pb-4">
                                {item.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-8 bg-brand-secondary"
        >
          <h3 className="font-heading text-xl text-brand-dark mb-2">
            Still have questions?
          </h3>
          <p className="font-body text-brand-dark/60 mb-4">
            We're here to help. Reach out to our support team.
          </p>
          <a
            href="/contact"
            className="inline-block btn-primary px-6 py-2 bg-brand-dark text-white"
            data-testid="contact-btn"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;
