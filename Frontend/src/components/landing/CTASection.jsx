import React from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-foreground rounded-2xl md:rounded-3xl p-8 sm:p-12 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 md:w-64 h-48 md:h-64 rounded-full bg-background/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-36 md:w-48 h-36 md:h-48 rounded-full bg-background/5 translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-background mb-3 md:mb-4">
              Ready to study smarter?
            </h2>
            <p className="text-background/70 text-sm md:text-base max-w-lg mx-auto mb-6 md:mb-8">
              Join thousands of students who are already collaborating, learning faster, and acing their exams with StudySync.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-semibold"
              onClick={() => navigate('/get-started')}
            >
              Get started free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
