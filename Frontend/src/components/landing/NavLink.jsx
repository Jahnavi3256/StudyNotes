import React from 'react';
import { NavLink as RouterNavLink } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";


const CustomNavLink = forwardRef(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

CustomNavLink.displayName = "NavLink";

export { CustomNavLink as NavLink };
