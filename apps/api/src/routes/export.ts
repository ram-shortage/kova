import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { exportFormatSchema, type Template, type ExportFormat } from '@kova/shared';
import { pptxAdapter } from '../export/pptx-adapter.js';

const router = Router();

// Export job status
type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface ExportJob {
  id: string;
  templateId: string;
  format: ExportFormat;
  status: ExportStatus;
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  buffer?: Buffer;
}

// In-memory storage for MVP
const exportJobs = new Map<string, ExportJob>();

// In-memory template storage (shared with templates route in production)
const templates = new Map<string, Template>();

// Start export job
router.post('/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { format, template: templateData } = req.body;

    // Validate format
    const formatValidation = exportFormatSchema.safeParse(format);
    if (!formatValidation.success) {
      return res.status(400).json({
        error: 'Invalid export format',
        validFormats: ['pptx']
      });
    }

    // Use provided template data or fetch from storage
    const template = templateData || templates.get(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const job: ExportJob = {
      id: uuidv4(),
      templateId,
      format: formatValidation.data,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    exportJobs.set(job.id, job);

    // Process export asynchronously
    processExport(job.id, template, formatValidation.data);

    res.status(202).json({
      jobId: job.id,
      status: job.status,
      message: 'Export job started'
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to start export' });
  }
});

// Get export job status
router.get('/status/:jobId', (req, res) => {
  const job = exportJobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: 'Export job not found' });
  }

  res.json({
    id: job.id,
    templateId: job.templateId,
    format: job.format,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    error: job.error,
    downloadUrl: job.status === 'completed' ? `/api/export/download/${job.id}` : undefined,
  });
});

// Download exported file
router.get('/download/:jobId', (req, res) => {
  const job = exportJobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: 'Export job not found' });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Export not yet completed', status: job.status });
  }

  if (!job.buffer) {
    return res.status(500).json({ error: 'Export file not found' });
  }

  const mimeTypes: Record<ExportFormat, string> = {
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };

  const extensions: Record<ExportFormat, string> = {
    pptx: 'pptx',
  };

  res.setHeader('Content-Type', mimeTypes[job.format]);
  res.setHeader('Content-Disposition', `attachment; filename="template.${extensions[job.format]}"`);
  res.send(job.buffer);
});

// Process export using appropriate adapter
async function processExport(jobId: string, template: Template, format: ExportFormat) {
  const job = exportJobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.progress = 10;

  try {
    let result;

    switch (format) {
      case 'pptx':
        job.progress = 30;
        result = await pptxAdapter.export({ template, returnBuffer: true });
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    job.progress = 80;

    if (result.success && result.buffer) {
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      job.buffer = result.buffer;

      // Log any warnings
      if (result.warnings.length > 0) {
        console.log(`Export warnings for job ${jobId}:`, result.warnings);
      }
    } else {
      job.status = 'failed';
      job.error = result.errors.map(e => e.message).join('; ');
    }
  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Export failed for job ${jobId}:`, error);
  }
}

export { router as exportRouter };
