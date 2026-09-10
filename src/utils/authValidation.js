export function validateLogin(email, senha) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Digite um email válido.';
  if (!senha.trim()) return 'Informe sua senha.';
  return null;
}

export function validateRegister({ nome, email, senha, tipoUsuario }) {
  if (nome.length < 2) return 'Informe um nome com pelo menos 2 caracteres.';
  const error = validateLogin(email, senha);
  if (error) return error;
  if (senha.length < 6) return 'Use uma senha com pelo menos 6 caracteres.';
  if (!['RESPONSAVEL', 'VETERINARIO'].includes(tipoUsuario)) return 'Selecione o tipo de conta.';
  return null;
}
