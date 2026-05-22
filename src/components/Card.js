import { StyleSheet, View } from 'react-native';
import { cores } from '../styles/tema';

export default function Card({ children, style }) {
  return <View style={[styles.cartao, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
