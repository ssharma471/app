import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/contact`, formData);
      toast.success(response.data.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'hello@beautivra.com',
      subtext: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: 'Location',
      content: 'Toronto, Canada',
      subtext: 'Ships across Canada'
    },
    {
      icon: Clock,
      title: 'Hours',
      content: 'Mon - Fri: 9AM - 6PM EST',
      subtext: 'Customer support hours'
    }
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="contact-page">
      {/* Header */}
      <section className="bg-brand-secondary py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-4xl md:text-5xl text-brand-dark mb-4">
              Get in Touch
            </h1>
            <p className="font-body text-brand-dark/60 max-w-xl mx-auto">
              Have a question about your order, our products, or just want to say hello? 
              We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 bg-brand-secondary flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-brand-dark" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-body font-medium text-brand-dark">{item.title}</h3>
                  <p className="font-body text-brand-dark mt-1">{item.content}</p>
                  <p className="font-body text-sm text-brand-dark/50">{item.subtext}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6 bg-white p-8 border border-brand-dark/10"
              data-testid="contact-form"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="font-body text-sm">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Your name"
                    data-testid="contact-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="font-body text-sm">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="your@email.com"
                    data-testid="contact-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="font-body text-sm">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="What's this about?"
                  data-testid="contact-subject"
                />
              </div>

              <div>
                <Label htmlFor="message" className="font-body text-sm">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 min-h-[150px]"
                  placeholder="Tell us more..."
                  data-testid="contact-message"
                />
              </div>

              <Button 
                type="submit" 
                className="btn-primary flex items-center gap-2"
                disabled={loading}
                data-testid="contact-submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </Button>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
