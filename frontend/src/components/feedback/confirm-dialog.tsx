"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SubmitLabel } from './states';
export function ConfirmDialog({ open, onClose, onConfirm, title, description, label = 'Excluir', destructive = true }: { open: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; title: string; description: string; label?: string; destructive?: boolean }) {
 const [busy, setBusy] = useState(false);
 return <Dialog open={open} onOpenChange={(value) => { if (!value && !busy) onClose(); }}><DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-lg"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription className="pt-2 leading-relaxed">{description}</DialogDescription></DialogHeader><DialogFooter className="gap-2"><Button variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button><Button variant={destructive ? 'destructive' : 'default'} disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); onClose(); } finally { setBusy(false); } }}><SubmitLabel busy={busy}>{label}</SubmitLabel></Button></DialogFooter></DialogContent></Dialog>;
}
