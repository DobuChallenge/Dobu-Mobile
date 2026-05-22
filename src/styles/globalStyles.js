import { StyleSheet } from 'react-native';
import { cores, espacamentos } from './tema';

export const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    padding: espacamentos.tela,
    paddingBottom: 104,
    flexGrow: 1,
  },
  titulo: {
    color: cores.marrom,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitulo: {
    color: cores.textoClaro,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 8,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  topoLogo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 14,
  },
});
