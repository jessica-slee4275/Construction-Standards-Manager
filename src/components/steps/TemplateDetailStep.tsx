import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TemplateType } from "./TemplateTypeStep";
import safetyChecklists from "../../data/safetyChecklists.json";

type Category = "school" | "apartment" | "commercial";
type CatForKey = Category | "default";

interface TemplateItem {
    title: string;
    subtitle: string;
    checklist: string[];
}

interface Props {
    type: TemplateType; // "safety" 기대
    onBack: () => void;
    onCreate?: (payload: {
        category: Category | "all";
        selectedItems: Array<{ title: string; items: string[] }>;
    }) => void;
    defaultCategory?: Category | "all";
}

// 고유 키(카테고리/Default + 제목)
const makeKey = (cat: CatForKey, title: string) => `${cat}::${title}`;

// 단일 카테고리일 때: default + category 병합(중복 제거)
function mergeWithDefaultSingle(cat: Category): TemplateItem[] {
    const base = (safetyChecklists["default"] || []) as TemplateItem[];
    const own = (safetyChecklists[cat] || []) as TemplateItem[];
    const map = new Map<string, TemplateItem>();
    [...base, ...own].forEach((t) => map.set(t.title, t));
    return Array.from(map.values());
}

export default function TemplateDetailStep({
    type,
    onBack,
    onCreate,
    defaultCategory = "school",
}: Props) {
    const [category, setCategory] = useState<Category | "all">(defaultCategory);

    // 가드
    if (type !== "safety") {
        return (
            <div className="p-6">
                <p className="text-sm text-gray-600">
                    This step currently supports only the <b>Safety Checklist</b> type.
                </p>
                <button
                    className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={onBack}
                >
                    Back
                </button>
            </div>
        );
    }

    const ALL_CATS: Category[] = ["school", "apartment", "commercial"];
    const defaults = useMemo(
        () => ((safetyChecklists["default"] || []) as TemplateItem[]),
        []
    );
    const defaultTitleSet = useMemo(
        () => new Set(defaults.map((t) => t.title)),
        [defaults]
    );

    // 렌더용 데이터:
    // - All: Default 섹션은 따로 한 번만, 각 카테고리에는 default 제외
    // - 단일: default+카테고리 병합 목록
    const dataByCategory: Record<Category, TemplateItem[]> = useMemo(() => {
        if (category === "all") {
            return {
                school: ((safetyChecklists["school"] || []) as TemplateItem[]).filter(
                    (t) => !defaultTitleSet.has(t.title)
                ),
                apartment: ((safetyChecklists["apartment"] ||
                    []) as TemplateItem[]).filter((t) => !defaultTitleSet.has(t.title)),
                commercial: ((safetyChecklists["commercial"] ||
                    []) as TemplateItem[]).filter((t) => !defaultTitleSet.has(t.title)),
            };
        }
        return {
            school:
                category === "school" ? mergeWithDefaultSingle("school") : [],
            apartment:
                category === "apartment" ? mergeWithDefaultSingle("apartment") : [],
            commercial:
                category === "commercial" ? mergeWithDefaultSingle("commercial") : [],
        };
    }, [category, defaultTitleSet]);

    const categoriesToRender: Category[] =
        category === "all" ? ALL_CATS : [category];

    // (templateKey -> itemIdx -> checked)
    const [checked, setChecked] = useState<
        Record<string, Record<number, boolean>>
    >({});

    // 초기 선택 상태 (카테고리 변경 시 한 번만)
    const initDoneRef = useRef<Record<string, boolean>>({});
    useEffect(() => {
        if (initDoneRef.current[String(category)]) return;

        const next: Record<string, Record<number, boolean>> = {};

        if (category === "all") {
            // Default 블록: 모두 true
            defaults.forEach((tpl) => {
                const key = makeKey("default", tpl.title);
                next[key] = Object.fromEntries(
                    tpl.checklist.map((_, i) => [i, true])
                );
            });
            // 각 카테고리 고유 블록: 모두 false
            ALL_CATS.forEach((cat) => {
                (dataByCategory[cat] || []).forEach((tpl) => {
                    const key = makeKey(cat, tpl.title);
                    next[key] = Object.fromEntries(
                        tpl.checklist.map((_, i) => [i, false])
                    );
                });
            });
        } else {
            // 단일 카테고리: default 항목은 true, 나머지 false
            (dataByCategory[category] || []).forEach((tpl) => {
                const key = makeKey(category, tpl.title);
                const isDefault = defaultTitleSet.has(tpl.title);
                next[key] = Object.fromEntries(
                    tpl.checklist.map((_, i) => [i, isDefault])
                );
            });
        }

        setChecked(next);
        initDoneRef.current[String(category)] = true;
    }, [category, dataByCategory, defaults, defaultTitleSet]);

    // 토글/전체선택
    const toggleItem = (templateKey: string, idx: number) => {
        setChecked((prev) => ({
            ...prev,
            [templateKey]: {
                ...(prev[templateKey] || {}),
                [idx]: !(prev[templateKey]?.[idx] ?? false),
            },
        }));
    };

    const setAllForTemplate = (
        templateKey: string,
        total: number,
        value: boolean
    ) => {
        setChecked((prev) => ({
            ...prev,
            [templateKey]: Object.fromEntries(
                Array.from({ length: total }, (_, i) => [i, value])
            ),
        }));
    };

    const handleCreate = () => {
        const selected: Array<{ title: string; items: string[] }> = [];

        // Default 섹션 (All일 때만)
        if (category === "all") {
            defaults.forEach((tpl) => {
                const key = makeKey("default", tpl.title);
                const picks = tpl.checklist.filter((_, i) => checked[key]?.[i]);
                if (picks.length) selected.push({ title: tpl.title, items: picks });
            });
        }

        // 카테고리 섹션
        categoriesToRender.forEach((c) => {
            (dataByCategory[c] || []).forEach((tpl) => {
                const key = makeKey(c, tpl.title);
                const picks = tpl.checklist.filter((_, i) => checked[key]?.[i]);
                if (picks.length) selected.push({ title: tpl.title, items: picks });
            });
        });

        onCreate?.({ category, selectedItems: selected });
    };

    return (
        <div className="min-h-screen w-full bg-white p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Safety Checklist
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Choose a building category. Default safety items are automatically
                            included.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleCreate}
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                        >
                            Create Template
                        </button>
                    </div>
                </div>

                {/* Category Picker */}
                <div className="flex flex-wrap gap-2">
                    {([
                        { id: "school", label: "School" },
                        { id: "apartment", label: "Apartment" },
                        { id: "commercial", label: "Commercial" },
                        { id: "all", label: "All" },
                    ] as const).map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setCategory(c.id as Category | "all")}
                            className={[
                                "px-4 py-2 rounded-full text-sm font-medium ring-1",
                                category === c.id
                                    ? "bg-blue-600 text-white ring-blue-600"
                                    : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50",
                            ].join(" ")}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* All: Default 섹션 한 번만 */}
                {category === "all" && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-900 mt-2">
                            Default (applies to all)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {defaults.map((tpl) => {
                                const templateKey = makeKey("default", tpl.title);
                                return (
                                    <div
                                        key={templateKey}
                                        className="rounded-2xl border border-gray-200 p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                                    {tpl.title}
                                                    <span className="ml-1 px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                                        Default
                                                    </span>
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {tpl.subtitle}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    className="text-xs px-2 py-1 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                                                    onClick={() =>
                                                        setAllForTemplate(
                                                            templateKey,
                                                            tpl.checklist.length,
                                                            true
                                                        )
                                                    }
                                                >
                                                    Select all
                                                </button>
                                                <button
                                                    className="text-xs px-2 py-1 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                                                    onClick={() =>
                                                        setAllForTemplate(
                                                            templateKey,
                                                            tpl.checklist.length,
                                                            false
                                                        )
                                                    }
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>

                                        <ul className="mt-3 space-y-2">
                                            {tpl.checklist.map((item, idx) => (
                                                <li key={idx}>
                                                    <label className="flex items-start gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 h-4 w-4"
                                                            checked={!!checked[templateKey]?.[idx]}
                                                            onChange={() => toggleItem(templateKey, idx)}
                                                        />
                                                        <span className="text-sm">{item}</span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 카테고리 섹션들 */}
                {categoriesToRender.map((c) => (
                    <div key={c} className="space-y-3">
                        {category === "all" && (
                            <h2 className="text-lg font-semibold text-gray-900 mt-4">{c}</h2>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {(dataByCategory[c] || []).map((tpl) => {
                                const templateKey = makeKey(c, tpl.title);
                                const isDefaultTitle = defaultTitleSet.has(tpl.title);

                                return (
                                    <div
                                        key={templateKey}
                                        className="rounded-2xl border border-gray-200 p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                                    {tpl.title}
                                                    {isDefaultTitle && (
                                                        <span className="ml-1 px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {tpl.subtitle}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    className="text-xs px-2 py-1 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                                                    onClick={() =>
                                                        setAllForTemplate(
                                                            templateKey,
                                                            tpl.checklist.length,
                                                            true
                                                        )
                                                    }
                                                >
                                                    Select all
                                                </button>
                                                <button
                                                    className="text-xs px-2 py-1 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                                                    onClick={() =>
                                                        setAllForTemplate(
                                                            templateKey,
                                                            tpl.checklist.length,
                                                            false
                                                        )
                                                    }
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>

                                        <ul className="mt-3 space-y-2">
                                            {tpl.checklist.map((item, idx) => (
                                                <li key={idx}>
                                                    <label className="flex items-start gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 h-4 w-4 border-gray-300"
                                                            checked={!!checked[templateKey]?.[idx]}
                                                            onChange={() => toggleItem(templateKey, idx)}
                                                        />
                                                        <span className="text-sm text-gray-800">
                                                            {item}
                                                        </span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
