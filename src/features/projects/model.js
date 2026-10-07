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
  return Boolean(project && typeof project === 'object' && ['id', 'name', 'description', 'type', 'status', 'theme', 'symbol'].every(key => typeof project[key] === 'string') && project.id.length > 0 && project.id.length <= 100 && project.name.trim().length > 0 && project.name.length <= 60 && project.description.trim().length > 0 && project.description.length <= 180 && ['Website', 'Application', 'Design system'].includes(project.type) && ['In progress', 'Ready'].includes(project.status) && ['lavender', 'peach', 'green'].includes(project.theme) && project.symbol.length <= 10);
}
