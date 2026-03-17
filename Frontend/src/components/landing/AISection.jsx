import React from 'react';
import { motion } from "framer-motion";
import { Bot, BookOpen, Lightbulb, FileEdit, ClipboardCheck } from "lucide-react";

const capabilities = [
  { icon: <BookOpen className="w-5 h-5" />, text: "Summarize entire chapters in seconds" },
  { icon: <Lightbulb className="w-5 h-5" />, text: "Explain complex concepts simply" },
  { icon: <FileEdit className="w-5 h-5" />, text: "Edit notes by AI assistance and keep only what you want to save for future use" },
  // { icon: <ClipboardCheck className="w-5 h-5" />, text: "Practice questions and quizzes" },
];

const AISection = () => {
  return (
    <section id="ai powered learning" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Chat mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-2xl border border-border shadow-xl p-4 sm:p-6 order-2 lg:order-1"
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-border">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                <Bot className="w-5 h-5 text-foreground/60" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-card-foreground">StudySync AI</p>
                <p className="text-xs text-muted-foreground">Always ready to help</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-end">
                <div className="bg-foreground text-background rounded-2xl rounded-br-md px-3 md:px-4 py-2.5 md:py-3 max-w-[85%] sm:max-w-xs">
                  <p className="text-sm">Summarize chapter 4 of Organic Chemistry notes</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md px-3 md:px-4 py-2.5 md:py-3 max-w-[90%] sm:max-w-sm">
                  <p className="text-sm leading-relaxed">
                    Chapter 4 covers <strong>stereochemistry</strong>: chirality, enantiomers, diastereomers, and optical activity. Key takeaway — molecules with asymmetric carbon atoms exist-superimposable mirror images.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-foreground text-background rounded-2xl rounded-br-md px-3 md:px-4 py-2.5 md:py-3 max-w-[85%] sm:max-w-xs">
                  <p className="text-sm">Generate 3 practice questions</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <p className="text-xs md:text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-2 md:mb-3">AI-Powered Learning</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
              Your personal study assistant, always on
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              Our AI chatbot reads and understands your notes to provide instant summaries, clear explanations, and practice questions — so you spend less time re-reading and more time learning.
            </p>

            <div className="space-y-3 md:space-y-4">
              {capabilities.map((cap, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-foreground/5 text-foreground/60 flex items-center justify-center flex-shrink-0">
                    {cap.icon}
                  </div>
                  <p className="text-sm font-medium text-foreground">{cap.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
