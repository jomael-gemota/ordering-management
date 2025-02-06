import { AnotherPage } from "./another-page";

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <AnotherPage />
            <section>{children}</section>
        </div>
    );
}