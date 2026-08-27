import { getAdminMessages } from "@/lib/admin/queries";
import { AdminCard, AdminEmpty, AdminPageHeader } from "@/components/admin/AdminShell";
import { Mail } from "lucide-react";

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact messages"
        description={`${messages.length} customer inquiries`}
      />

      {messages.length === 0 ? (
        <AdminEmpty
          title="No messages yet"
          description="Contact form submissions will appear here."
        />
      ) : (
        <div className="grid gap-4">
          {messages.map((m) => (
            <AdminCard key={m.id} padding>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{m.name}</p>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-sm text-primary hover:text-emerald-dark"
                    >
                      {m.email}
                    </a>
                    {m.subject && (
                      <p className="text-sm font-medium mt-2">{m.subject}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">
                      {m.message}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString("en-PK")}
                </p>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
