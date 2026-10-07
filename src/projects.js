export const starterProjects = [
  { id: 'portfolio', name: 'Personal portfolio', description: 'A home for your work, your story, and what comes next.', type: 'Website', status: 'In progress', theme: 'lavender', symbol: '✳' },
  { id: 'dashboard', name: 'Studio dashboard', description: 'Turn everyday information into clear, useful insights.', type: 'Application', status: 'In progress', theme: 'peach', symbol: '▥' },
  { id: 'components', name: 'Component library', description: 'The building blocks for a consistent digital experience.', type: 'Design system', status: 'Ready', theme: 'green', symbol: '◈' },
];
export function filterProjects(projects, query, status) {
  const normalized = query.trim().toLowerCase();
  return projects.filter(project => (status === 'All' || project.status === status) && `${project.name} ${project.description} ${project.type}`.toLowerCase().includes(normalized));
}
export function isProject(project) {
  return project && ['id', 'name', 'description', 'type', 'status', 'theme', 'symbol'].every(key => typeof project[key] === 'string') && ['In progress', 'Ready'].includes(project.status);
}
export function loadProjects(storage) {
  try {
    const value = JSON.parse(storage.getItem('web-studio-projects'));
    if (Array.isArray(value) && value.every(isProject)) return value;
  } catch { /* Fall back to the starter workspace when saved data is unavailable. */ }
  return structuredClone(starterProjects);
}
