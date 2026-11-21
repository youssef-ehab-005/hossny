import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, X, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  listAdmins,
  createAdmin,
  deleteAdmin,
  updateAdminPassword,
} from "@/lib/admin-users.functions";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

const field =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold";

function AdminUsers() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { t } = useI18n();
  const fetchAdmins = useServerFn(listAdmins);
  const doCreate = useServerFn(createAdmin);
  const doDelete = useServerFn(deleteAdmin);
  const doUpdatePw = useServerFn(updateAdminPassword);

  const [creating, setCreating] = useState(false);
  const [pwFor, setPwFor] = useState<string | null>(null);

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchAdmins(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });

  const create = useMutation({
    mutationFn: (input: { email: string; password: string; full_name: string }) =>
      doCreate({ data: input }),
    onSuccess: () => {
      invalidate();
      setCreating(false);
      toast.success(t("admin.users.created"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => doDelete({ data: { userId } }),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.users.deleted"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updatePw = useMutation({
    mutationFn: (input: { userId: string; password: string }) => doUpdatePw({ data: input }),
    onSuccess: () => {
      setPwFor(null);
      toast.success(t("admin.users.pwUpdated"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">{t("admin.users.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.users.subtitle")}</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground"
        >
          <Plus className="h-4 w-4" /> {t("admin.users.add")}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (admins ?? []).length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("admin.users.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("admin.users.name")}</th>
                  <th className="px-4 py-3">{t("admin.users.email")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(admins ?? []).map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-gold" />
                        <span className="font-medium">{a.full_name || "—"}</span>
                        {a.id === user?.id && (
                          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] text-gold">
                            {t("admin.users.you")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setPwFor(a.id)}
                          className="rounded-lg border border-border p-2 hover:border-gold hover:text-gold"
                          aria-label="Reset password"
                          title={t("admin.users.resetPw")}
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        {a.id !== user?.id && (
                          <button
                            onClick={() => {
                              if (confirm(t("admin.users.confirmDelete"))) remove.mutate(a.id);
                            }}
                            className="rounded-lg border border-border p-2 hover:border-destructive hover:text-destructive"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && (
        <Modal title={t("admin.users.add")} onClose={() => setCreating(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                email: String(fd.get("email") ?? ""),
                password: String(fd.get("password") ?? ""),
                full_name: String(fd.get("full_name") ?? ""),
              });
            }}
            className="space-y-4"
          >
            <Labeled label={t("admin.users.name")}>
              <input name="full_name" className={field} />
            </Labeled>
            <Labeled label={t("admin.users.email")}>
              <input required type="email" name="email" className={field} />
            </Labeled>
            <Labeled label={t("admin.users.password")}>
              <input required type="password" name="password" minLength={6} className={field} />
            </Labeled>
            <SubmitRow saving={create.isPending} onClose={() => setCreating(false)} t={t} />
          </form>
        </Modal>
      )}

      {pwFor && (
        <Modal title={t("admin.users.resetPw")} onClose={() => setPwFor(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              updatePw.mutate({ userId: pwFor, password: String(fd.get("password") ?? "") });
            }}
            className="space-y-4"
          >
            <Labeled label={t("admin.users.newPassword")}>
              <input required type="password" name="password" minLength={6} className={field} />
            </Labeled>
            <SubmitRow saving={updatePw.isPending} onClose={() => setPwFor(null)} t={t} />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitRow({
  saving,
  onClose,
  t,
}: {
  saving: boolean;
  onClose: () => void;
  t: (k: string) => string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="submit"
        disabled={saving}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} {t("common.save")}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-border px-5 text-xs font-medium uppercase tracking-luxe"
      >
        {t("common.cancel")}
      </button>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto bg-background p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

