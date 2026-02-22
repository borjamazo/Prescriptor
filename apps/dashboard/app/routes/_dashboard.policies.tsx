import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { requireSuperAdmin } from "~/lib/auth.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Header } from "~/components/layout/Header";
import { PageWrapper } from "~/components/layout/PageWrapper";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Select } from "~/components/ui/Select";
import { Badge } from "~/components/ui/Badge";
import { Modal } from "~/components/ui/Modal";
import { RichTextEditor } from "~/components/forms/RichTextEditor";
import { formatDateTime } from "~/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { LegalDocument, LegalDocumentType } from "~/types";

export const meta: MetaFunction = () => [
  { title: "Políticas legales — Prescriptor Admin" },
];

const documentSchema = z.object({
  type: z.enum(["terms_of_service", "privacy_policy"]),
  version: z.string().min(1, "La versión es requerida").regex(/^\d+\.\d+\.\d+$/, "Formato: 1.0.0"),
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(10, "El contenido es demasiado corto"),
  publish: z.coerce.boolean().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { headers } = await requireSuperAdmin(request);
  const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
  const supabase = createSupabaseServiceClient();

  const { data: documents, error } = await supabase
    .from("legal_documents")
    .select("*")
    .order("type")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return Response.json({ documents: documents as LegalDocument[] }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
  const supabase = createSupabaseServiceClient();
  const formData = await request.formData();

  const intent = formData.get("intent");

  if (intent === "publish") {
    const id = formData.get("id") as string;
    const type = formData.get("type") as LegalDocumentType;

    // Deactivate all docs of this type, then activate this one
    await supabase
      .from("legal_documents")
      .update({ is_active: false })
      .eq("type", type);

    const { error } = await supabase
      .from("legal_documents")
      .update({ is_active: true, published_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json({ success: true, message: "Documento publicado" }, { headers });
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;
    const { error } = await supabase
      .from("legal_documents")
      .delete()
      .eq("id", id)
      .eq("is_active", false); // Prevent deleting active docs
    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json({ success: true, message: "Documento eliminado" }, { headers });
  }

  const parsed = documentSchema.safeParse({
    type: formData.get("type"),
    version: formData.get("version"),
    title: formData.get("title"),
    content: formData.get("content"),
    publish: formData.get("publish") === "true",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return Response.json(
      { error: "Datos inválidos", fieldErrors },
      { status: 400, headers }
    );
  }

  const { type, version, title, content, publish } = parsed.data;

  if (publish) {
    // Deactivate existing active doc of this type
    await supabase
      .from("legal_documents")
      .update({ is_active: false })
      .eq("type", type);
  }

  const { error } = await supabase.from("legal_documents").insert({
    type,
    version,
    title,
    content,
    is_active: publish ?? false,
    published_at: publish ? new Date().toISOString() : null,
    created_by: profile.id,
  });

  if (error) return Response.json({ error: error.message }, { status: 400, headers });
  return Response.json(
    { success: true, message: publish ? "Documento creado y publicado" : "Documento guardado como borrador" },
    { headers }
  );
}

const DOC_TYPE_LABELS: Record<LegalDocumentType, string> = {
  terms_of_service: "Términos de Servicio",
  privacy_policy: "Política de Privacidad",
};

export default function PoliciesPage() {
  const { documents } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [editorOpen, setEditorOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<LegalDocument | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorForm, setEditorForm] = useState({
    type: "terms_of_service" as LegalDocumentType,
    version: "",
    title: "",
  });

  useEffect(() => {
    if (actionData && "message" in actionData) {
      toast.success(actionData.message);
      setEditorOpen(false);
    } else if (actionData && "error" in actionData) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const byType = (type: LegalDocumentType) =>
    documents.filter((d: LegalDocument) => d.type === type);

  return (
    <>
      <Header
        title="Políticas legales"
        subtitle="Gestión de Términos de Servicio y Política de Privacidad"
        actions={
          <Button onClick={() => { setEditorOpen(true); setEditorContent(""); }}>
            + Nueva versión
          </Button>
        }
      />

      <PageWrapper>
        {(["terms_of_service", "privacy_policy"] as LegalDocumentType[]).map((type) => (
          <div
            key={type}
            className="mb-8 rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800"
          >
            <div className="border-b border-surface-200 px-6 py-4 dark:border-surface-700">
              <h2 className="font-semibold text-surface-900 dark:text-surface-100">
                {DOC_TYPE_LABELS[type]}
              </h2>
            </div>
            {byType(type).length === 0 ? (
              <p className="px-6 py-8 text-sm text-surface-400">Sin documentos</p>
            ) : (
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                {byType(type).map((doc: LegalDocument) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      {doc.is_active ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="gray">Borrador</Badge>
                      )}
                      <div>
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                          {doc.title}
                          <span className="ml-2 text-xs text-surface-400">v{doc.version}</span>
                        </p>
                        <p className="text-xs text-surface-500">
                          {doc.published_at
                            ? `Publicado: ${formatDateTime(doc.published_at)}`
                            : `Creado: ${formatDateTime(doc.created_at)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        Vista previa
                      </Button>
                      {!doc.is_active && (
                        <>
                          <form method="post">
                            <input type="hidden" name="intent" value="publish" />
                            <input type="hidden" name="id" value={doc.id} />
                            <input type="hidden" name="type" value={doc.type} />
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                              Publicar
                            </Button>
                          </form>
                          <form method="post">
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="id" value={doc.id} />
                            <Button
                              type="submit"
                              variant="danger"
                              size="sm"
                              disabled={isSubmitting}
                            >
                              Eliminar
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </PageWrapper>

      {/* Editor Modal */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title="Nueva versión de documento"
        size="xl"
      >
        <form method="post" className="space-y-4">
          <input type="hidden" name="content" value={editorContent} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo"
              name="type"
              value={editorForm.type}
              onChange={(e) =>
                setEditorForm((f) => ({ ...f, type: e.target.value as LegalDocumentType }))
              }
              options={[
                { value: "terms_of_service", label: "Términos de Servicio" },
                { value: "privacy_policy", label: "Política de Privacidad" },
              ]}
              error={"fieldErrors" in (actionData ?? {}) ? (actionData as { fieldErrors?: Record<string, string[]> })?.fieldErrors?.type?.[0] : undefined}
            />
            <Input
              label="Versión (ej: 1.2.0)"
              name="version"
              placeholder="1.0.0"
              value={editorForm.version}
              onChange={(e) => setEditorForm((f) => ({ ...f, version: e.target.value }))}
              error={"fieldErrors" in (actionData ?? {}) ? (actionData as { fieldErrors?: Record<string, string[]> })?.fieldErrors?.version?.[0] : undefined}
            />
          </div>
          <Input
            label="Título"
            name="title"
            placeholder="Términos de Servicio"
            value={editorForm.title}
            onChange={(e) => setEditorForm((f) => ({ ...f, title: e.target.value }))}
            error={"fieldErrors" in (actionData ?? {}) ? (actionData as { fieldErrors?: Record<string, string[]> })?.fieldErrors?.title?.[0] : undefined}
          />
          <RichTextEditor
            label="Contenido"
            value={editorContent}
            onChange={setEditorContent}
            placeholder="Escribe el contenido del documento…"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => {
                const form = document.querySelector("form");
                const publishInput = form?.querySelector("input[name='publish']") as HTMLInputElement | null;
                if (publishInput) publishInput.value = "false";
              }}
            >
              Guardar borrador
            </Button>
            <input type="hidden" name="publish" value="true" />
            <Button type="submit" loading={isSubmitting}>
              Publicar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={`${previewDoc?.title} — v${previewDoc?.version}`}
        size="xl"
      >
        {previewDoc && (
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: previewDoc.content }}
          />
        )}
      </Modal>
    </>
  );
}
