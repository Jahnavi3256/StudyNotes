import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = ["Features", "How it works", "AI powered learning", "About"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-14 md:h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-foreground flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-background" />
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-background" />
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-background" />
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-background" />
            </div>
          </div>
          <span className="font-display font-bold text-base md:text-lg text-foreground">StudySync</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* <Button variant="ghost" size="sm" className="text-muted-foreground">
            Sign in
          </Button> */}
          <Button size="sm" onClick={() => navigate('/get-started')}>Get started free</Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 sm:px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link}
            </a>
          ))}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Button variant="ghost" size="sm">Sign in</Button>
            <Button size="sm" onClick={() => navigate('/get-started')}>Get started free</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
