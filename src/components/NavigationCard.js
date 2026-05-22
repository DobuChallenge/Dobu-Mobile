import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../styles/tema';

export default function NavigationCard({ title, description, icon, onPress, highlight = false }) {
  const empty = !title && !description;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        highlight && styles.highlightCard,
        empty && styles.emptyCard,
        pressed && styles.pressionado,
      ]}
    >
      {!empty ? (
        <>
          <View style={[styles.icon, highlight && styles.highlightIcon]}>
            <Ionicons name={icon} size={26} color={cores.branco} />
          </View>
          <Text style={[styles.title, highlight && styles.lightText]}>{title}</Text>
          {description ? <Text style={[styles.description, highlight && styles.lightDescription]}>{description}</Text> : null}
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '46%',
    minHeight: 145,
    borderRadius: 12,
    backgroundColor: cores.areia,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightCard: {
    backgroundColor: cores.principal,
  },
  emptyCard: {
    justifyContent: 'center',
  },
  pressionado: {
    opacity: 0.82,
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  highlightIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    color: cores.branco,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  lightText: {
    color: cores.branco,
  },
  description: {
    color: cores.branco,
    fontSize: 15,
    marginTop: 7,
    lineHeight: 18,
    textAlign: 'center',
  },
  lightDescription: {
    color: cores.branco,
  },
});
