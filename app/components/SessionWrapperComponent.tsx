"use client";
import { UserProvider } from "../context/UserContext";

export default function SessionWrapperComponent({ children }: { children: React.ReactNode }) {
    console.log("SessionWrapperComponent rendered");
    return <UserProvider>{children}</UserProvider>;
}