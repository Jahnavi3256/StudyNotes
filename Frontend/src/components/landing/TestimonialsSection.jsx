import React from 'react';
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya M.",
    role: "Medical Student",
    text: "StudySync transformed how our anatomy group prepares for exams. The AI summaries alone saved us hours every week.",
    rating: 5,
  },
  {
    name: "James L.",
    role: "Computer Science Major",
    text: "Real-time collaboration is seamless. It feels like Google Docs but purpose-built for studying. Huge difference.",
    rating: 5,
  },
  {
    name: "Ananya S.",
    role: "UPSC Aspirant",
    text: "The private notes + group notes combo is perfect for competitive exam prep. I can share what I want and keep the rest.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-xs md:text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-2 md:mb-3">Testimonials</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Loved by students everywhere
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-background rounded-2xl border border-border p-5 md:p-6"
            >
              <div className="flex gap-1 mb-3 md:mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-foreground text-foreground" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 md:mb-6">"{t.text}"</p>
              <div>
                <p className="font-display font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
