import { Nav } from "@/app/(app)/_components/nav";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CreatePollPage() {
    return (
        <ProtectedRoute>
            <div>
                <Nav />
                <main className="mx-auto max-w-5xl px-4 py-10">
                    <h1 className="mb-2 text-3xl font-semibold">Create Poll</h1>
                    <p className="text-sm text-gray-500">Create a new poll form will appear here.</p>
                </main>
            </div>
        </ProtectedRoute>
    );
}

