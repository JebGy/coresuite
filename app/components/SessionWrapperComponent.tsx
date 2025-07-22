"use client";
import { UserProvider } from "../context/UserContext";

export default function SessionWrapperComponent({ children }: { children: React.ReactNode }) {
    return <UserProvider>{children}</UserProvider>;
}