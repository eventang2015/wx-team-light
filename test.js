const body = { name: 'aa', description: 'bb', tags: 'cc', managerIds: 'dd', color: 'ee' }

const { name, description, tags, managerIds, color } = { ...body }

console.log(name)
console.log(description)
console.log(tags)
console.log(managerIds)
console.log(color)