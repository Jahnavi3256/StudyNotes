import React from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, Brain, Users, Sparkles } from "lucide-react";

// ─── Top-Left: Sticky note + checkbox ───
const TopLeftCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.7 }}
    className="absolute top-28 left-6 lg:left-20 xl:left-28 hidden lg:block"
  >
    <div className="relative -rotate-6">
      <div className="bg-[hsl(48,90%,82%)] rounded-sm shadow-md p-4 w-44 lg:w-48 font-body text-xs leading-relaxed text-foreground/80 italic">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[hsl(0,72%,51%)]/70 shadow-sm" />
        <p className="text-sm">Take collaborative notes, share with your group, and ace every exam with ease.</p>
      </div>
      <div className="absolute -bottom-5 -left-3 w-10 h-10 rounded-lg bg-[hsl(var(--hero-accent))] shadow-lg flex items-center justify-center">
        <CheckSquare className="w-5 h-5 text-white" />
      </div>
    </div>
  </motion.div>
);

// ─── Top-Right: Reminders / schedule card ───
const TopRightCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.7 }}
    className="absolute top-24 right-6 lg:right-16 xl:right-24 hidden lg:block rotate-3"
  >
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 w-52 lg:w-56">
      <p className="font-display font-semibold text-sm text-card-foreground mb-3">Study Reminders</p>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-3.5 h-3.5 text-[hsl(var(--hero-accent))]" />
          <span className="text-muted-foreground">Group session</span>
          <span className="ml-auto text-[10px] font-medium bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">Today</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground ml-5">Organic Chem — Ch. 4 Review</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <Clock className="w-3.5 h-3.5 text-[hsl(var(--hero-accent-secondary))]" />
          <span className="text-muted-foreground">Quiz prep</span>
          <span className="ml-auto text-[10px] font-medium bg-[hsl(var(--hero-accent))]/10 text-[hsl(var(--hero-accent))] px-1.5 py-0.5 rounded">3:00 PM</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Bottom-Left: Active notes card ───
const BottomLeftCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.7 }}
    className="absolute bottom-28 left-6 lg:left-20 xl:left-28 hidden lg:block rotate-2"
  >
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 w-56 lg:w-60">
      <p className="font-display font-semibold text-sm text-card-foreground mb-3">Today's Notes</p>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[hsl(0,72%,51%)]/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-[hsl(0,72%,51%)]" />
          </div>
          <span className="text-xs text-card-foreground flex-1">Physics 201 — Waves</span>
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--hero-accent))]/60" />
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--hero-accent-secondary))]/60" />
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div className="bg-[hsl(var(--hero-accent))] h-1.5 rounded-full" style={{ width: "60%" }} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[hsl(var(--hero-accent))]/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-[hsl(var(--hero-accent))]" />
          </div>
          <span className="text-xs text-card-foreground flex-1">History — Ch. 7 Summary</span>
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--hero-accent-secondary))]/60" />
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div className="bg-[hsl(0,72%,51%)] h-1.5 rounded-full" style={{ width: "85%" }} />
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Bottom-Right: AI + Collaboration card ───
const BottomRightCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8, duration: 0.7 }}
    className="absolute bottom-24 right-6 lg:right-16 xl:right-24 hidden lg:block -rotate-3"
  >
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 w-52 lg:w-56">
      <p className="font-display font-semibold text-sm text-card-foreground mb-3">AI + Collaboration</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--hero-accent))]/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-[hsl(var(--hero-accent))]" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--hero-accent-secondary))]/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-[hsl(var(--hero-accent-secondary))]" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-foreground/50" />
        </div>
      </div>
    </div>
  </motion.div>
);

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-surface pt-16 px-4">
      <TopLeftCard />
      <TopRightCard />
      <BottomLeftCard />
      <BottomRightCard />

      {/* Center content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 md:mb-8 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-card shadow-md border border-border flex items-center justify-center"
        >
          <div className="grid grid-cols-2 gap-1">
            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-foreground" />
            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-foreground/40" />
            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-foreground/40" />
            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-foreground" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
        >
          <span className="text-hero-heading">Study, share, and learn</span>
          <br />
          <span className="text-hero-highlight">all in one place</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Create study groups, collaborate on notes in real-time, and let AI help you learn faster.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 md:mt-8"
        >
          <Button
            size="lg"
            className="px-8 py-6 text-base rounded-full shadow-lg"
            onClick={() => navigate('/get-started')}
          >
            Get started free
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
