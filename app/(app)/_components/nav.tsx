import Link from "next/link";

export function Nav() {
    return (
        <nav className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/(polls)" className="font-semibold">Polling App</Link>
                <div className="flex items-center gap-3 text-sm">
                    <Link href="/(polls)">Polls</Link>
                    <Link href="/(polls)/create">Create</Link>
                    <Link href="/(auth)/signin">Sign in</Link>
                </div>
            </div>
        </nav>
    );
}


