import assert from 'node:assert/strict';
import fs from 'node:fs';
import { posts } from '../src/blog/posts.js';
import { CATALOG_EVIDENCE } from '../src/lib/catalogEvidence.js';
import { getRouteSeo, SITE_ORIGIN } from '../src/lib/seo.js';

const home = getRouteSeo('/');
assert.match(home.title, /Diretório de ferramentas de IA/);
assert.equal(home.canonicalUrl, `${SITE_ORIGIN}/`);
assert.equal(home.robots, 'index, follow');

const toolsEn = getRouteSeo('/en/tools');
assert.match(toolsEn.title, /Explore AI tools/);
assert.equal(toolsEn.lang, 'en');
assert.equal(toolsEn.canonicalPath, '/en/tools');

const privateRoute = getRouteSeo('/en/account');
assert.match(privateRoute.title, /Account/);
assert.equal(privateRoute.robots, 'noindex, follow');

const blogPost = getRouteSeo(`/blog/${posts[0].slug}`);
assert.match(blogPost.title, new RegExp(posts[0].title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.equal(blogPost.robots, 'index, follow');
assert.equal(blogPost.contentType, 'article');
assert.equal(blogPost.modified, posts[0].updated);

const toolDetail = getRouteSeo('/ferramentas/1--1password');
assert.equal(toolDetail.robots, 'noindex, follow');

for (const post of posts) {
  assert.ok(post.sections?.length >= 5, `${post.slug} needs substantive editorial sections`);
  assert.ok(post.en?.sections?.length >= 5, `${post.slug} needs substantive English editorial sections`);
  const ptWords = JSON.stringify({ summary: post.summary, sections: post.sections, takeaway: post.takeaway }).split(/\s+/).length;
  const enWords = JSON.stringify({ summary: post.en.summary, sections: post.en.sections, takeaway: post.en.takeaway }).split(/\s+/).length;
  assert.ok(ptWords >= 500, `${post.slug} PT content is too thin: ${ptWords}`);
  assert.ok(enWords >= 500, `${post.slug} EN content is too thin: ${enWords}`);
}

const notFound = getRouteSeo('/rota-inexistente');
assert.equal(notFound.robots, 'noindex, follow');

const indexHtml = fs.readFileSync('index.html', 'utf8');
for (const token of ['rel="canonical"', 'property="og:image"', 'name="twitter:title"', 'name="robots"']) {
  assert.ok(indexHtml.includes(token), `index.html missing ${token}`);
}

const homepage = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');
assert.match(homepage, /<h1 className="srOnly">/);
assert.ok(homepage.includes('Como construímos confiança'));
assert.ok(homepage.includes('Em revisão'));
assert.ok(!homepage.includes('Mais de 4.000 ferramentas para explorar'));

const robots = fs.readFileSync('public/robots.txt', 'utf8');
assert.match(robots, /Sitemap: https:\/\/aqua-aitools\.com\/sitemap\.xml/);

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
for (const route of ['/', '/en', '/ferramentas', '/en/tools', '/sobre', '/en/about']) {
  assert.ok(sitemap.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), `sitemap missing ${route}`);
}
for (const post of posts) {
  assert.ok(sitemap.includes(`/blog/${post.slug}</loc>`), `sitemap missing PT post ${post.slug}`);
  assert.ok(sitemap.includes(`/en/blog/${post.slug}</loc>`), `sitemap missing EN post ${post.slug}`);
}
for (const retiredSlug of ['prompting-produtivo', 'comparar-chatbots-2026', 'ia-para-pequenos-negocios', 'bem-vindo']) {
  assert.ok(!sitemap.includes(`/blog/${retiredSlug}</loc>`), `retired thin post leaked into sitemap: ${retiredSlug}`);
}
for (const privatePath of ['/signin', '/signup', '/conta', '/en/account', '/definicoes']) {
  assert.ok(!sitemap.includes(`<loc>${SITE_ORIGIN}${privatePath}</loc>`), `private route leaked into sitemap: ${privatePath}`);
}

assert.equal(CATALOG_EVIDENCE.publishedRecords, 4344);
assert.equal(CATALOG_EVIDENCE.operationalStatus, 'in_review');

console.log(JSON.stringify({
  event: 'seo.trust.smoke.completed',
  publicRoutesChecked: 6,
  blogPostsChecked: posts.length,
  publishedRecords: CATALOG_EVIDENCE.publishedRecords,
}));
