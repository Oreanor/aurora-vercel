"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut, ChevronDown, Network, UserCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Button from "@/components/ui/button";
import { getAvailableTrees, TreeInfo, createTree } from "@/lib/api/trees";
import { getTreeById } from "@/lib/api/trees";
import { formatTreeNameShort } from "@/lib/utils/tree-format";
import { useTree } from "@/contexts/tree-context";
import NoTreesModal from "@/components/features/no-trees-modal";
import CreateFirstPersonPanel from "@/components/features/create-first-person-panel";
import { Person, FamilyTreeData } from "@/types/family";
import { useRouter } from "next/navigation";

interface Props {
  className?: string;
}

export default function Navbar({ className = "" }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [availableTrees, setAvailableTrees] = useState<TreeInfo[]>([]);
  const [treeNames, setTreeNames] = useState<Record<string, string>>({});
  const [isTreeDropdownOpen, setIsTreeDropdownOpen] = useState(false);
  const [showNoTreesModal, setShowNoTreesModal] = useState(false);
  const [showCreateFirstPerson, setShowCreateFirstPerson] = useState(false);
  const treeDropdownRef = useRef<HTMLDivElement>(null);
  const { selectedTreeId, setSelectedTreeId } = useTree();
  const router = useRouter();

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsHomeDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsHomeDropdownOpen(false);
    }, 150); // 150ms delay before closing
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Close user menu and tree selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (treeDropdownRef.current && !treeDropdownRef.current.contains(event.target as Node)) {
        setIsTreeDropdownOpen(false);
      }
    };

    if (isUserMenuOpen || isTreeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isTreeDropdownOpen]);

  // Load list of available trees for selector
  useEffect(() => {
    if (!session?.user?.email || status !== 'authenticated') return;

    const loadTrees = async () => {
      try {
        const response = await getAvailableTrees(session.user.email!);
        
        // Check if trees list changed
        const treesChanged = 
          availableTrees.length !== response.trees.length ||
          availableTrees.some((tree, index) => tree.id !== response.trees[index]?.id);
        
        // Only update trees if list changed
        if (treesChanged) {
          setAvailableTrees(response.trees);
        }
        
        // Load full tree data for formatting names only for trees that don't have names yet
        const namesToLoad: Record<string, string> = { ...treeNames };
        const treesToLoad = response.trees.filter(tree => !treeNames[tree.id]);
        
        if (treesToLoad.length > 0) {
          await Promise.all(
            treesToLoad.map(async (tree) => {
              try {
                const fullTree = await getTreeById(tree.id);
                namesToLoad[tree.id] = formatTreeNameShort(fullTree);
              } catch {
                namesToLoad[tree.id] = tree.name || tree.id;
              }
            })
          );
          setTreeNames(namesToLoad);
        }

        // Set selected tree from URL or first available
        // Always set if we have a treeId and selectedTreeId is null or different
        // This ensures tree is selected even on Home page
        const treeIdFromUrl = searchParams.get('treeId');
        if (treeIdFromUrl) {
          // If treeId in URL, use it
          if (treeIdFromUrl !== selectedTreeId) {
            setSelectedTreeId(treeIdFromUrl);
          }
        } else if (response.trees.length > 0) {
          // If no treeId in URL, use first available tree (especially important on Home page)
          const firstTreeId = response.trees[0].id;
          if (!selectedTreeId || firstTreeId !== selectedTreeId) {
            setSelectedTreeId(firstTreeId);
          }
        }
      } catch (err) {
        console.error('Error loading trees in navbar:', err);
      }
    };

    loadTrees();
    // Include pathname to ensure trees are loaded when navigating to Home
    // Remove selectedTreeId and setSelectedTreeId from dependencies to avoid re-render cycle
    // setSelectedTreeId is now memoized in context and stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, status, searchParams, pathname]);

  // Show popup if no trees (separate effect to avoid re-running tree loading)
  useEffect(() => {
    if (availableTrees.length === 0 && pathname !== '/' && session && status === 'authenticated') {
      // Small delay for smooth appearance
      const timeoutId = setTimeout(() => {
        setShowNoTreesModal(true);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [availableTrees.length, pathname, session, status]);

  // Handler for tree change
  const handleTreeChange = (treeId: string) => {
    setSelectedTreeId(treeId);
    setIsTreeDropdownOpen(false);
  };

  // Handler for creating first tree
  const handleCreateFirstTree = () => {
    setShowNoTreesModal(false);
    setShowCreateFirstPerson(true);
  };

  // Handler for saving first person and creating tree
  const handleSaveFirstPerson = async (person: Omit<Person, 'id'>) => {
    if (!session?.user?.email) return;

    try {
      // Create tree with one person
      const treeData: FamilyTreeData = {
        persons: [{
          ...person,
          id: `person-${Date.now()}`,
        }],
        relationships: [],
      };

      const newTree = await createTree(session.user.email, treeData);
      
      // Update trees list
      const response = await getAvailableTrees(session.user.email);
      setAvailableTrees(response.trees);
      
      // Load names
      const names: Record<string, string> = {};
      await Promise.all(
        response.trees.map(async (tree) => {
          try {
            const fullTree = await getTreeById(tree.id);
            names[tree.id] = formatTreeNameShort(fullTree);
          } catch {
            names[tree.id] = tree.name || tree.id;
          }
        })
      );
      setTreeNames(names);

      // Set new tree and navigate to Tree
      setSelectedTreeId(newTree.id);
      setShowCreateFirstPerson(false);
      router.push(`/tree?treeId=${newTree.id}`);
    } catch (err) {
      console.error('Error creating first tree:', err);
      alert('Ошибка при создании дерева. Попробуйте еще раз.');
    }
  };

  const homeDropdownLinks = [
    { href: "/#chat-demo", label: "Chat Demo" },
    { href: "/#features", label: "Features" },
    { href: "/#how-to", label: "How To" },
    { href: "/#future", label: "Future" },
  ];

  const navLinks = [
    { href: "/tree", label: "Tree" },
    { href: "/chatroom", label: "Chatroom" },
    { href: "/family", label: "Family" },
    { href: "/stories", label: "My Stories" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-15 bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full w-full">
          {/* Left side: Logo and Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/aurora-logo.png"
                alt="Aurora Logo"
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
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/"
                onClick={() => {
                  if (dropdownTimeoutRef.current) {
                    clearTimeout(dropdownTimeoutRef.current);
                    dropdownTimeoutRef.current = null;
                  }
                  setIsHomeDropdownOpen(false);
                }}
                className={`font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  pathname === "/"
                    ? 'text-green-400'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <span>Home</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isHomeDropdownOpen ? 'rotate-180' : ''}`} />
              </Link>
              {isHomeDropdownOpen && (
                <div className="absolute top-full left-0 -mt-1 pt-1 w-48 z-50">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                    {homeDropdownLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-400 transition-colors duration-200"
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
                      : 'text-gray-700 hover:text-gray-900'
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
            {/* Tree Selector - only for logged in users */}
            {session && availableTrees.length > 0 && (
              <div className="hidden md:flex items-center relative" ref={treeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTreeDropdownOpen(!isTreeDropdownOpen)}
                  className="flex items-center space-x-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <Network className="h-4 w-4 text-gray-500 rotate-180" />
                  <span className="font-semibold">
                    {selectedTreeId ? (() => {
                      const selectedTree = availableTrees.find(t => t.id === selectedTreeId);
                      const name = treeNames[selectedTreeId] || selectedTree?.name || selectedTreeId;
                      const role = selectedTree?.role;
                      return role === 'owner' ? `${name} (own)` : name;
                    })() : 'Select tree'}
                  </span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isTreeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTreeDropdownOpen && (
                  <div className="absolute right-0 top-full -mt-1 pt-1 w-48 z-50">
                    <div className="bg-white rounded-lg shadow-lg py-2">
                      {availableTrees.map((tree) => (
                        <button
                          key={tree.id}
                          onClick={() => handleTreeChange(tree.id)}
                          className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-400 transition-colors duration-200 ${
                            selectedTreeId === tree.id ? 'bg-green-50 text-green-400' : ''
                          }`}
                        >
                          <span className="font-semibold">
                            {treeNames[tree.id] || tree.name || tree.id}
                            {tree.role === 'owner' && ' (own)'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center">
              {status === "loading" ? (
                <div className="h-8 w-8" />
              ) : session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                  >
                    <UserCircle className="h-6 w-6 text-gray-700" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/signin">
                  <Button variant="primary" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Home with Dropdown */}
              <div>
                <button
                  onClick={() => setIsHomeDropdownOpen(!isHomeDropdownOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 font-medium transition-colors duration-200 ${
                    pathname === "/"
                      ? 'text-green-400'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <span>Home</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isHomeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isHomeDropdownOpen && (
                  <div className="pl-6 space-y-1">
                    {homeDropdownLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-green-400 transition-colors duration-200"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsHomeDropdownOpen(false);
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
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
                    className={`block px-3 py-2 font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-green-400'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-gray-200">
                {status === "loading" ? (
                  <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : session ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    className="block w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="primary" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No Trees Modal */}
      <NoTreesModal
        isOpen={showNoTreesModal}
        onClose={() => setShowNoTreesModal(false)}
        onCreateTree={handleCreateFirstTree}
      />

      {/* Create First Person Panel */}
      {showCreateFirstPerson && (
        <CreateFirstPersonPanel
          onClose={() => setShowCreateFirstPerson(false)}
          onSave={handleSaveFirstPerson}
        />
      )}
    </nav>
  );
}
