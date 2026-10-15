import { FileText, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function CollectionSkeleton() { return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Carregando">{[1,2,3].map((n) => <Skeleton className="h-72 rounded-lg" key={n}/>)}</div>; }
export function EmptyState({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) { return <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center"><FileText size={30} className="text-primary"/><h2 className="text-xl font-medium">{title}</h2><p className="font-reading text-muted-foreground">{description}</p>{onAction && <Button onClick={onAction}>{action}</Button>}</div>; }
export function ErrorState({ onRetry }: { onRetry: () => void }) { return <Alert><AlertTitle>Não foi possível continuar</AlertTitle><AlertDescription className="mt-3"><Button variant="outline" onClick={onRetry}><RefreshCw/>Tentar novamente</Button></AlertDescription></Alert>; }
export function SubmitLabel({ busy, children }: { busy: boolean; children: React.ReactNode }) { return <>{busy && <Loader2 className="animate-spin"/>}{busy ? 'Salvando…' : children}</>; }
