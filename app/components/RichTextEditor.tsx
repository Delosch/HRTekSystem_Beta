import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered,
    Quote, Undo, Redo, Table as TableIcon, Image as ImageIcon,
    Link as LinkIcon, AlignLeft, AlignCenter, AlignRight,
    Heading1, Heading2, Heading3, Palette, Highlighter
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Image,
            Link.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const setColor = () => {
        const color = window.prompt('Enter color (e.g., #ff0000):');
        if (color) {
            editor.chain().focus().setColor(color).run();
        }
    };

    const setHighlight = () => {
        const color = window.prompt('Enter highlight color (e.g., #ffff00):');
        if (color) {
            editor.chain().focus().setHighlight({ color }).run();
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
                {/* Text Formatting */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-300' : ''}`}
                        title="Code"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                </div>

                {/* Headings */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </button>
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                </div>

                {/* Alignment */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
                        title="Align Left"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
                        title="Align Center"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
                        title="Align Right"
                    >
                        <AlignRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Table */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        className="p-2 rounded hover:bg-gray-200"
                        title="Insert Table"
                    >
                        <TableIcon className="w-4 h-4" />
                    </button>
                    {editor.isActive('table') && (
                        <>
                            <button
                                onClick={() => editor.chain().focus().addColumnBefore().run()}
                                className="px-2 py-1 text-xs rounded hover:bg-gray-200"
                                title="Add Column Before"
                            >
                                +Col
                            </button>
                            <button
                                onClick={() => editor.chain().focus().addRowBefore().run()}
                                className="px-2 py-1 text-xs rounded hover:bg-gray-200"
                                title="Add Row Before"
                            >
                                +Row
                            </button>
                            <button
                                onClick={() => editor.chain().focus().deleteTable().run()}
                                className="px-2 py-1 text-xs rounded hover:bg-red-200 text-red-700"
                                title="Delete Table"
                            >
                                Del
                            </button>
                        </>
                    )}
                </div>

                {/* Media & Links */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                        onClick={addImage}
                        className="p-2 rounded hover:bg-gray-200"
                        title="Insert Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={setLink}
                        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
                        title="Insert Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Colors */}
                <div className="flex gap-1 border-r border-gray-300 pr-2">
                    <button
                        onClick={setColor}
                        className="p-2 rounded hover:bg-gray-200"
                        title="Text Color"
                    >
                        <Palette className="w-4 h-4" />
                    </button>
                    <button
                        onClick={setHighlight}
                        className="p-2 rounded hover:bg-gray-200"
                        title="Highlight"
                    >
                        <Highlighter className="w-4 h-4" />
                    </button>
                </div>

                {/* Undo/Redo */}
                <div className="flex gap-1">
                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Custom Styles for Tables */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1rem 0;
        }

        .ProseMirror td,
        .ProseMirror th {
          min-width: 1em;
          border: 2px solid #ced4da;
          padding: 0.5rem;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }

        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f8f9fa;
        }

        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #6b7280;
        }

        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }

        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}} />
        </div>
    );
}
