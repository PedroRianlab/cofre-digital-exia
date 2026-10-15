"use client";

import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { SubmitLabel } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Note, NoteFormValues } from "@/features/notes/notes.types";
import { validNote } from "@/features/notes/notes.validation";
import { getApiErrorMessage } from "@/lib/api";

type NoteFormPageProps = {
  note?: Note;
  missing?: boolean;
  onCancel: () => void;
  onSubmit: (value: NoteFormValues) => Promise<void>;
};

export function NoteFormPage({
  note,
  missing,
  onCancel,
  onSubmit,
}: NoteFormPageProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    defaultValues: {
      titulo: note?.titulo ?? "",
      categoria: note?.categoria ?? "",
      conteudo: note?.conteudo ?? "",
    },
  });
  const titulo = useWatch({ control, name: "titulo" }) ?? "";
  const conteudo = useWatch({ control, name: "conteudo" }) ?? "";

  if (missing) {
    return (
      <>
        <PageHeader
          title="Nota não encontrada"
          description="Esta nota não está na sua coleção."
        />
        <Button onClick={onCancel}>
          <ArrowLeft />
          Voltar às notas
        </Button>
      </>
    );
  }

  async function submit(value: NoteFormValues) {
    if (!validNote(value)) return;

    try {
      await onSubmit(value);
      toast.success(note ? "Nota atualizada." : "Nota criada.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="max-w-3xl">
      <Button
        variant="ghost"
        className="mb-6 px-0 text-muted-foreground"
        onClick={onCancel}
      >
        <ArrowLeft />
        Todas as notas
      </Button>

      <PageHeader
        title={note ? "Editar nota" : "Uma nova nota"}
        description="Dê um lugar aos seus pensamentos."
      />

      <form onSubmit={handleSubmit(submit)} className="space-y-7">
        <div>
          <Label htmlFor="titulo">
            Título <span className="text-primary">*</span>
          </Label>
          <Input
            id="titulo"
            placeholder="Um título para lembrar"
            className="mt-2 h-12"
            maxLength={120}
            aria-invalid={!!errors.titulo}
            {...register("titulo", {
              required: "Dê um título à sua nota.",
              validate: (value) =>
                value.trim().length > 0 || "Dê um título à sua nota.",
              maxLength: {
                value: 120,
                message: "Use até 120 caracteres.",
              },
            })}
          />
          <div className="mt-2 flex justify-between text-xs">
            <span
              className="text-destructive"
              role={errors.titulo ? "alert" : undefined}
            >
              {errors.titulo?.message}
            </span>
            <span className="text-muted-foreground">{titulo.length}/120</span>
          </div>
        </div>

        <div>
          <Label htmlFor="categoria">
            Categoria
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              opcional
            </span>
          </Label>
          <Input
            id="categoria"
            className="mt-2 h-12"
            placeholder="Por exemplo: pessoal, ideias, leituras"
            maxLength={50}
            {...register("categoria", {
              maxLength: {
                value: 50,
                message: "Use até 50 caracteres.",
              },
            })}
          />
          {errors.categoria && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {errors.categoria.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="conteudo">Conteúdo</Label>
          <Textarea
            id="conteudo"
            placeholder="Comece por aqui…"
            className="mt-2 min-h-72 resize-y p-5 font-reading text-base leading-8"
            maxLength={10_000}
            {...register("conteudo", {
              maxLength: {
                value: 10_000,
                message: "Use até 10.000 caracteres.",
              },
            })}
          />
          <p className="mt-2 text-right text-xs text-muted-foreground">
            {conteudo.length.toLocaleString("pt-BR")}/10.000
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <SubmitLabel busy={isSubmitting}>
              <Check />
              Salvar
            </SubmitLabel>
          </Button>
        </div>
      </form>
    </div>
  );
}
