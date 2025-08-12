import React, { useState } from "react";

// ---------- Types ----------
export type TemplateType =
    | "blank"
    | "daily"
    | "incident"
    | "safety"
    | "visitorScreening";

interface Props {
    onNext: (type: TemplateType) => void;
    onCancel?: () => void;
    defaultSelected?: TemplateType;
    onViewSaved?: () => void;
}

// ---------- Data ----------
const TEMPLATE_OPTIONS: Array<{
    id: TemplateType;
    label: string;
    description: string;
}> = [
        {
            id: "blank",
            label: "Blank Template (Coming soon)",
            description:
                "Start from an empty template and add items manually.",
        },
        {
            id: "daily",
            label: "Daily Report (Coming soon)",
            description:
                "Capture daily site activities, workforce, and progress.",
        },
        {
            id: "incident",
            label: "Incident Report (Coming soon)",
            description:
                "Document accidents, near-misses, and corrective actions.",
        },
        {
            id: "safety",
            label: "Safety Checklist",
            description:
                "Use predefined safety inspection checklists.",
        },
        {
            id: "visitorScreening",
            label: "Screening Checklist for Jobsite Visitors  (Coming soon)",
            description:
                "Screen visitors for site access and PPE requirements.",
        },
    ];

// ---------- Component ----------
export default function TemplateTypeStep({
    onNext,
    onViewSaved,
    onCancel,
    defaultSelected,
}: Props) {
    const [selected, setSelected] = useState<TemplateType | null>(
        defaultSelected ?? null
    );

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (selected) onNext(selected);
    }

    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Select a starting template
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        You can begin with a pre-formatted template and modify it to fit your
                        needs. Or you can begin with a blank template.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200">
                    <fieldset>
                        <legend className="sr-only">Template type</legend>
                        <ul className="divide-y divide-gray-200">
                            {TEMPLATE_OPTIONS.map((opt) => (
                                <li key={opt.id}>
                                    <label
                                        className={[
                                            "flex items-start gap-3 p-4 cursor-pointer transition",
                                            selected === opt.id ? "bg-blue-50" : "hover:bg-gray-50",
                                        ].join(" ")}
                                    >
                                        <input
                                            type="radio"
                                            name="template-type"
                                            className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selected === opt.id}
                                            onChange={() => setSelected(opt.id)}
                                            aria-describedby={`${opt.id}-desc`}
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                {opt.label}
                                            </div>
                                            <p id={`${opt.id}-desc`} className="text-sm text-gray-500">
                                                {opt.description}
                                            </p>
                                        </div>

                                        {opt.id === "safety" && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); onViewSaved?.(); }}
                                                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ring-1 ring-gray-300 hover:bg-gray-50"
                                                aria-label="View saved safety checklists"
                                            >
                                                View saved
                                            </button>
                                        )}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </fieldset>

                    <div className="flex items-center justify-end gap-3 p-4">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!selected}
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 enabled:hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---------- Usage example ----------
// <TemplateTypeStep onNext={(type) => {
//   // route to Step 2 with selected type
//   // e.g., navigate(`/setup?type=${type}`)
// }} />
