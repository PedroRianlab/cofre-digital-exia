"use client";

import { useState, type ReactNode } from 'react';
import { LockKeyhole, NotebookPen, Files, PanelLeftClose, PanelLeftOpen, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';

export function Brand({ compact = false }: { compact?: boolean }) { return <div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><LockKeyhole size={21} strokeWidth={1.6}/></span>{!compact && <span className="text-[25px] font-medium"> O Cofre<span className="text-primary">.</span></span>}</div>; }

export function VaultLayout({ children, active, onNavigate, onLogout }: { children: ReactNode; active: 'notes' | 'files'; onNavigate: (page: 'notes' | 'files') => void; onLogout: () => void }) {
 const [collapsed, setCollapsed] = useState(false); const [mobile, setMobile] = useState(false); const [logout, setLogout] = useState(false);
 const navigation = [{id: 'notes' as const, title: 'Notas', icon: NotebookPen}, {id: 'files' as const, title: 'Arquivos', icon: Files}];
 return <TooltipProvider><div className="min-h-screen"><header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b bg-background px-5 md:hidden"><Brand/><Button size="icon" variant="ghost" aria-label={mobile ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMobile(!mobile)}>{mobile ? <X/> : <Menu/>}</Button></header>
 <aside className={`${mobile ? 'flex' : 'hidden'} ${collapsed ? 'md:w-20' : 'md:w-60'} fixed bottom-0 left-0 top-20 z-30 w-60 flex-col border-r bg-sidebar px-4 py-6 md:top-0 md:flex md:py-9`}>
 <div className={`hidden md:flex ${collapsed ? 'justify-center' : 'px-3'}`}><Brand compact={collapsed}/></div>
 {!collapsed && <p className="mb-4 mt-14 px-4 text-[10px] font-medium uppercase text-muted-foreground">O cofre</p>}
 <nav className={`space-y-2 ${collapsed ? 'mt-10' : ''}`} aria-label="Navegação principal">{navigation.map((item) => <Tooltip key={item.id}><TooltipTrigger asChild><Button variant={active === item.id ? 'secondary' : 'ghost'} className={`w-full justify-start gap-3 rounded-md ${active === item.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} ${collapsed ? 'justify-center px-0' : 'px-4'}`} aria-current={active === item.id ? 'page' : undefined} onClick={() => { onNavigate(item.id); setMobile(false); }}><item.icon size={19} strokeWidth={1.6}/>{!collapsed && item.title}</Button></TooltipTrigger>{collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}</Tooltip>)}</nav>
 <div className="mt-auto">{!collapsed && <div className="mb-7 px-4"><LockKeyhole size={17} strokeWidth={1.4} className="mb-3 text-muted-foreground"/><p className="font-reading text-[13px] leading-relaxed text-muted-foreground">Privacidade começa<br/>com discrição.</p></div>}
 <div className="border-t pt-5"><div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between'}`}><Button variant="ghost" className={`gap-3 ${collapsed ? 'size-9 justify-center p-0' : 'justify-start px-4'}`} onClick={() => setLogout(true)} aria-label="Sair do cofre"><LogOut className="size-4 shrink-0"/>{!collapsed && <span className="text-xs">Sair</span>}</Button><Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} title={collapsed ? 'Expandir menu' : 'Recolher menu'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen/> : <PanelLeftClose/>}</Button></div></div></div></aside>
 {mobile && <div className="fixed inset-0 top-20 z-20 bg-foreground/20 md:hidden" onClick={() => setMobile(false)}/>}<div className={`${collapsed ? 'md:ml-20' : 'md:ml-60'} flex min-h-[calc(100vh-5rem)] flex-col md:min-h-screen`}><main className="page-enter mx-auto w-full max-w-[1210px] flex-1 px-6 pb-12 pt-10 md:px-12 md:pt-12 lg:px-14">{children}</main><footer className="mx-6 flex flex-wrap items-center justify-between gap-3 border-t py-6 text-[10px] text-muted-foreground md:mx-12 lg:mx-14"><span>Cofre · Privacidade em primeiro lugar.</span><span className="flex items-center gap-1"><LockKeyhole size={12}/>Prévias ocultas</span></footer></div>
 <ConfirmDialog open={logout} onClose={() => setLogout(false)} title="Sair do Cofre?" description="Você voltará à tela de entrada." label="Sair" destructive={false} onConfirm={onLogout}/></div></TooltipProvider>;
}
