import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NoteSearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative w-full md:w-72">
      <label className="sr-only" htmlFor="nota-busca">Buscar nas notas</label>
      <Search aria-hidden="true" size={15} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="nota-busca"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Escape') onChange(''); }}
        placeholder="Buscar nas notas"
        aria-label="Buscar nas notas"
        className="h-11 rounded-md border-border/60 bg-secondary/50 pl-9 pr-9 placeholder:text-muted-foreground focus-visible:border-border focus-visible:bg-card"
      />
      {value && (
        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground" aria-label="Limpar busca" onClick={() => onChange('')}>
          <X size={15} />
        </Button>
      )}
    </div>
  );
}
