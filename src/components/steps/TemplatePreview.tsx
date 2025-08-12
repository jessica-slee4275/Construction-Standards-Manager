import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// -------- Types (align with Step 2 payload) --------
type Category = "school" | "apartment" | "commercial" | "all";

interface SelectedBlock {
    title: string;
    items: string[];
}

interface LocationState {
    category: Category;
    selectedItems: SelectedBlock[];
}

interface SavedTemplate {
    id: string;
    title: string;
    category: Category;
    createdAt: string; // ISO
    blocks: SelectedBlock[];
}

// -------- Local storage helpers --------
const LS_KEY = "savedTemplates";

function getSaved(): SavedTemplate[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? (JSON.parse(raw) as SavedTemplate[]) : [];
    } catch {
        return [];
    }
}

function persistTemplate(t: SavedTemplate) {
    const all = getSaved();
    all.unshift(t);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
}

// -------- Component --------
export default function TemplatePreview() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const data = (state || {}) as LocationState;

    const [title, setTitle] = useState<string>("");

    const totalItems = useMemo(
        () => data.selectedItems?.reduce((sum, b) => sum + b.items.length, 0) ?? 0,
        [data.selectedItems]
    );

    const save = async () => {
        if (!title.trim()) {
            alert("Please enter a template title.");
            return;
        }
        if (!data.selectedItems || data.selectedItems.length === 0) {
            alert("No items selected. Go back and choose some checklist items.");
            return;
        }
        try {
            const payload = {
                title: title.trim(),
                subtitle: "",          
                team_id: null,          
                category: data.category,
                checklist: data.selectedItems, // [{title, items[]}] 
            };

            const res = await fetch("http://127.0.0.1:5000/api/safetyTemplates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to save");
            }

            navigate("/saved", { replace: true });
        } catch (e: any) {
            alert("Save failed: " + e.message);
        }
    };

    if (!data.selectedItems) {
        return (
            <div className="p-6">
                <p className="text-sm text-gray-600">Nothing to preview. Start from Step 1.</p>
                <button
                    className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => navigate("/")}
                >
                    Go to Step 1
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-white p-6">
            <div className="mx-auto w-full max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Preview</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Review your selections and save as a reusable template.
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">{totalItems} items</div>
                </div>

                {/* Title input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Template title</label>
                    <input
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., School - Monthly Safety Walk"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Category pill */}
                <div>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        Category: {data.category}
                    </span>
                </div>

                {/* Blocks */}
                <div className="space-y-4">
                    {data.selectedItems.map((b) => (
                        <div key={b.title} className="rounded-2xl border border-gray-200 p-4 shadow-sm">
                            <h2 className="text-sm font-semibold text-gray-900">{b.title}</h2>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                                {b.items.map((it, i) => (
                                    <li key={i} className="text-sm text-gray-800">{it}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Back
                    </button>
                    <button
                        onClick={save}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                    >
                        Save Template
                    </button>
                </div>
            </div>
        </div>
    );
}
