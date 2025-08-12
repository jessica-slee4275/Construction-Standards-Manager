import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Category = "school" | "apartment" | "commercial" | "all";
interface Block { title: string; items: string[]; }
interface Tpl {
    id: number | string;
    title: string;
    subtitle?: string | null;
    category: Category;
    checklist: Block[];
    created_at?: string | null;
}

export default function SavedTemplateDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tpl, setTpl] = useState<Tpl | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<Category>("school");
    const [blocks, setBlocks] = useState<Block[]>([]); //  editing status

    // fetch & normalize
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`http://127.0.0.1:5000/api/safetyTemplates/${id}`);
                if (!r.ok) throw new Error(await r.text());
                const json = await r.json();

                let checklist: Block[] = [];
                if (Array.isArray(json.checklist)) checklist = json.checklist;
                else if (typeof json.checklist === "string") {
                    try {
                        const p = JSON.parse(json.checklist);
                        if (Array.isArray(p)) checklist = p;
                    } catch { }
                } else if (json.checklist && typeof json.checklist === "object") {
                    checklist = Object.values(json.checklist) as Block[];
                }

                const normalized: Tpl = {
                    id: json.id,
                    title: json.title,
                    subtitle: json.subtitle,
                    category: json.category,
                    created_at: json.created_at,
                    checklist,
                };

                setTpl(normalized);
                setTitle(normalized.title);
                setCategory(normalized.category);
                setBlocks(normalized.checklist);
            } catch (e: any) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // ---------- modify handler ----------
    const changeBlockTitle = (i: number, v: string) =>
        setBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, title: v } : b)));

    const addBlock = () =>
        setBlocks((prev) => [...prev, { title: "New block", items: [""] }]);

    const removeBlock = (i: number) =>
        setBlocks((prev) => prev.filter((_, idx) => idx !== i));

    const changeItem = (bi: number, ii: number, v: string) =>
        setBlocks((prev) =>
            prev.map((b, idx) =>
                idx === bi
                    ? { ...b, items: b.items.map((it, j) => (j === ii ? v : it)) }
                    : b
            )
        );

    const addItem = (bi: number) =>
        setBlocks((prev) =>
            prev.map((b, idx) => (idx === bi ? { ...b, items: [...b.items, ""] } : b))
        );

    const removeItem = (bi: number, ii: number) =>
        setBlocks((prev) =>
            prev.map((b, idx) =>
                idx === bi ? { ...b, items: b.items.filter((_, j) => j !== ii) } : b
            )
        );

    // ---------- save/delete ----------
    const save = async () => {
        if (!title.trim()) {
            alert("Title is required.");
            return;
        }
        const sanitized = blocks
            .map((b) => ({
                title: b.title.trim(),
                items: b.items.map((s) => s.trim()).filter(Boolean),
            }))
            .filter((b) => b.title || b.items.length);

        const res = await fetch(
            `http://127.0.0.1:5000/api/safetyTemplates/${id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    category,
                    checklist: sanitized, // checklist save
                }),
            }
        );
        if (!res.ok) {
            alert(await res.text());
            return;
        }
        const updated = (await res.json()) as Tpl;
        setTpl(updated);
        setBlocks(updated.checklist || []);
        alert("Saved.");
    };

    const remove = async () => {
        if (!confirm("Delete this template?")) return;
        const res = await fetch(
            `http://127.0.0.1:5000/api/safetyTemplates/${id}`,
            { method: "DELETE" }
        );
        if (!res.ok) {
            alert(await res.text());
            return;
        }
        navigate("/saved", { replace: true });
    };

    if (loading) return <div className="p-6 text-sm text-gray-600">Loading...</div>;
    if (err) return <div className="p-6 text-sm text-red-600">Error: {err}</div>;
    if (!tpl) return null;

    return (
        <div className="min-h-screen w-full bg-white p-6">
            <div className="mx-auto w-full max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Template Detail</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate("/saved")}
                            className="px-3 py-2 rounded-xl text-sm ring-1 ring-gray-300"
                        >
                            Back
                        </button>
                        <button
                            onClick={remove}
                            className="px-3 py-2 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700"
                        >
                            Delete
                        </button>
                        <button
                            onClick={save}
                            className="px-3 py-2 rounded-xl text-sm bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </div>

                {/* Meta */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value="school">school</option>
                        <option value="apartment">apartment</option>
                        <option value="commercial">commercial</option>
                        <option value="all">all</option>
                    </select>
                </div>

                {/* Blocks editor */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Blocks</h2>
                        <button
                            onClick={addBlock}
                            className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                        >
                            + Add block
                        </button>
                    </div>

                    {blocks.map((b, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3"
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    value={b.title}
                                    onChange={(e) => changeBlockTitle(i, e.target.value)}
                                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Block title"
                                />
                                <button
                                    onClick={() => removeBlock(i)}
                                    className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                                >
                                    Delete block
                                </button>
                            </div>

                            <ul className="space-y-2">
                                {b.items.map((it, ii) => (
                                    <li key={ii} className="flex items-center gap-2">
                                        <input
                                            value={it}
                                            onChange={(e) => changeItem(i, ii, e.target.value)}
                                            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm"
                                            placeholder="Checklist item"
                                        />
                                        <button
                                            onClick={() => removeItem(i, ii)}
                                            className="px-2 py-2 text-sm rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => addItem(i)}
                                className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                            >
                                + Add item
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
