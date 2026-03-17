import React from 'react';
import { motion } from "framer-motion";
import { Users, FileText, Brain, Wifi } from "lucide-react";

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Study Groups",
    description: "Create and manage groups for any subject. Invite classmates and organize collaborative study sessions.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Shared & Private Notes",
    description: "Write notes together or keep them personal. Rich editing with real-time sync across all your devices.",
  },
  {
    icon: <Wifi className="w-6 h-6" />,
    title: "Real-time Collaboration",
    description: "See edits happen with WebRTC-powered live collaboration. No lag, no conflicts.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Chatbot",
    description: "get instant summaries, explainations and notes help from  AI that understands your reference material",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-xs md:text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-2 md:mb-3">Features</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to study smarter
          </h2>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            From group management to AI-powered insights, StudySync gives you the tools to ace any subject.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-card rounded-2xl border border-border p-5 md:p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-foreground/5 text-foreground/70 flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-base md:text-lg text-card-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
