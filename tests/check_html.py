"""Check the deployable static HTML, without a build or third-party dependencies."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://www.innataire.com'

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
    def select(self, tag, **attrs):
        return [a for t, a in self.tags if t == tag and all(a.get(k) == v for k, v in attrs.items())]

for filename in ['index.html', 'pre-index.html']:
    text = (ROOT / filename).read_text(encoding='utf-8-sig')
    page = Page(text)
    assert len(page.select('title')) == 1
    assert len(page.select('h1')) == 1
    assert len(page.select('main')) == 1
    assert len(page.select('meta', name='description')) == 1
    canonical = page.select('link', rel='canonical')
    assert len(canonical) == 1
    assert canonical[0]['href'] == ORIGIN + ('/' if filename == 'index.html' else '/' + filename)
    scripts = [a['src'] for a in page.select('script') if 'src' in a]
    assert scripts == ['js/measurement-config.js', 'js/measurement.js']
    for t, attrs in page.tags:
        for key in ['src', 'href']:
            value = attrs.get(key, '')
            if value and not value.startswith(('https://', 'http://', '#')):
                assert (ROOT / value).is_file(), value
    assert not page.select('meta', name='google-site-verification')
    assert not page.select('meta', name='msvalidate.01')
    if filename == 'index.html':
        assert not page.select('meta', name='robots')
        assert page.select('meta', property='og:url')[0]['content'] == canonical[0]['href']
        for attrs in [dict(property='og:image'), dict(name='twitter:image')]:
            image = page.select('meta', **attrs)
            assert len(image) == 1 and image[0]['content'].startswith(ORIGIN + '/')
            assert (ROOT / image[0]['content'].removeprefix(ORIGIN + '/')).is_file()
        data = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)[1])
        assert data['@context'] == 'https://schema.org'
        assert [item['@type'] for item in data['@graph']] == ['WebSite', 'Organization']
        assert data['@graph'][0]['publisher']['@id'] == data['@graph'][1]['@id']
        assert all(item['url'] == canonical[0]['href'] for item in data['@graph'])
        # Simulate the documented static-tag configuration using synthetic tokens.
        configured = re.sub(r'<!-- Ownership verification configuration:.*?-->',
            '<meta name="google-site-verification" content="test-google-token">\n'
            '<meta name="msvalidate.01" content="test-bing-token">', text, flags=re.S)
        head = Page(configured.split('</head>')[0])
        assert head.select('meta', name='google-site-verification') == [{'name': 'google-site-verification', 'content': 'test-google-token'}]
        assert head.select('meta', name='msvalidate.01') == [{'name': 'msvalidate.01', 'content': 'test-bing-token'}]
    else:
        assert page.select('meta', name='robots')[0]['content'] == 'noindex, follow'
    print('PASS', filename, 'metadata, landmarks, local assets and script order')

sitemap = ET.parse(ROOT / 'sitemap.xml')
locations = [e.text for e in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert locations == [ORIGIN + '/']
robots = (ROOT / 'robots.txt').read_text()
assert 'Disallow:' not in robots
assert 'Sitemap: ' + ORIGIN + '/sitemap.xml' in robots
css = (ROOT / 'css/style.css').read_text()
for asset in re.findall(r'url\("(\.\./[^"\)]+)"\)', css):
    assert (ROOT / 'css' / asset).is_file(), asset
print('PASS sitemap, robots, verification fixtures, JSON-LD and CSS assets')
