import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { templateSchema, type Template } from '@kova/shared';

const router = Router();

// In-memory storage for MVP (replace with database later)
const templates = new Map<string, Template>();

// Create a new template
router.post('/create', (req, res) => {
  try {
    const validation = templateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const template: Template = {
      ...validation.data,
      id: uuidv4(),
    };

    templates.set(template.id, template);

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Get template by ID
router.get('/:id', (req, res) => {
  const template = templates.get(req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  res.json(template);
});

// Update template
router.put('/:id', (req, res) => {
  const existingTemplate = templates.get(req.params.id);

  if (!existingTemplate) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const validation = templateSchema.safeParse({
    ...req.body,
    id: req.params.id,
  });

  if (!validation.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.error.errors
    });
  }

  templates.set(req.params.id, validation.data);
  res.json(validation.data);
});

// Delete template
router.delete('/:id', (req, res) => {
  if (!templates.has(req.params.id)) {
    return res.status(404).json({ error: 'Template not found' });
  }

  templates.delete(req.params.id);
  res.status(204).send();
});

// List all templates
router.get('/', (req, res) => {
  const allTemplates = Array.from(templates.values());
  res.json(allTemplates);
});

export { router as templatesRouter };
