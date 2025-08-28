export type Poll = {
    id: string;
    question: string;
    options: { id: string; label: string; votes: number }[];
    createdAt: string;
};

export async function fetchPolls(): Promise<Poll[]> {
    // Placeholder implementation
    return [];
}

export async function fetchPollById(id: string): Promise<Poll | null> {
    // Placeholder implementation
    return null;
}


