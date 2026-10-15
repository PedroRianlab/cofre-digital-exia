import type { Note } from "./notes.types";

export const initialNotes: Note[] = [
  {
    id: "1",
    title: "Um pouco de calma",
    category: "Pessoal",
    content:
      "Nem todo dia precisa ser extraordinário. Às vezes, um café sem pressa, a janela aberta e alguns minutos de silêncio já são o bastante.\n\nQuero me lembrar de encontrar espaço para essas pequenas coisas.",
    date: "2026-10-15",
  },
  {
    id: "2",
    title: "Ideias que merecem tempo",
    category: "Ideias",
    content:
      "Uma pequena livraria com espaço para café. Um projeto feito com as mãos. Uma viagem sem roteiro fechado.",
    date: "2026-10-14",
  },
  {
    id: "3",
    title: "Para a próxima viagem",
    category: "Viagens",
    content:
      "Levar um caderno pequeno. Caminhar por ruas que não estão no mapa. Experimentar a comida de onde estiver.",
    date: "2026-10-13",
  },
  {
    id: "4",
    title: "O que quero cultivar",
    category: "Pessoal",
    content:
      "Mais conversas à mesa. Mais livros terminados. Menos coisas feitas no automático.",
    date: "2026-10-12",
  },
];
