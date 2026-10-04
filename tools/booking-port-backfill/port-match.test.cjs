const {test}=require('node:test');const assert=require('node:assert/strict');const {matchPort}=require('./port-match.cjs');
const ports=[{id:1,name:'OSAKA',code:'JPOSA',country_code:'JP',is_active:true},{id:2,name:'OSAKA',code:'XXOSA',country_code:'XX',is_active:true}];
test('exact code and country, ambiguous names, no fuzzy guesses',()=>{assert.equal(matchPort('OSAKA, JP (JPOSA)',ports).id,1);assert.equal(matchPort('OSAKA',ports).id,null);assert.equal(matchPort('OSAK',ports).id,null);assert.equal(matchPort('OSAKA, XX (JPOSA)',ports).id,null);assert.equal(matchPort('JPOSA',ports).id,1);});
