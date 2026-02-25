import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scenariosApi } from "../api/client";
import { Scenario } from "../types";
import Panel from "../components/Panel";
import PageHeader from "../components/PageHeader";
import Btn from "../components/Btn";
import { useI18n } from "../i18n";
import { Plus, Trash2, Zap, Terminal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const inputSt: React.CSSProperties = {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--text-bright)",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
};

export default function Scenarios() {
    const { t } = useI18n();
    const qc = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        msfModule: "",
        payload: "",
        rport: "",
        expectedSignatures: "",
    });

    const { data: scenarios = [], isLoading } = useQuery<Scenario[]>({
        queryKey: ["scenarios"],
        queryFn: () => scenariosApi.list(),
    });

    const createMut = useMutation({
        mutationFn: () =>
            scenariosApi.create({
                name: form.name,
                description: form.description || undefined,
                msfModule: form.msfModule,
                payload: form.payload || undefined,
                rport: form.rport ? parseInt(form.rport) : undefined,
                expectedSignatures: form.expectedSignatures
                    ? form.expectedSignatures
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [],
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["scenarios"] });
            setShowCreate(false);
            setForm({
                name: "",
                description: "",
                msfModule: "",
                payload: "",
                rport: "",
                expectedSignatures: "",
            });
        },
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => scenariosApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["scenarios"] }),
    });

    const Field = ({
        label,
        field,
        placeholder,
    }: {
        label: string;
        field: keyof typeof form;
        placeholder?: string;
    }) => (
        <div>
            <label className="font-mono text-xs uppercase tracking-wider block mb-1.5 text-text-dim">
                {label}
            </label>
            <input
                value={form[field]}
                onChange={(e) =>
                    setForm((p) => ({ ...p, [field]: e.target.value }))
                }
                placeholder={placeholder}
                style={inputSt}
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <PageHeader
                title={t("scenarios")}
                sub="// metasploit attack scenario configurations"
                actions={
                    <Btn size="sm" onClick={() => setShowCreate(!showCreate)}>
                        <Plus size={13} /> {t("newScenario")}
                    </Btn>
                }
            />

            {showCreate && (
                <Panel
                    className="mb-5 p-5"
                    style={{
                        borderColor:
                            "color-mix(in srgb, var(--accent) 30%, transparent)",
                    }}
                >
                    <p
                        className="font-mono text-sm uppercase tracking-widest mb-4"
                        style={{ color: "var(--accent)" }}
                    >
                        // configure scenario
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <Field
                            label={`${t("name")} *`}
                            field="name"
                            placeholder="HTTP Version Scan"
                        />
                        <Field label={t("description")} field="description" />
                        <Field
                            label={`${t("msfModule")} *`}
                            field="msfModule"
                            placeholder="auxiliary/scanner/http/http_version"
                        />
                        <Field
                            label={t("payload")}
                            field="payload"
                            placeholder="windows/x64/meterpreter/reverse_tcp"
                        />
                        <Field
                            label={t("rport")}
                            field="rport"
                            placeholder="80"
                        />
                        <Field
                            label={t("expectedSigs")}
                            field="expectedSignatures"
                            placeholder={t("sigsHint")}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Btn
                            size="sm"
                            onClick={() => createMut.mutate()}
                            disabled={
                                !form.name ||
                                !form.msfModule ||
                                createMut.isPending
                            }
                        >
                            {createMut.isPending ? t("creating") : t("create")}
                        </Btn>
                        <Btn
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCreate(false)}
                        >
                            {t("cancel")}
                        </Btn>
                    </div>
                </Panel>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div
                        className="w-6 h-6 border-2 rounded-full animate-spin"
                        style={{
                            borderColor: "var(--border)",
                            borderTopColor: "var(--accent)",
                        }}
                    />
                </div>
            ) : scenarios.length === 0 ? (
                <div className="text-center py-20">
                    <p className="font-mono text-sm text-text-dim mb-3">
                        {t("noScenarios")}
                    </p>
                    <Btn size="sm" onClick={() => setShowCreate(true)}>
                        <Plus size={13} /> {t("newScenario")}
                    </Btn>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {scenarios.map((s) => (
                        <Panel key={s.id} className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background:
                                                "color-mix(in srgb, var(--warn) 12%, transparent)",
                                            border: "1px solid color-mix(in srgb, var(--warn) 25%, transparent)",
                                        }}
                                    >
                                        <Zap
                                            size={16}
                                            style={{ color: "var(--warn)" }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-mono text-base font-bold text-text-bright">
                                            {s.name}
                                        </p>
                                        <p className="font-mono text-xs text-text-dim uppercase tracking-widest">
                                            SCENARIO
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm(t("deleteScenario")))
                                            deleteMut.mutate(s.id);
                                    }}
                                    className="p-1.5 rounded text-text-dim transition-all hover:text-danger"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div
                                className="space-y-2 pt-3"
                                style={{ borderTop: "1px solid var(--border)" }}
                            >
                                <div className="flex items-start gap-2">
                                    <Terminal
                                        size={12}
                                        className="mt-0.5 flex-shrink-0 text-text-dim"
                                    />
                                    <code
                                        className="font-mono text-sm break-all"
                                        style={{ color: "var(--accent-2)" }}
                                    >
                                        {s.msfModule}
                                    </code>
                                </div>
                                {s.rport && (
                                    <p className="font-mono text-sm text-text-dim">
                                        RPORT:{" "}
                                        <span className="text-text">
                                            {s.rport}
                                        </span>
                                    </p>
                                )}
                                {s.payload && (
                                    <p className="font-mono text-sm text-text-dim">
                                        Payload:{" "}
                                        <span className="text-text">
                                            {s.payload}
                                        </span>
                                    </p>
                                )}
                                {s.expectedSignatures.length > 0 && (
                                    <p className="font-mono text-sm text-text-dim">
                                        {s.expectedSignatures.length} expected
                                        sig(s)
                                    </p>
                                )}
                                <p className="font-mono text-sm text-text-dim">
                                    {formatDistanceToNow(
                                        new Date(s.createdAt),
                                        { addSuffix: true },
                                    )}
                                </p>
                            </div>
                        </Panel>
                    ))}
                </div>
            )}
        </div>
    );
}
