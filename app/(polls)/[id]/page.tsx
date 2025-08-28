import { Nav } from "../../(app)/_components/nav";

type PollPageProps = {
    params: Promise<{ id: string }>;
};

export default async function PollDetailPage(props: PollPageProps) {
    const { id } = await props.params;
    return (
        <div>
            <Nav />
            <main className="mx-auto max-w-5xl px-4 py-10">
                <h1 className="mb-2 text-3xl font-semibold">Poll #{id}</h1>
                <p className="text-sm text-gray-500">Poll details will appear here.</p>
            </main>
        </div>
    );
}


