import React, { createContext, useState, useEffect } from "react";
import { unsecureRequest } from "./config";
import { supabase } from "./supabaseClient";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize auth session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user has existing session
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Subscribe to auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChanged((event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch users only when auth is loaded
  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users from Supabase profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, is_staff, is_active");

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers,
        user,
        session,
        authLoading,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
