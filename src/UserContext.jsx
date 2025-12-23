import React, { createContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useContext } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
  const initAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);
    setUser(session?.user ?? null);
    setAuthLoading(false);
  };

  initAuth();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, newSession) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
  });
  return () => {
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, is_staff")
        .eq("id", user.id)
        .single();

      if (!error) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchUsers();
  }, [authLoading]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, is_staff, is_active");

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        session,
        profile, // ✅ EXPOSE PROFILE
        users,
        loading,
        error,
        authLoading,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
