"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface SemesterSelectorProps {
    semesters: { id: string; name: string }[];
    selectedId: string;
}

export default function SemesterSelector({ semesters, selectedId }: SemesterSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("semesterId", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <select className="form-select" style={{ width: "auto", minWidth: 200 }} value={selectedId} onChange={handleChange}>
            {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                    {s.name}
                </option>
            ))}
        </select>
    );
}
