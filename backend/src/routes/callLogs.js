const express = require('express');
const router = express.Router();
const c = require('../controllers/callLogController');
const { authenticate } = require('../middleware/auth');

// Allow public/dashboard access to AI stats & Virtual Call uploads
router.get('/ai-stats', c.getAIStats);
router.post('/upload-virtual', c.uploadMiddleware, c.uploadVirtualCall);

// Protected routes
router.use(authenticate);

router.get('/', c.getAll);
router.get('/:id/ai-analysis', c.getAIAnalysis);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
