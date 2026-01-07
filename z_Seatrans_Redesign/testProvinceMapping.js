// Test script to verify province mapping between database and newvn.geojson
// Run: node testProvinceMapping.js

const fs = require('fs');

// Load geojson
const vnGeoData = fs.readFileSync('./src/assets/newvn.geojson', 'utf8');
const vnGeo = JSON.parse(vnGeoData);

// Database provinces (from migration_update_provinces_newvn.sql)
const dbProvinces = [
  'An Giang',
  'Bắc Ninh',
  'Cà Mau',
  'Cao Bằng',
  'Cần Thơ',
  'Đà Nẵng',
  'Đắk Lắk',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Phòng',
  'Huế',
  'Hưng Yên',
  'Khánh Hòa',
  'Lai Châu',
  'Lạng Sơn',
  'Lào Cai',
  'Lâm Đồng',
  'Nghệ An',
  'Ninh Bình',
  'Phú Thọ',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sơn La',
  'Tây Ninh',
  'Thái Nguyên',
  'Thanh Hóa',
  'TP. Hồ Chí Minh',
  'Tuyên Quang',
  'Vĩnh Long'
];

// GeoJSON provinces
const geoProvinces = vnGeo.features
  .map(f => ({
    ma_tinh: f.properties?.ma_tinh,
    ten_tinh: f.properties?.ten_tinh
  }))
  .sort((a, b) => (a.ten_tinh || '').localeCompare(b.ten_tinh || '', 'vi'));

console.log('=== GEOJSON PROVINCES ===\n');
console.log(`Total: ${geoProvinces.length} provinces\n`);
geoProvinces.forEach(p => {
  console.log(`  - ${p.ten_tinh} (${p.ma_tinh})`);
});

console.log('\n=== DATABASE PROVINCES ===\n');
console.log(`Total: ${dbProvinces.length} provinces\n`);
dbProvinces.forEach(p => {
  console.log(`  - ${p}`);
});

// Normalize function (same as in TypeScript)
const normalizeProvinceName = (name) => {
  return name
    .replace(/^TP\.\s*/i, '')
    .replace(/^Thành phố\s*/i, '')
    .replace(/^Tỉnh\s*/i, '')
    .trim()
    .toLowerCase();
};

// Check mapping
console.log('\n=== MAPPING CHECK ===\n');

const matched = [];
const unmatched = [];

dbProvinces.forEach(dbName => {
  const normalizedDb = normalizeProvinceName(dbName);
  
  const geoMatch = geoProvinces.find(geo => {
    const normalizedGeo = normalizeProvinceName(geo.ten_tinh || '');
    return normalizedGeo === normalizedDb;
  });
  
  if (geoMatch) {
    matched.push({ db: dbName, geo: geoMatch.ten_tinh, code: geoMatch.ma_tinh });
    console.log(`✓ ${dbName} -> ${geoMatch.ten_tinh} (${geoMatch.ma_tinh})`);
  } else {
    unmatched.push(dbName);
    console.log(`✗ ${dbName} -> NOT FOUND`);
  }
});

console.log('\n=== SUMMARY ===\n');
console.log(`Matched: ${matched.length}/${dbProvinces.length}`);
console.log(`Unmatched: ${unmatched.length}/${dbProvinces.length}`);

if (unmatched.length > 0) {
  console.log('\n⚠️  UNMATCHED PROVINCES:');
  unmatched.forEach(name => {
    console.log(`  - ${name}`);
  });
  
  console.log('\n💡 Suggestions:');
  console.log('  1. Check if these provinces exist in newvn.geojson with different names');
  console.log('  2. Add mappings to PROVINCE_NAME_MAPPING in provinceMapping.ts');
  console.log('  3. Update database province names to match geojson exactly');
}

// Check if there are provinces in geojson not in database
const geoNotInDb = geoProvinces.filter(geo => {
  const normalizedGeo = normalizeProvinceName(geo.ten_tinh || '');
  return !dbProvinces.some(db => normalizeProvinceName(db) === normalizedGeo);
});

if (geoNotInDb.length > 0) {
  console.log('\n=== PROVINCES IN GEOJSON BUT NOT IN DATABASE ===\n');
  geoNotInDb.forEach(p => {
    console.log(`  - ${p.ten_tinh} (${p.ma_tinh})`);
  });
}

console.log('\n✅ Test completed!\n');



