"use client"

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiMenu, FiX, FiSearch, FiUser, FiUpload, FiClock, FiList, FiPlus } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import DBStatusIndicator from '../ui/DBStatusIndicator';

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-secondary border-b border-gray-800 sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">Webcam<span className="text-primary">Rips</span></span>
            </Link>
            <div className="ml-4 hidden md:block">
              <DBStatusIndicator />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/videos" className="text-gray-300 hover:text-primary transition-colors">
              Videos
            </Link>
            <Link href="/categories" className="text-gray-300 hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/models" className="text-gray-300 hover:text-primary transition-colors">
              Models
            </Link>
            <Link href="/channels" className="text-gray-300 hover:text-primary transition-colors">
              Channels
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <button 
              className="text-gray-300 hover:text-primary p-2"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>
            
            {session ? (
              <>
                <Link href="/watchlater" className="text-gray-300 hover:text-primary p-2" title="Watch Later">
                  <FiClock size={20} />
                </Link>
                <Link href="/history" className="text-gray-300 hover:text-primary p-2" title="History">
                  <FiList size={20} />
                </Link>
                <Link href="/upload" className="text-gray-300 hover:text-primary p-2" title="Upload">
                  <FiUpload size={20} />
                </Link>
                {session.user.role === 'admin' && (
                  <Link href="/add-video" className="text-gray-300 hover:text-primary p-2" title="Add Video">
                    <FiPlus size={20} />
                  </Link>
                )}
                <Link href="/dashboard" className="text-gray-300 hover:text-primary p-2" title="Dashboard">
                  <FiUser size={20} />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-primary p-2">
                  <FiUser size={20} />
                </Link>
                <Link href="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="bg-dark border-t border-gray-800 absolute w-full z-50 py-3">
          <div className="container-custom">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search videos, performers, tags..."
                className="flex-1 bg-secondary rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded transition-colors"
              >
                Search
              </button>
              <button 
                type="button" 
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark border-t border-gray-800 absolute w-full z-50">
          <div className="container-custom py-4">
            <div className="flex flex-col space-y-4">
              <div className="md:hidden mb-2">
                <DBStatusIndicator />
              </div>
              <Link 
                href="/videos" 
                className="text-gray-300 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Videos
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-300 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                href="/models" 
                className="text-gray-300 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Models
              </Link>
              <Link 
                href="/channels" 
                className="text-gray-300 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Channels
              </Link>
              
              {session ? (
                <>
                  <Link 
                    href="/watchlater" 
                    className="text-gray-300 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Watch Later
                  </Link>
                  <Link 
                    href="/history" 
                    className="text-gray-300 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    History
                  </Link>
                  {session.user.role === 'admin' && (
                    <Link 
                      href="/add-video" 
                      className="text-gray-300 hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Add Video
                    </Link>
                  )}
                  <Link 
                    href="/dashboard" 
                    className="text-gray-300 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <div className="pt-4 border-t border-gray-800 flex flex-col space-y-4">
                  <Link 
                    href="/login" 
                    className="text-gray-300 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 