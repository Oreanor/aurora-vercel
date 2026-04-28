"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { getButtonClasses } from "@/components/ui/button";
import { useTree } from "@/contexts/tree-context";
import NoTreesModal from "@/components/features/no-trees-modal";
import CreateFirstPersonPanel from "@/components/features/create-first-person-panel";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import TreeSwitcher from "@/components/layout/navbar/tree-switcher";
import DesktopUserMenu from "@/components/layout/navbar/desktop-user-menu";
import MobileMenu from "@/components/layout/navbar/mobile-menu";
import { useNavbarTrees } from "@/components/layout/navbar/use-navbar-trees";
import { useNavbarDropdowns } from "@/components/layout/navbar/use-navbar-dropdowns";

interface Props {
  className?: string;
}

export default function Navbar({ className = "" }: Props) {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedTreeId, setSelectedTreeId } = useTree();
  const router = useRouter();

  const {
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
  } = useNavbarDropdowns();

  const {
    availableTrees,
    treeNames,
    showNoTreesModal,
    setShowNoTreesModal,
    showCreateFirstPerson,
    setShowCreateFirstPerson,
    createTreeError,
    handleCreateFirstTree,
    handleSaveFirstPerson,
  } = useNavbarTrees({
    session,
    status,
    pathname,
    searchParams,
    selectedTreeId,
    setSelectedTreeId,
    router,
    treeFamilyLabel: t("navbar.treeFamilyLabel"),
    createTreeErrorMessage: t("navbar.createTreeError"),
  });

  const handleTreeChange = (treeId: string) => {
    setSelectedTreeId(treeId);
    setIsTreeDropdownOpen(false);
  };

  const homeDropdownLinks = [
    { href: "/#chat-demo", label: t("navbar.chatDemo") },
    { href: "/#demo-video", label: t("navbar.demoVideo") },
    { href: "/#features", label: t("navbar.features") },
    { href: "/#how-to", label: t("navbar.howTo") },
    { href: "/#future", label: t("navbar.future") },
  ];

  const navLinks = [
    { href: "/tree", label: t("navbar.tree") },
    { href: "/graph", label: t("navbar.graph") },
    { href: "/chatroom", label: t("navbar.connect") },
    { href: "/story", label: t("navbar.myStory") },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[70] h-15 border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-950 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full w-full">
          {/* Left side: Logo and Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex-shrink-0 transition-colors dark:rounded-md dark:bg-sky-100/95 dark:px-2 dark:py-1"
            >
              <Image
                src="/aurora-logo.png"
                alt={t("navbar.logoAlt")}
                width={192}
                height={96}
                className="h-auto w-32 object-contain"
                priority
                quality={100}
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-[15px]">
            {/* Home Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleHomeMouseEnter}
              onMouseLeave={handleHomeMouseLeave}
            >
              <Link
                href="/"
                onClick={closeHomeDropdown}
                className={`font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  pathname === "/"
                    ? 'text-green-400'
                    : 'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'
                }`}
              >
                <span>{t("navbar.home")}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isHomeDropdownOpen ? 'rotate-180' : ''}`} />
              </Link>
              {isHomeDropdownOpen && (
                <div className="absolute top-full left-0 -mt-1 pt-1 w-48 z-50">
                  <div className="rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    {homeDropdownLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-green-400 dark:text-gray-200 dark:hover:bg-gray-800"
                        onClick={() => setIsHomeDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Other Links - Only show if user is logged in */}
            {session && navLinks.map((link) => {
              const isActive = pathname === link.href;
              const href = selectedTreeId ? `${link.href}?treeId=${selectedTreeId}` : link.href;
              return (
                <Link
                  key={link.href}
                  href={href}
                  className={`font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-green-400'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            </div>
          </div>

          {/* Right side: Tree Selector and User Menu */}
          <div className="flex items-center space-x-4">
            {session && (
              <TreeSwitcher
                availableTrees={availableTrees}
                selectedTreeId={selectedTreeId}
                treeNames={treeNames}
                isOpen={isTreeDropdownOpen}
                onToggle={() => setIsTreeDropdownOpen((prev) => !prev)}
                onSelect={handleTreeChange}
                dropdownRef={treeDropdownRef}
              />
            )}

            {!session && (
              <Link
                href="/signin"
                className={getButtonClasses("primary", "sm", "mr-3 hidden md:inline-flex")}
              >
                {t("common.signIn")}
              </Link>
            )}
            <DesktopUserMenu
              status={status}
              session={session}
              userMenuRef={userMenuRef}
              isOpen={isUserMenuOpen}
              setIsOpen={setIsUserMenuOpen}
              isLanguageSubmenuOpen={isLanguageSubmenuOpen}
              setIsLanguageSubmenuOpen={setIsLanguageSubmenuOpen}
              isThemeSubmenuOpen={isThemeSubmenuOpen}
              setIsThemeSubmenuOpen={setIsThemeSubmenuOpen}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={handleMobileMenuToggle}
            aria-label={t("navbar.toggleMobileMenu")}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          session={session}
          status={status}
          pathname={pathname}
          selectedTreeId={selectedTreeId}
          navLinks={navLinks}
          homeDropdownLinks={homeDropdownLinks}
          isHomeDropdownOpen={isHomeDropdownOpen}
          setIsHomeDropdownOpen={setIsHomeDropdownOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isMobileLanguageMenuOpen={isMobileLanguageMenuOpen}
          setIsMobileLanguageMenuOpen={setIsMobileLanguageMenuOpen}
          isMobileThemeMenuOpen={isMobileThemeMenuOpen}
          setIsMobileThemeMenuOpen={setIsMobileThemeMenuOpen}
        />
      </div>

      <NoTreesModal
        isOpen={showNoTreesModal}
        onClose={() => setShowNoTreesModal(false)}
        onCreateTree={handleCreateFirstTree}
      />

      {showCreateFirstPerson && (
        <CreateFirstPersonPanel
          onClose={() => setShowCreateFirstPerson(false)}
          onSave={handleSaveFirstPerson}
          submitError={createTreeError}
        />
      )}
    </nav>
  );
}
