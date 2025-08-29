import { Nav } from "@/app/(app)/_components/nav";

export default function Home() {
  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-semibold">Polls</h1>
        <p className="text-sm text-gray-500">List of polls will appear here.</p>
      </main>
    </div>
  );
}
