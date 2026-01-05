import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const SupabaseAuthContext = createContext(undefined);

export const SupabaseAuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

      if (!error && data) {
        setUserProfile(data);
      } else {
        console.error('Error fetching profile:', error);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      await fetchProfile(currentUser.id);
    } else {
      setUserProfile(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            handleSession(session);
          } else if (event === 'SIGNED_OUT') {
            handleSession(null);
          }
        }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // metadata like full_name and role_type passed here
        emailRedirectTo: `${window.location.origin}/login`
      },
    });

    if (error) {
      // Let the component handle specific UI messaging for better UX,
      // but log it here for debugging.
      console.error("Context SignUp Error:", error);
    }

    return { data, error };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Context SignIn Error:", error.message);
    }

    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "error",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    } else {
      toast({
        variant: "success",
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    }
    setUser(null);
    setSession(null);
    setUserProfile(null);
    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id)
  }), [user, userProfile, session, loading, signUp, signIn, signOut]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};