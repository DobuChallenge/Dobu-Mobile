import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores } from '../styles/tema';

export default function BottomNavigation({ navigation, active, homeRoute = 'Inicio' }) {
  const insets = useSafeAreaInsets();
  const items = [
    { route: homeRoute, icon: 'home-outline', id: 'home' },
    { route: 'Lembretes', icon: 'notifications-outline', id: 'lembretes' },
    { route: 'PerfilUsuario', icon: 'person-circle-outline', id: 'perfil' },
  ];

  return (
    <View style={[styles.rodape, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => navigation.navigate(item.route)} style={styles.botao}>
          <Ionicons
            name={item.icon}
            size={22}
            color={active === item.id ? cores.branco : '#E8E8E8'}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rodape: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 58,
    backgroundColor: cores.cinzaEscuro,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
  },
  botao: {
    width: 56,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
