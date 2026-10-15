export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  })
    .format(new Date(`${date}T12:00:00`))
    .replace(".", "");
}
