import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/svg+xml',
      'image/png',
      'font/ttf',
      'font/otf',
      'application/x-font-ttf',
      'application/x-font-opentype',
      'application/octet-stream', // for fonts
    ];

    const allowedExtensions = ['.svg', '.png', '.ttf', '.otf'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

// Asset type definition
interface Asset {
  id: string;
  name: string;
  type: 'logo' | 'font';
  mimeType: string;
  size: number;
  data: Buffer;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// In-memory storage for MVP
const assets = new Map<string, Asset>();

// Upload asset
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const ext = req.file.originalname.toLowerCase().slice(req.file.originalname.lastIndexOf('.'));
    const isFont = ['.ttf', '.otf'].includes(ext);
    const isLogo = ['.svg', '.png'].includes(ext);

    if (!isFont && !isLogo) {
      return res.status(400).json({ error: 'Invalid file type. Use svg/png for logos or ttf/otf for fonts.' });
    }

    const asset: Asset = {
      id: uuidv4(),
      name: req.file.originalname,
      type: isFont ? 'font' : 'logo',
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined,
      createdAt: new Date(),
    };

    assets.set(asset.id, asset);

    // Return asset info without the buffer
    res.status(201).json({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      mimeType: asset.mimeType,
      size: asset.size,
      createdAt: asset.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

// Get asset by ID
router.get('/:id', (req, res) => {
  const asset = assets.get(req.params.id);

  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  // Return the file with proper content type
  res.setHeader('Content-Type', asset.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${asset.name}"`);
  res.send(asset.data);
});

// Get asset metadata
router.get('/:id/metadata', (req, res) => {
  const asset = assets.get(req.params.id);

  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  res.json({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    mimeType: asset.mimeType,
    size: asset.size,
    metadata: asset.metadata,
    createdAt: asset.createdAt,
  });
});

// Delete asset
router.delete('/:id', (req, res) => {
  if (!assets.has(req.params.id)) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  assets.delete(req.params.id);
  res.status(204).send();
});

// List all assets
router.get('/', (req, res) => {
  const allAssets = Array.from(assets.values()).map(asset => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    mimeType: asset.mimeType,
    size: asset.size,
    createdAt: asset.createdAt,
  }));

  res.json(allAssets);
});

export { router as assetsRouter };
