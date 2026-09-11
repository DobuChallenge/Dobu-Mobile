import { StyleSheet } from 'react-native';
import { cores } from './tema';

export const ui = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '800', color: cores.texto, marginBottom: 16 },
  title: { fontSize: 19, fontWeight: '800', color: cores.texto, marginBottom: 8 },
  body: { color: cores.texto, fontSize: 16, lineHeight: 24, marginBottom: 8 },
  caption: { color: '#69645F', fontSize: 14, lineHeight: 21, marginBottom: 8 },
  label: { color: cores.texto, fontSize: 15, fontWeight: '800', marginBottom: 7 },
  field: { marginBottom: 18 },
  select: { minHeight: 52, padding: 14, backgroundColor: cores.branco, borderRadius: 8, justifyContent: 'center' },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: cores.cinza, minHeight: 52 },
  search: { backgroundColor: cores.branco, minHeight: 52, padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 16, color: cores.texto },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  actions: { gap: 12, marginTop: 12, marginBottom: 16 },
  state: { padding: 24, alignItems: 'center', gap: 12 },
  error: { color: '#A62424', fontSize: 15, lineHeight: 22, marginBottom: 14 },
  badge: { color: cores.texto, alignSelf: 'flex-start', backgroundColor: cores.amareloClaro, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 12, fontWeight: '700' },
});
