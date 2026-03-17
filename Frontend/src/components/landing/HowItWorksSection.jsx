import React from 'react';
import { motion } from "framer-motion";
import { UserPlus, NotebookPen, Sparkles } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="w-7 h-7" />,
    step: "01",
    title: "Start solo or join a group",
    description: "Begin studying on your own or set up a study group in seconds. Invite classmates via link or email.",
  },
  {
    icon: <NotebookPen className="w-7 h-7" />,
    step: "02",
    title: "Collaborate on notes",
    description: "Write, edit, and organize notes together in real-time. Everyone stays in sync.",
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    step: "03",
    title: "Let AI accelerate learning",
    description: "Ask the AI chatbot to summarize, quiz you, or explain difficult concepts instantly.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how it works" className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-xs md:text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-2 md:mb-3">How it works</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Get started in 3 simple steps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <div className="mx-auto w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-foreground text-background flex items-center justify-center mb-4 md:mb-5 shadow-lg">
                {s.icon}
              </div>
              <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Step {s.step}</span>
              <h3 className="font-display font-semibold text-lg md:text-xl text-foreground mt-2 mb-2 md:mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
