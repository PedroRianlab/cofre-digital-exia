import axios from "axios";

const messagesByStatus: Record<number, string> = {
  400: "Arquivo ou requisição inválida.",
  401: "Sua sessão expirou. Entre novamente.",
  404: "Arquivo não encontrado.",
  413: "O arquivo ultrapassa o limite permitido.",
  415: "Tipo de arquivo não permitido.",
  429: "Muitos envios em pouco tempo. Aguarde e tente novamente.",
  500: "Erro interno do servidor. Tente novamente.",
};

export function getFileErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return "Não foi possível concluir a operação.";
  }

  if (!error.response) {
    return "Não foi possível conectar à API.";
  }

  return (
    messagesByStatus[error.response.status] ??
    "Não foi possível concluir a operação."
  );
}
