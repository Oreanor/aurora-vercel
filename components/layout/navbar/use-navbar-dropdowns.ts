"use client";

import { useState, useRef, useEffect } from "react";

export function useNavbarDropdowns() {
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageSubmenuOpen, setIsLanguageSubmenuOpen] = useState(false);
  const [isThemeSubmenuOpen, setIsThemeSubmenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileLanguageMenuOpen, setIsMobileLanguageMenuOpen] = useState(false);
  const [isMobileThemeMenuOpen, setIsMobileThemeMenuOpen] = useState(false);
  const [isTreeDropdownOpen, setIsTreeDropdownOpen] = useState(false);

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const treeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
        setIsLanguageSubmenuOpen(false);
        setIsThemeSubmenuOpen(false);
      }
      if (treeDropdownRef.current && !treeDropdownRef.current.contains(event.target as Node)) {
        setIsTreeDropdownOpen(false);
      }
    };

    if (isUserMenuOpen || isTreeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen, isTreeDropdownOpen]);

  const handleHomeMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsHomeDropdownOpen(true);
  };

  const handleHomeMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setIsHomeDropdownOpen(false), 150);
  };

  const closeHomeDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsHomeDropdownOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => {
      if (!prev) return true;
      setIsMobileLanguageMenuOpen(false);
      setIsMobileThemeMenuOpen(false);
      return false;
    });
  };

  return {
    isHomeDropdownOpen,
    setIsHomeDropdownOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
    isLanguageSubmenuOpen,
    setIsLanguageSubmenuOpen,
    isThemeSubmenuOpen,
    setIsThemeSubmenuOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isMobileLanguageMenuOpen,
    setIsMobileLanguageMenuOpen,
    isMobileThemeMenuOpen,
    setIsMobileThemeMenuOpen,
    isTreeDropdownOpen,
    setIsTreeDropdownOpen,
    userMenuRef,
    treeDropdownRef,
    handleHomeMouseEnter,
    handleHomeMouseLeave,
    closeHomeDropdown,
    handleMobileMenuToggle,
  };
}
