// Extract province names from vn.json
// Run this file with: node extractProvinces.js

const vnGeo = require('./src/assets/vn.json');

console.log('=== Vietnam Provinces from vn.json ===\n');
console.log('Total features:', vnGeo.features.length);
console.log('\n--- Province List ---\n');

const provinces = vnGeo.features.map((feature, index) => {
  const props = feature.properties;
  return {
    index: index + 1,
    id: props.id,
    name: props.name
  };
});

// Sort by ID for better readability
provinces.sort((a, b) => {
  if (!a.id || !b.id) return 0;
  return a.id.localeCompare(b.id);
});

provinces.forEach(p => {
  console.log(`${p.index}. ${p.name} (${p.id})`);
});

console.log('\n--- SQL Insert Statements ---\n');
console.log("INSERT INTO provinces (name, unique_id_province) VALUES");
const sqlValues = provinces.map(p => `('${p.name}', '${p.id}')`).join(',\n');
console.log(sqlValues + ';');

console.log('\n--- TypeScript Mapping ---\n');
console.log('const provinceMapping: Record<string, string> = {');
provinces.forEach(p => {
  console.log(`  '${p.id}': '${p.name}',`);
});
console.log('};');
