const fs = require('fs');

function prependAuthCheck(filename, requiredRole) {
  let content = fs.readFileSync(filename, 'utf8');
  content = content.replace(/let currentRole = 'home';/, '');
  content = content.replace(/let demoMode = false;/, '');

  const header = `
let currentRole = localStorage.getItem('eco_role');
let demoMode = localStorage.getItem('eco_demo') === 'true';

if (!localStorage.getItem('eco_jwt')) {
  window.location.href = '/index.html';
}
`;
  fs.writeFileSync(filename, header + content);
}

prependAuthCheck('driver.js', 'driver');
prependAuthCheck('home.js', 'home');
prependAuthCheck('point.js', 'point');

console.log('Patch complete.');
