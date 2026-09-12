import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildPetPayload, validatePet } from '../utils/petValidation';

const EMPTY_DRAFT = {
  nome: '',
  idade: '',
  especieId: '',
  racaId: '',
  responsavelId: '',
};

function resolvePetCatalog(pet, catalogos) {
  const breed = (catalogos?.racas || []).find((item) => item.id === pet?.racaId) || pet?.raca;
  const species = (catalogos?.especies || []).find((item) => item.id === breed?.especieId) || breed?.especie;
  return { breed, species };
}

export function usePetList(pets, catalogos) {
  return useMemo(() => (pets || []).map((pet) => {
    const { breed, species } = resolvePetCatalog(pet, catalogos);
    return {
      id: pet.id,
      name: pet.nome,
      ageLabel: `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'}`,
      speciesName: species?.nome || 'Espécie não identificada',
      breedName: breed?.nome || 'Raça não identificada',
    };
  }), [catalogos, pets]);
}

export function usePetDetails(pet, catalogos) {
  return useMemo(() => {
    if (!pet) return null;
    const { breed, species } = resolvePetCatalog(pet, catalogos);
    const owner = (catalogos?.usuarios || []).find((item) => item.id === pet.responsavelId) || pet.responsavel;
    return {
      id: pet.id,
      name: pet.nome,
      ageLabel: `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'}`,
      speciesName: species?.nome || 'Não identificada',
      breedName: breed?.nome || 'Não identificada',
      ownerName: owner?.nome || 'Não identificado',
    };
  }, [catalogos, pet]);
}

export function usePetForm({ id, pet, catalogos, user, savePet, onSaved }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedKey = useRef(null);
  const submitting = useRef(false);

  useEffect(() => {
    const formKey = id || `novo:${user?.id || ''}`;
    if (!user || !catalogos || (id && !pet) || initializedKey.current === formKey) return;

    const selectedBreed = catalogos.racas?.find((item) => item.id === pet?.racaId);
    setDraft({
      nome: pet?.nome || '',
      idade: pet?.idade === 0 || pet?.idade ? String(pet.idade) : '',
      especieId: selectedBreed?.especieId || pet?.raca?.especieId || '',
      racaId: pet?.racaId || '',
      responsavelId: user.tipoConta === 'veterinario' ? pet?.responsavelId || '' : user.id,
    });
    setError(null);
    initializedKey.current = formKey;
  }, [catalogos, id, pet, user]);

  const availableBreeds = useMemo(
    () => (catalogos?.racas || []).filter((item) => item.especieId === draft.especieId),
    [catalogos?.racas, draft.especieId],
  );

  const speciesOptions = useMemo(
    () => (catalogos?.especies || []).map((item) => ({ value: item.id, label: item.nome })),
    [catalogos?.especies],
  );
  const breedOptions = useMemo(
    () => availableBreeds.map((item) => ({ value: item.id, label: item.nome })),
    [availableBreeds],
  );
  const ownerOptions = useMemo(() => {
    if (user?.tipoConta !== 'veterinario') {
      return user ? [{ value: user.id, label: user.nome }] : [];
    }
    return (catalogos?.usuarios || [])
      .filter((item) => String(item.tipoUsuario).toUpperCase() === 'RESPONSAVEL')
      .map((item) => ({ value: item.id, label: item.nome }));
  }, [catalogos?.usuarios, user]);

  const setField = useCallback((field, value) => {
    setError(null);
    setDraft((current) => {
      if (field !== 'especieId') return { ...current, [field]: value };
      const keepsBreed = catalogos?.racas?.some((item) => item.id === current.racaId && item.especieId === value);
      return { ...current, especieId: value, racaId: keepsBreed ? current.racaId : '' };
    });
  }, [catalogos?.racas]);

  const submit = useCallback(async () => {
    if (submitting.current) return;

    const validationError = validatePet(draft, catalogos);
    if (validationError) {
      setError(validationError);
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const savedPet = await savePet({ id, dados: buildPetPayload(draft) });
      onSaved(savedPet);
    } catch (submitError) {
      setError(submitError?.message || 'Não foi possível salvar o animal. Tente novamente.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }, [catalogos, draft, id, onSaved, savePet]);

  return {
    draft,
    setField,
    speciesOptions,
    breedOptions,
    ownerOptions,
    error,
    isSubmitting,
    submit,
  };
}
