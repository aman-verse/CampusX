import type{ ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function AppLayout({ children }: Props) {
    return (
        <div style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
            <h1>CampusX</h1>
            {children}
        </div>
    );
}
