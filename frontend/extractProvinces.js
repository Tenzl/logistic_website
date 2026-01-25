// Extract province names from newvn.geojson
// Run this file with: node extractProvinces.js

const fs = require('fs');
const vnGeoData = fs.readFileSync('./src/assets/newvn.geojson', 'utf8');
const vnGeo = JSON.parse(vnGeoData);

console.log('=== Vietnam Provinces from newvn.geojson ===\n');
console.log('Total features:', vnGeo.features.length);
console.log('\n--- Province List ---\n');

const provinces = vnGeo.features.map((feature, index) => {
  const props = feature.properties;
  return {
    index: index + 1,
    id: props.ma_tinh,  // Changed from props.id to props.ma_tinh
    name: props.ten_tinh // Changed from props.name to props.ten_tinh
  };
});

// Sort by name for better readability
provinces.sort((a, b) => {
  if (!a.name || !b.name) return 0;
  return a.name.localeCompare(b.name, 'vi');
});

provinces.forEach(p => {
  console.log(`${p.index}. ${p.name} (${p.id})`);
});

console.log('\n--- SQL Insert Statements (with numeric ID) ---\n');
console.log("INSERT INTO provinces (id, name) VALUES");
const sqlValues = provinces.map((p, idx) => `(${idx + 1}, '${p.name}')`).join(',\n');
console.log(sqlValues + ';');

console.log('\n--- SQL Insert with ma_tinh (province code) ---\n');
console.log("-- Note: ma_tinh codes from newvn.geojson");
provinces.forEach(p => {
  console.log(`-- ${p.name}: ma_tinh = '${p.id}'`);
});

console.log('\n--- TypeScript Mapping ---\n');
console.log('const provinceMapping: Record<string, string> = {');
provinces.forEach(p => {
  console.log(`  '${p.id}': '${p.name}',`);
});
console.log('};');
