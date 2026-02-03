interface Props {
    loading: boolean;
    error?: string;
}

export function ActionState({ loading, error }: Props) {
    if (loading) return <p>⏳ Please wait...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    return null;
}
