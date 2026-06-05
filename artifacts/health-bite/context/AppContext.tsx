import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Gender = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "veryActive";

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  activityLevel: ActivityLevel;
}

interface AppContextType {
  isLoggedIn: boolean;
  userEmail: string;
  userProfile: UserProfile | null;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    void loadState();
  }, []);

  async function loadState() {
    try {
      const [loginVal, emailVal, profileVal] = await Promise.all([
        AsyncStorage.getItem("isLoggedIn"),
        AsyncStorage.getItem("userEmail"),
        AsyncStorage.getItem("userProfile"),
      ]);
      if (loginVal === "true") setIsLoggedIn(true);
      if (emailVal) setUserEmail(emailVal);
      if (profileVal) setUserProfile(JSON.parse(profileVal) as UserProfile);
    } catch {
      // ignore
    }
  }

  async function login(email: string) {
    await Promise.all([
      AsyncStorage.setItem("isLoggedIn", "true"),
      AsyncStorage.setItem("userEmail", email),
    ]);
    setIsLoggedIn(true);
    setUserEmail(email);
  }

  async function logout() {
    await AsyncStorage.multiRemove(["isLoggedIn", "userEmail", "userProfile"]);
    setIsLoggedIn(false);
    setUserEmail("");
    setUserProfile(null);
  }

  async function saveProfile(profile: UserProfile) {
    await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
    setUserProfile(profile);
  }

  return (
    <AppContext.Provider
      value={{ isLoggedIn, userEmail, userProfile, login, logout, saveProfile }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
