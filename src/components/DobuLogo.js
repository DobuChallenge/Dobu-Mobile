import { Image, StyleSheet } from 'react-native';

const logo = require('../../assets/logo.png');

export default function DobuLogo({ large = false, small = false, style }) {
  return (
    <Image
      source={logo}
      resizeMode="contain"
      style={[
        styles.logo,
        large && styles.large,
        small && styles.small,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 112,
    height: 46,
  },
  large: {
    width: 240,
    height: 98,
  },
  small: {
    width: 88,
    height: 36,
  },
});
