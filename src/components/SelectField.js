import { useState } from 'react';
import { Modal, Pressable, FlatList, SafeAreaView, Text, TextInput, View } from 'react-native';
import { ui } from '../styles/ui';
import Button from './Button';

export default function SelectField({ label, value, onChange, options, placeholder = 'Selecione', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const normalize = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const selected = options.find((item) => item.value === value);
  return <View style={ui.field}>
    <Text style={ui.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} style={[ui.select, disabled && { opacity: 0.6 }]} onPress={() => { setSearch(''); setOpen(true); }}>
      <Text style={ui.body}>{selected?.label || placeholder} ▾</Text>
    </Pressable>
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F1F1' }}>
        <View style={{ flex: 1, padding: 24 }}>
          <Text style={ui.heading}>{label}</Text>
          <TextInput accessibilityLabel={`Buscar ${label.toLowerCase()}`} placeholder="Buscar…" value={search} onChangeText={setSearch} style={ui.search} />
          <FlatList keyboardShouldPersistTaps="handled" data={options.filter((item) => normalize(item.label).includes(normalize(search)))} keyExtractor={(item) => String(item.value)} ListEmptyComponent={<Text style={ui.body}>Nenhuma opção encontrada.</Text>} renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityState={{ selected: item.value === value }} onPress={() => { onChange(item.value); setOpen(false); }} style={ui.option}><Text style={ui.body}>{item.label}{item.value === value ? ' ✓' : ''}</Text></Pressable>} />
          <Button title="Fechar" onPress={() => setOpen(false)} />
        </View>
      </SafeAreaView>
    </Modal>
  </View>;
}
