const fs = require('fs');

try {
  // DRIVER.HTML cleanup
  let dHtml = fs.readFileSync('driver.html', 'utf8');
  dHtml = dHtml.replace(/<section id="screen-history">[\s\S]*?<\/section>/g, '');
  dHtml = dHtml.replace(/<section id="screen-leaderboard">[\s\S]*?<\/section>/g, '');
  dHtml = dHtml.replace(/<div class="nav-item"\s+data-tab="history">[\s\S]*?<\/div>/g, '');
  dHtml = dHtml.replace(/<div class="nav-item"\s+data-tab="leaderboard">[\s\S]*?<\/div>/g, '');
  dHtml = dHtml.replace(/<div class="stats-row[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
  fs.writeFileSync('driver.html', dHtml);

  // HOME.HTML cleanup
  let hHtml = fs.readFileSync('home.html', 'utf8');
  hHtml = hHtml.replace(/<div id="driver-panel"[\s\S]*?<div id="route-stops">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
  hHtml = hHtml.replace(/<button id="route-start-btn"[\s\S]*?<\/button>/g, '');
  fs.writeFileSync('home.html', hHtml);

  // POINT.HTML cleanup
  let pHtml = fs.readFileSync('point.html', 'utf8');
  pHtml = pHtml.replace(/<div id="driver-panel"[\s\S]*?<div id="route-stops">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
  pHtml = pHtml.replace(/<button id="route-start-btn"[\s\S]*?<\/button>/g, '');
  fs.writeFileSync('point.html', pHtml);

  console.log("Cleanup script completed successfully.");
} catch(e) {
  console.error("Error during cleanup:", e);
}
