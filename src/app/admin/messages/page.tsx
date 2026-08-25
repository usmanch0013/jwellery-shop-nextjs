import { getAdminMessages } from "@/lib/admin/queries";

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Contact messages</h1>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-muted-foreground">No messages yet</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className="border border-border rounded-lg p-4 bg-background"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {m.email}
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString("en-PK")}
                </p>
              </div>
              {m.subject && (
                <p className="text-sm font-medium mt-2">{m.subject}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                {m.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
