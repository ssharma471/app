import { motion } from 'framer-motion';
import { Heart, Leaf, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const AboutPage = () => {
  const values = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'We source only the finest materials, from authentic Xiuyan jade to medical-grade silicone.'
    },
    {
      icon: Heart,
      title: 'Self-Care First',
      description: 'We believe small daily rituals create big transformations. Every product is designed for everyday use.'
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'We minimize packaging and choose eco-friendly materials wherever possible.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join thousands who have elevated their daily routine with Beautivra.'
    }
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="about-page">
      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1573248303663-37d7a727a4bf"
          alt="Beauty tools"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl"
          >
            Our Story
          </motion.h1>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-brand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl text-brand-dark mb-6">
              Everyday Beauty, Elevated
            </h2>
            <p className="font-body text-lg text-brand-dark/70 leading-relaxed">
              Beautivra was born from a simple belief: self-care shouldn't feel like a chore. 
              We create modern, premium beauty tools that transform mundane routines into 
              moments of genuine luxury. Our products are designed with intention—minimal, 
              functional, and built to last.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl text-brand-dark">
              What We Stand For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <value.icon className="w-6 h-6 text-brand-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-xl text-brand-dark mb-2">
                  {value.title}
                </h3>
                <p className="font-body text-sm text-brand-dark/60">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl text-brand-dark mb-6">
                The Beautivra Difference
              </h2>
              <div className="space-y-4 font-body text-brand-dark/70">
                <p>
                  In a world of mass-produced beauty products, we take a different approach. 
                  Each Beautivra tool is thoughtfully designed, carefully sourced, and 
                  rigorously tested to ensure it meets our exacting standards.
                </p>
                <p>
                  We work directly with artisan manufacturers who share our commitment to 
                  quality. From the rose quartz in our gua sha tools to the stainless steel 
                  in our ice rollers, every material is chosen for its purity and performance.
                </p>
                <p>
                  Our products are more than tools—they're invitations to pause, breathe, 
                  and care for yourself. We believe that when your daily routine feels 
                  special, everything else falls into place.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="aspect-[4/5] overflow-hidden"
            >
              <img
                src="https://images.pexels.com/photos/7208722/pexels-photo-7208722.jpeg"
                alt="Woman using face roller"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-brand-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl mb-6">
            Start Your Ritual
          </h2>
          <p className="font-body text-white/70 mb-8">
            Discover the tools that will transform your daily routine.
          </p>
          <Link to="/shop">
            <Button className="bg-white text-brand-dark hover:bg-white/90 px-8 py-3" data-testid="shop-now-btn">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
