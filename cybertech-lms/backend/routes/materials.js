const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Material } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

const getMaterialType = (mimetype = '') => {
  if (mimetype.includes('pdf'))   return 'pdf';
  if (mimetype.includes('video')) return 'video';
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'ppt';
  if (mimetype.includes('zip'))   return 'zip';
  return 'other';
};

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024, sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// GET /api/materials  — admin: all materials
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const materials = await Material.find().populate('course','title').sort({ uploadedAt: -1 }).lean();
    res.json({ success: true, materials });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/materials/course/:courseId  — enrolled students + admin
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidId(courseId)) return res.status(400).json({ success: false, message: 'Invalid course ID' });
    if (req.user.role !== 'admin') {
      const { Enrollment } = require('../models/index');
      const enrolled = await Enrollment.findOne({ user: req.user._id, course: courseId, isActive: true });
      if (!enrolled) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }
    const materials = await Material.find({ course: courseId }).sort({ order: 1, uploadedAt: -1 }).lean();
    res.json({ success: true, materials });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/materials  — admin: upload
router.post('/', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    const { title, description, courseId, module: moduleName, order, isPublic } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    let fileUrl = null, fileName = null, fileSize = null, type = 'link';
    if (req.file) {
      fileUrl  = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = formatBytes(req.file.size);
      type     = getMaterialType(req.file.mimetype);
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
      type    = 'link';
    } else {
      return res.status(400).json({ success: false, message: 'Provide a file or fileUrl' });
    }

    const material = await Material.create({
      title: title.trim(), description,
      course: courseId || undefined, type, fileUrl, fileName, fileSize,
      module: moduleName, order: order ? Number(order) : 0,
      isPublic: isPublic === 'true' || isPublic === true,
    });
    await material.populate('course', 'title');
    res.status(201).json({ success: true, message: 'Material uploaded successfully', material });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/materials/:id  — admin: update metadata
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const material = await Material.findByIdAndUpdate(id, req.body, { new: true }).populate('course','title');
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, message: 'Material updated', material });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/materials/:id  — admin: delete + remove file
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const material = await Material.findByIdAndDelete(id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    if (material.fileUrl && material.fileUrl.startsWith('/uploads/')) {
      const fp = path.join(__dirname, '..', material.fileUrl);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/materials/:id/download
router.get('/:id/download', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const material = await Material.findById(id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    if (material.fileUrl && material.fileUrl.startsWith('/uploads/')) {
      const fp = path.join(__dirname, '..', material.fileUrl);
      if (!fs.existsSync(fp)) return res.status(404).json({ success: false, message: 'File not found on disk' });
      return res.download(fp, material.fileName || path.basename(fp));
    }
    res.redirect(material.fileUrl);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
