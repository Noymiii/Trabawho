const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/supabase');

// Use memory storage instead of disk storage for Supabase upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const fileUrls = [];

    for (const file of req.files) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      // Ensure clean extension handling
      const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
      const filePath = `uploads/${uniqueSuffix}-${originalName}`;

      const { data, error } = await supabase.storage
        .from('trabawho-images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trabawho-images')
        .getPublicUrl(filePath);

      fileUrls.push(publicUrl);
    }
    
    res.status(200).json({ urls: fileUrls });
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ message: 'Failed to upload files to Supabase' });
  }
});

module.exports = router;
