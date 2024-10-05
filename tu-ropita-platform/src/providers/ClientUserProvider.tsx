'use client'

import { privateUsersApiWrapper } from '@/api-wrappers/users';
import { IUser } from '@/lib/backend/models/interfaces/user.interface';
import Cookies from 'js-cookie';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const UserContext = createContext<{
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  signOut: () => void;
  getUser: () => Promise<IUser | null>;
} | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default function ClientUserProvider({ 
  children,
  initialUser
}: { 
  children: React.ReactNode;
  initialUser: IUser | null;
}) {
  const [user, setUser] = useState<IUser | null>(initialUser);

  const signOut = useCallback(() => {
    Cookies.remove('Authorization');
    Cookies.remove('Refresh-Token');
    setUser(null);
    window.location.href = '/';
  }, []);

  const getUser = useCallback(async () => {
    const token = Cookies.get('Authorization');
    if (token && !user) {
      try {
        const fetchedUser = await privateUsersApiWrapper.getMe(token);
        setUser(fetchedUser || null);
        return fetchedUser || null;
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    }
    return user;
  }, [user]);

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, [getUser, user]);

  return (
    <UserContext.Provider value={{ user, setUser, signOut, getUser }}>
      {children}
    </UserContext.Provider>
  );
}