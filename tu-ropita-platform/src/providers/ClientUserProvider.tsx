'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

type User = { name: string } | undefined;

const UserContext = createContext<{
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
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
  initialUser: User;
}) {
  const [user, setUser] = useState<User>(initialUser);

  useEffect(() => {
    // This effect will run on the client side and update the user state if needed
    const checkUser = async () => {
      // Replace this with your actual user checking logic
      const token = document.cookie.includes('Authorization');
      if (token && !user) {
        setUser({ name: 'John Doe' });
      } else if (!token && user) {
        setUser(undefined);
      }
    };

    checkUser();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}