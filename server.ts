import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './server/db';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Admin authentication middleware
const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const user = db.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  (req as any).adminUser = user;
  next();
};

// ---------------- API ROUTES ----------------

// 1. Articles API
app.get('/api/articles', (req: Request, res: Response) => {
  try {
    const { category, search, authorId, status, featured, breaking, page, limit, sort } = req.query;
    const result = db.getArticles({
      category: category as string,
      search: search as string,
      authorId: authorId as string,
      status: status as string,
      featured: featured !== undefined ? featured === 'true' : undefined,
      breaking: breaking !== undefined ? breaking === 'true' : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      sort: sort as any
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch articles' });
  }
});

// Single Article by slug or id
app.get('/api/articles/:identifier', (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let article = db.getArticleBySlug(identifier);
    if (!article) {
      article = db.getArticleById(identifier);
    }
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch article' });
  }
});

// Create article (admin)
app.post('/api/articles', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const created = db.createArticle(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create article' });
  }
});

// Update article (admin)
app.put('/api/articles/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateArticle(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update article' });
  }
});

// Delete article (admin)
app.delete('/api/articles/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const success = db.deleteArticle(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete article' });
  }
});

// Increment article view count with anti-inflation throttling
app.post('/api/articles/:id/view', (req: Request, res: Response) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'client';
    const clientIdentifier = Array.isArray(ip) ? ip[0] : ip;
    const views = db.incrementArticleView(req.params.id, clientIdentifier);
    res.json({ views });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record view' });
  }
});

// 2. Categories API
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(db.getCategories());
});

app.post('/api/categories', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const created = db.createCategory(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const success = db.deleteCategory(req.params.id);
    if (!success) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Authors API
app.get('/api/authors', (_req: Request, res: Response) => {
  res.json(db.getAuthors());
});

app.post('/api/authors', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const created = db.createAuthor(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/authors/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateAuthor(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Author not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/authors/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const success = db.deleteAuthor(req.params.id);
    if (!success) return res.status(404).json({ error: 'Author not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Breaking News API
app.get('/api/breaking-news', (req: Request, res: Response) => {
  const activeOnly = req.query.all !== 'true';
  res.json(db.getBreakingNews(activeOnly));
});

app.post('/api/breaking-news', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const created = db.addBreakingNews(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/breaking-news/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateBreakingNews(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Breaking news not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/breaking-news/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const success = db.deleteBreakingNews(req.params.id);
    if (!success) return res.status(404).json({ error: 'Breaking news not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Advertisements API
app.get('/api/ads', (_req: Request, res: Response) => {
  res.json(db.getAds());
});

app.put('/api/ads/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateAd(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Ad slot not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Settings API
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Subscribers API
app.post('/api/subscribe', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = db.addSubscriber(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/subscribers', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getSubscribers());
});

// 8. Comments API
app.get('/api/comments', (req: Request, res: Response) => {
  const { articleId } = req.query;
  if (!articleId) return res.status(400).json({ error: 'articleId is required' });
  res.json(db.getComments(articleId as string));
});

app.post('/api/comments', (req: Request, res: Response) => {
  try {
    const comment = db.addComment(req.body);
    res.status(201).json(comment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9. Auth API
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const auth = db.authenticateAdmin(email, password);
  if (!auth) {
    return res.status(401).json({ error: 'Invalid credentials. Default is admin@news10.com / admin123' });
  }
  res.json(auth);
});

app.get('/api/auth/me', requireAdminAuth, (req: Request, res: Response) => {
  res.json({ user: (req as any).adminUser });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }
  const success = db.resetAdminPassword(email, newPassword);
  if (!success) {
    return res.status(404).json({ error: 'Admin account with that email not found' });
  }
  res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' });
});

// 10. Dashboard Stats & Seed Reset
app.get('/api/admin/stats', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getDashboardStats());
});

app.post('/api/admin/reset-demo', requireAdminAuth, (_req: Request, res: Response) => {
  db.resetToDefaultDemo();
  res.json({ success: true, message: 'Database reset to default demo dataset successfully' });
});

// 11. Image Upload Endpoint
app.post('/api/upload', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Extract base64 format and data
    const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a full URL, return it
      if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
        return res.json({ url: imageBase64 });
      }
      return res.status(400).json({ error: 'Invalid image base64 format' });
    }

    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';

    const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, dataBuffer);
    const publicUrl = `/uploads/${safeName}`;

    res.json({ url: publicUrl, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

// 12. SEO: robots.txt and sitemap.xml
app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${reqProtocol(req)}://${reqHost(req)}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const host = `${reqProtocol(req)}://${reqHost(req)}`;
  const articles = db.getArticles({ limit: 500 }).articles;
  const categories = db.getCategories();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += `  <url><loc>${host}/</loc><changefreq>always</changefreq><priority>1.0</priority></url>\n`;
  xml += `  <url><loc>${host}/latest</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>\n`;

  for (const cat of categories) {
    xml += `  <url><loc>${host}/category/${cat.slug}</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>\n`;
  }

  for (const art of articles) {
    xml += `  <url><loc>${host}/news/${art.categorySlug}/${art.slug}</loc><lastmod>${(art.updatedAt || art.publishedAt).split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>\n`;
  }

  xml += `</urlset>`;
  res.type('application/xml');
  res.send(xml);
});

function reqProtocol(req: Request) {
  return req.headers['x-forwarded-proto'] || req.protocol || 'https';
}

function reqHost(req: Request) {
  return req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
}

// ---------------- VITE / FRONTEND SERVING ----------------

async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`News 10 Server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
