import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">404</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">Page not found</p>
                <Link href="/" className="text-blue-500 hover:text-blue-700 underline mt-4 inline-block">
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
