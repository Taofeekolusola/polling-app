'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthStatus } from "@/components/auth/auth-status";

export function Nav() {
    const { user } = useAuth();

    return (
        <nav className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/" className="font-semibold">Polling App</Link>
                <div className="flex items-center gap-3 text-sm">
                    <Link href="/">Polls</Link>
                    <Link href="/create">Create Poll</Link>
                    {user ? (
                        <AuthStatus />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/signin">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
