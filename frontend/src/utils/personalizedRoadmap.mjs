const profileFields = ['interestCode', 'experienceCode', 'goalCode']

// Firestore can return object fields in a different order; module order still matters.
function stableJson(value) {
  return JSON.stringify(value, (_, current) =>
    current && typeof current === 'object' && !Array.isArray(current)
      ? Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b)))
      : current,
  )
}

export function validatePersonalizedRoadmap(roadmap, expectedProfile) {
  if (
    !roadmap ||
    !Array.isArray(roadmap.nodes) ||
    roadmap.nodes.length < 2 ||
    profileFields.some((field) => roadmap.profile?.[field] !== expectedProfile[field])
  ) {
    throw new Error(
      'A trilha recebida não corresponde à área, ao nível e ao objetivo escolhidos. Sua escolha não foi confirmada.',
    )
  }
}

export function validateSavedRoadmap(generated, saved, expectedProfile) {
  validatePersonalizedRoadmap(generated, expectedProfile)
  validatePersonalizedRoadmap(saved, expectedProfile)
  if (generated.title !== saved.title || stableJson(generated.nodes) !== stableJson(saved.nodes)) {
    throw new Error('Não foi possível confirmar que sua nova trilha foi salva. Tente novamente.')
  }
}
