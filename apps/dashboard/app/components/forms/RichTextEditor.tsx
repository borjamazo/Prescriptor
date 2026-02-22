import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "~/lib/utils";
import type { MouseEvent } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
}

interface ToolbarButtonProps {
  active?: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ active, onClick, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "rounded p-1.5 text-sm transition-colors",
        active
          ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
          : "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe el contenido aquí…",
  className,
  label,
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none dark:prose-invert",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <div
        className={cn(
          "rounded-xl border bg-white dark:bg-surface-800",
          error
            ? "border-red-400"
            : "border-surface-300 dark:border-surface-600"
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 border-b border-surface-200 p-2 dark:border-surface-700">
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
            active={editor.isActive("bold")}
            title="Negrita"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
            active={editor.isActive("italic")}
            title="Cursiva"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
            active={editor.isActive("underline")}
            title="Subrayado"
          >
            <u>U</u>
          </ToolbarButton>
          <div className="w-px bg-surface-200 dark:bg-surface-700" />
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
            active={editor.isActive("heading", { level: 1 })}
            title="H1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
            active={editor.isActive("heading", { level: 2 })}
            title="H2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}
            active={editor.isActive("heading", { level: 3 })}
            title="H3"
          >
            H3
          </ToolbarButton>
          <div className="w-px bg-surface-200 dark:bg-surface-700" />
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
            active={editor.isActive("bulletList")}
            title="Lista"
          >
            •—
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
            active={editor.isActive("orderedList")}
            title="Lista numerada"
          >
            1.
          </ToolbarButton>
          <div className="w-px bg-surface-200 dark:bg-surface-700" />
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
            active={editor.isActive("blockquote")}
            title="Cita"
          >
            "
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor.chain().focus().setHorizontalRule().run(); }}
            title="Separador"
          >
            —
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
