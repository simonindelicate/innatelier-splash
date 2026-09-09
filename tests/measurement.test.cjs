const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/measurement.js'), 'utf8');
const defaults = fs.readFileSync(path.join(root, 'js/measurement-config.js'), 'utf8');
// Synthetic fixtures only; never used on a real network.
const configured = { environment: 'production', ga4MeasurementId: 'G-TEST123', clarityProjectId: 'test123' };
function run(config = configured, origin = 'https://www.innataire.com', existing = {}) {
  const scripts = [];
  const window = { location: { origin }, ...existing };
  const document = {
    head: { appendChild: script => scripts.push(script) },
    createElement: () => ({}),
    querySelector: selector => scripts.find(s => s.src.includes(selector.includes('clarity') ? 'clarity.ms/tag/' : 'googletagmanager.com/gtag/js'))
  };
  const context = vm.createContext({ window, document });
  vm.runInContext(defaults, context);
  if (config !== null) window.INNATAIRE_MEASUREMENT = config;
  const again = () => vm.runInContext(source, context);
  again();
  return { window, scripts, again };
}
test('committed defaults load no providers', () => {
  assert.equal(run(null).scripts.length, 0);
});
test('missing, empty or malformed config fails closed', () => {
  for (const config of [undefined, {}, { environment: 'production' },
    { ...configured, ga4MeasurementId: '', clarityProjectId: '' },
    { ...configured, ga4MeasurementId: 'bad<>', clarityProjectId: '../bad' },
    { ...configured, ga4MeasurementId: 12, clarityProjectId: {} }]) {
    const result = run(config === undefined ? {} : config);
    assert.equal(result.scripts.length, 0);
    assert.equal(result.window.gtag, undefined);
    assert.equal(result.window.clarity, undefined);
  }
});
test('all non-production origins and environments disable tracking', () => {
  for (const origin of ['null', 'http://localhost:8000', 'https://preview.netlify.app',
    'https://www.innataire.com.example.com', 'https://staging.innataire.com',
    'https://innataire.com', 'http://www.innataire.com', 'https://www.innataire.com:8443']) {
    assert.equal(run(configured, origin).scripts.length, 0);
  }
  for (const environment of ['', 'development', 'test', 'preview', undefined]) {
    assert.equal(run({ ...configured, environment }).scripts.length, 0);
  }
});
test('production config queues one automatic page view and loads both scripts asynchronously', () => {
  const result = run();
  assert.deepEqual(result.scripts.map(s => s.src), [
    'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
    'https://www.clarity.ms/tag/test123'
  ]);
  assert.ok(result.scripts.every(s => s.async));
  const calls = result.window.dataLayer.map(args => Array.from(args));
  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], 'js');
  assert.equal(calls[1][0], 'config');
  assert.equal(calls[1][1], 'G-TEST123');
  assert.equal(calls[1].length, 2); // default page_view, no redundant event
  result.again();
  assert.equal(result.scripts.length, 2);
  assert.equal(result.window.dataLayer.length, 2);
});
test('providers can be configured independently', () => {
  assert.equal(run({ ...configured, clarityProjectId: '' }).scripts.length, 1);
  assert.equal(run({ ...configured, ga4MeasurementId: '' }).scripts.length, 1);
});
test('existing integrations are not initialized again', () => {
  const existing = { gtag() {}, clarity() {} };
  const result = run(configured, 'https://www.innataire.com', existing);
  assert.equal(result.scripts.length, 0);
  assert.equal(result.window.gtag, existing.gtag);
  assert.equal(result.window.clarity, existing.clarity);
});
