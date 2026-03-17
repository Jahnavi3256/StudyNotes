import React from 'react';

const footerLinks = {
  Product: ["Features"],
  Resources: ["Help Center", "Guides"],
  Company: ["About", "Contact"],
  Legal: ["Privacy", "Terms", "Security"],
};

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-4 md:py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1 mb-4 md:mb-0">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5">
                  <span className="w-2 h-2 rounded-full bg-background" />
                  <span className="w-2 h-2 rounded-full bg-background" />
                  <span className="w-2 h-2 rounded-full bg-background" />
                  <span className="w-2 h-2 rounded-full bg-background" />
                </div>
              </div>
              <span className="font-display font-bold text-lg text-foreground">StudySync</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Collaborative notes and AI-powered learning for students.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-sm text-foreground mb-3 md:mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-2 md:mt-2 pt-5 md:pt-5x border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-2">© 2026 StudySync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
