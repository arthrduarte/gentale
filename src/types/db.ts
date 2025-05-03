export type Story = {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
}

export type Scene = {
    id: string;
    story_id: string;
    order: number;
    input: string;
    text: string;
    images: string[];
    feedback: string;
    created_at: string;
}

export type Memory = {
    id: string;
    user_id: string;
    type: string; // likes or dislikes
    content: string[];
    created_at: string;
}