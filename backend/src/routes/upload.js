const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

// Ensure uploads folder exists locally for fallback
const localUploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// Use memory storage instead of disk storage for Supabase upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
      const fileName = `${uniqueSuffix}-${originalName}`;
      const filePath = `uploads/${fileName}`;

      let uploadedUrl = null;

      // Try uploading to Supabase if credentials are provided
      if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
        try {
          const { data, error } = await supabase.storage
            .from('trabawho-images')
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false
            });

          if (!error) {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('trabawho-images')
              .getPublicUrl(filePath);
            uploadedUrl = publicUrl;
          } else {
            console.warn('Supabase storage error, falling back to local:', error.message);
          }
        } catch (supabaseErr) {
          console.warn('Supabase upload exception, falling back to local:', supabaseErr);
        }
      }

      // If Supabase upload didn't succeed, fall back to local disk storage
      if (!uploadedUrl) {
        const localPath = path.join(localUploadsDir, fileName);
        fs.writeFileSync(localPath, file.buffer);
        // Build the local server URL
        uploadedUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
      }

      fileUrls.push(uploadedUrl);
    }
    
    res.status(200).json({ urls: fileUrls });
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ message: 'Failed to upload files' });
  }
});

module.exports = router;
