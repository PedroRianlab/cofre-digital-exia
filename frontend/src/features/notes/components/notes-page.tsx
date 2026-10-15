"use client";

import { useState } from 'react';
import { Plus, ArrowLeft, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useMockVault, simulate } from '@/providers/mock-vault-provider';
import type { Note } from '@/features/notes/notes.types';
import { formatDate } from '@/lib/format-date';
import { filterNotes } from '@/features/notes/note-search';
import { PageHeader } from '@/components/layout/page-header';
import { NoteCard } from './note-card';
import { NoteSearchField } from './note-search-field';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/states';

export function NotesPage({ onCreate, onEdit }: { onCreate: () => void; onEdit: (id: string) => void }) {
  const { notes, deleteNote } = useMockVault();
  const [selected, setSelected] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [query, setQuery] = useState('');
  const visible = filterNotes(notes, query);
  const searching = query.trim().length > 0;

  return <>{selected ? <><Button variant="ghost" className="mb-7 px-0 text-muted-foreground" onClick={() => setSelected(null)}><ArrowLeft />Todas as notas</Button><PageHeader title={selected.title} description={`${selected.category || 'Sem categoria'} · ${formatDate(selected.date)} de 2026`} action={<Button variant="outline" onClick={() => onEdit(selected.id)}><Pencil />Editar nota</Button>} /><div className="max-w-3xl whitespace-pre-wrap break-words font-reading text-lg leading-9">{selected.content || 'Esta nota ainda não tem conteúdo.'}</div></> : <><PageHeader title="Seu cofre de notas." description="Suas notas, com discrição e segurança." action={<Button onClick={onCreate}><Plus />Nova nota</Button>} /><div className="mb-7"><NoteSearchField value={query} onChange={setQuery} /></div><div className="mb-5 flex items-center justify-between"><span className="text-xs font-medium">{searching ? 'Notas encontradas' : 'Todas as notas'}<span className="ml-2 text-muted-foreground">{visible.length.toString().padStart(2, '0')}</span></span></div>{visible.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map((note) => <NoteCard key={note.id} note={note} onView={() => setSelected(note)} onEdit={() => onEdit(note.id)} onDelete={() => setDeleting(note)} />)}</div> : searching ? <EmptyState title="Nada encontrado" description="Nenhuma nota corresponde à sua busca." action="Limpar busca" onAction={() => setQuery('')} /> : <EmptyState title="Nenhuma nota" description="Suas notas aparecerão aqui." action="Criar uma nota" onAction={onCreate} />}</>}
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Excluir esta nota?" description={`“${deleting?.title ?? ''}” será removida desta coleção. Essa ação não pode ser desfeita.`} onConfirm={async () => { if (!deleting) return; await simulate(); deleteNote(deleting.id); toast.success('Nota excluída.'); }} /></>;
}
