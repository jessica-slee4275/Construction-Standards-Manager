import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

type Category = "school" | "apartment" | "commercial" | "all";

interface SelectedBlock {
    title: string;
    items: string[];
}

interface SavedTemplate {
    id: number | string;
    title: string;
    subtitle?: string | null;
    team_id?: number | null;
    category: Category;
    checklist: SelectedBlock[];
    created_at?: string | null;
}

export default function SavedTemplatesPage() {
    const navigate = useNavigate(); 

    const [data, setData] = useState<SavedTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("http://127.0.0.1:5000/api/safetyTemplates");
                if (!r.ok) throw new Error(await r.text());
                const json = (await r.json()) as SavedTemplate[];
                setData(json);
            } catch (e: any) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div className="p-6 text-sm text-gray-600">Loading...</div>;
    if (err) return <div className="p-6 text-sm text-red-600">Error: {err}</div>;

    return (
        <div className="min-h-screen w-full bg-white p-6">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Saved Templates</h1>
                        <p className="mt-1 text-sm text-gray-500">This is the safetyTemplates DB.</p>
                    </div>
                    <Link
                        to="/"
                        className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        + New template
                    </Link>
                </div>

                {data.length === 0 ? (
                    <div className="text-sm text-gray-600">No templates yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.map((t) => {
                            const itemsCount = (t.checklist || []).reduce(
                                (sum, b) => sum + (b.items?.length || 0),
                                0
                            );
                            return (
                                <div
                                    key={t.id}
                                    onClick={() => navigate(`/saved/${t.id}`)}
                                    className="rounded-2xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">{t.title}</div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                Category: {t.category} • {itemsCount} items
                                                {t.created_at ? ` • ${new Date(t.created_at).toLocaleString()}` : ""}
                                            </div>
                                        </div>
                                    </div>

                                    <ul className="mt-3 list-disc list-inside space-y-1">
                                        {(t.checklist || []).slice(0, 3).map((b, i) => (
                                            <li key={i} className="text-sm text-gray-800">
                                                {b.title} ({b.items.length})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
