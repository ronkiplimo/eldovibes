
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Heart, User, LogOut, MessageCircle, LayoutDashboard, Shield, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdmin';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileClick = () => {
    navigate('/dashboard');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 min-w-0">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent truncate">
              EldoVibes
            </span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0">
            <Link to="/about">
              <Button variant="ghost" size="sm" className="p-2 sm:px-3">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline ml-2">About</span>
              </Button>
            </Link>

            {user ? (
              <>
                <Link to="/messages">
                  <Button variant="ghost" size="sm" className="p-2 sm:px-3">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline ml-2">Messages</span>
                  </Button>
                </Link>
                
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="p-2 sm:px-3">
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden xs:inline ml-2">Dashboard</span>
                  </Button>
                </Link>

                {isAdmin && (
                  <Link to="/admin" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="p-2 sm:px-3">
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden md:inline ml-2">Admin</span>
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full flex-shrink-0 ml-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={handleProfileClick}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={handleAdminClick}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth" className="flex-shrink-0">
                <Button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-xs sm:text-sm px-2 sm:px-4">
                  <span className="truncate">Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
