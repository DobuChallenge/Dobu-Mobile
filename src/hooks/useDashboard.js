import { useAuth } from './useAuth';
import { usePets } from './usePets';
import { useAgendamentos } from './useAgendamentos';
import { combineQueries } from '../services/queryState';
import { upcomingAppointments } from '../utils/agendamentoValidation';

export function useDashboard() {
  const { user, logout } = useAuth();
  const pets = usePets();
  const agenda = useAgendamentos();
  const appointments = agenda.data || [];
  const patientIds = new Set(appointments.map((item) => item.petId));
  const animals = (pets.data || []).filter((pet) => user.tipoConta !== 'veterinario' || patientIds.has(pet.id));
  return { user, logout, query: combineQueries([pets, agenda]), animals, appointments, upcoming: upcomingAppointments(appointments) };
}
