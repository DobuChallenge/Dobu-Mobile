import { ActivityIndicator, Text, View } from 'react-native';
import Button from './Button';
import Card from './Card';
import { ui } from '../styles/ui';

export default function QueryState({ query, empty = false, emptyTitle = 'Nenhum registro', emptyMessage = 'Os dados aparecerão aqui quando forem cadastrados.', children }) {
  if (query.isPending) return <View style={ui.state}><ActivityIndicator size="large" color="#6C6C6C" /><Text style={ui.body}>Carregando…</Text></View>;
  if (query.isError) return <Card><Text accessibilityRole="alert" style={ui.title}>Não foi possível carregar</Text><Text style={ui.body}>{query.error?.message || 'Confira a conexão e tente novamente.'}</Text><Button title="Tentar novamente" onPress={() => query.refetch()} disabled={query.isFetching} /></Card>;
  return <>
    {query.isFetching ? <View style={ui.row}><ActivityIndicator color="#6C6C6C" /><Text style={ui.caption}>Atualizando…</Text></View> : null}
    {empty ? <Card><Text style={ui.title}>{emptyTitle}</Text><Text style={ui.body}>{emptyMessage}</Text></Card> : children}
  </>;
}
