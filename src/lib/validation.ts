// Regras de validação visual do protótipo Lumine.
// Cada função retorna a mensagem de erro ou undefined quando o valor é válido.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** E-mail simulado como "já cadastrado" (comportamento de API fake). */
export const EMAIL_JA_CADASTRADO = "exemplo@lumine.app";

export function validarEmail(value: string): string | undefined {
  if (!value.trim()) return "E-mail é obrigatório";
  if (!EMAIL_REGEX.test(value.trim())) return "Informe um e-mail válido";
  return undefined;
}

export function validarEmailCadastro(value: string): string | undefined {
  const base = validarEmail(value);
  if (base) return base;
  if (value.trim().toLowerCase() === EMAIL_JA_CADASTRADO)
    return "Este e-mail já está cadastrado";
  return undefined;
}

export function validarSenhaObrigatoria(value: string): string | undefined {
  if (!value) return "Senha é obrigatória";
  return undefined;
}

export function validarNovaSenha(value: string): string | undefined {
  if (!value) return "Senha é obrigatória";
  if (value.length < 8) return "A senha deve ter no mínimo 8 caracteres";
  return undefined;
}

export function validarConfirmacaoSenha(
  value: string,
  senha: string
): string | undefined {
  if (!value) return "Confirme sua senha";
  if (value !== senha) return "As senhas não coincidem";
  return undefined;
}

export function validarObrigatorio(
  value: string,
  mensagem: string
): string | undefined {
  if (!value.trim()) return mensagem;
  return undefined;
}

export function validarTelefone(value: string): string | undefined {
  if (!value.trim()) return "Telefone é obrigatório";
  if (value.replace(/\D/g, "").length < 10) return "Informe um telefone válido";
  return undefined;
}

export function validarCnpj(value: string): string | undefined {
  if (!value.trim()) return undefined; // opcional
  if (value.replace(/\D/g, "").length !== 14) return "Informe um CNPJ válido";
  return undefined;
}

export function validarDiasMes(value: string): string | undefined {
  const dias = parseInt(value, 10);
  if (!value.trim() || Number.isNaN(dias) || dias <= 0)
    return "Informe um número de dias maior que zero";
  if (dias > 31) return "O número de dias não pode ser maior que 31";
  return undefined;
}

export function validarHorasDia(value: string): string | undefined {
  const horas = parseFloat(value.replace(",", "."));
  if (!value.trim() || Number.isNaN(horas) || horas <= 0)
    return "Informe uma quantidade de horas maior que zero";
  if (horas > 24) return "O número de horas não pode ser maior que 24";
  return undefined;
}

/** 0 = vazia, 1 = fraca, 2 = média, 3 = forte, 4 = muito forte */
export function computeStrength(password: string): number {
  if (!password) return 0;
  const temMinuscula = /[a-z]/.test(password);
  const temMaiuscula = /[A-Z]/.test(password);
  const temNumero = /\d/.test(password);
  const temSimbolo = /[^A-Za-z0-9]/.test(password);
  const temLetra = temMinuscula || temMaiuscula;

  if (password.length < 8) return 1;
  if (temMaiuscula && temMinuscula && temNumero && temSimbolo)
    return password.length >= 12 ? 4 : 3;
  if (temLetra && temNumero) return 2;
  return 1;
}
