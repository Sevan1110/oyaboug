import Navbar from "../_components/Navbar";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            <Navbar />
            {children}
        </div>
    );
}
