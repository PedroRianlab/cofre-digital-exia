"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brand } from '@/components/layout/vault-layout';
import { SubmitLabel } from '@/components/feedback/states';
import { simulate } from '@/providers/mock-vault-provider';
import { validPassword } from '@/features/auth/auth.validation';

export function LoginPage({ onSubmit }: { onSubmit: () => void }) {
 const [mode, setMode] = useState('login'); const [show, setShow] = useState(false);
 const { register, handleSubmit, clearErrors, formState: {errors, isSubmitting} } = useForm<{email: string; password: string}>();
 return <div className="flex min-h-screen flex-col px-6"><header className="px-2 py-8 md:px-8"><Brand/></header><main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center pb-14"><div className="mb-9 text-center"><h1 className="text-[32px] font-medium">O cofre</h1><p className="mt-3 font-reading text-base text-muted-foreground">Notas e arquivos, com discrição.</p></div><Tabs value={mode} onValueChange={(value) => {setMode(value); clearErrors();}}><TabsList className="mb-7 grid h-12 w-full grid-cols-2 rounded-md"><TabsTrigger value="login" className="h-10 rounded-sm">Entrar</TabsTrigger><TabsTrigger value="signup" className="h-10 rounded-sm">Criar conta</TabsTrigger></TabsList></Tabs><form className="space-y-5" onSubmit={handleSubmit(async () => {await simulate(); toast.success(mode === 'login' ? 'Entrada simulada com sucesso.' : 'Cadastro simulado com sucesso.'); onSubmit();})}><div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" className="mt-2 h-12" {...register('email', {required:'Informe seu e-mail.', pattern: {value: /^\S+@\S+\.\S+$/, message:'Informe um e-mail válido.'}})}/>{errors.email && <p role="alert" className="mt-2 text-xs text-destructive">{errors.email.message}</p>}</div><div><Label htmlFor="password">Senha</Label><div className="relative mt-2"><Input id="password" type={show ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder={mode === 'signup' ? 'Crie sua senha' : 'Sua senha'} className="h-12 pr-12" {...register('password', {required:'Informe sua senha.', validate: (value) => mode !== 'signup' || validPassword(value) || 'A senha deve ter de 8 a 128 caracteres.'})}/><Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1.5 text-muted-foreground" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)}>{show ? <EyeOff/> : <Eye/>}</Button></div>{mode === 'signup' && <p className="mt-2 text-xs text-muted-foreground">De 8 a 128 caracteres.</p>}{errors.password && <p role="alert" className="mt-2 text-xs text-destructive">{errors.password.message}</p>}</div><Button className="mt-2 w-full" type="submit" disabled={isSubmitting}><SubmitLabel busy={isSubmitting}>{mode === 'signup' ? 'Criar conta' : 'Entrar'}<ArrowRight/></SubmitLabel></Button></form><p className="mt-8 text-center text-[11px] leading-5 text-muted-foreground">Acesso local, sem autenticação. Não use dados confidenciais.</p></main><footer className="pb-7 text-center font-reading text-xs text-muted-foreground">Privacidade em primeiro lugar.</footer></div>;
}
