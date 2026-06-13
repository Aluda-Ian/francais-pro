const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// GET /api/blogs — Public listing (only published blogs)
// If admin=true query and authorized, returns all (drafts included)
router.get('/', async (req, res, next) => {
  try {
    const { search, tag, page = 1, limit = 12, admin } = req.query;
    let filter = { isPublished: true };

    // Check if client is admin/instructor wishing to manage posts
    if (admin === 'true') {
      // Manual optional auth verification
      let token;
      if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const User = require('../models/User');
          const user = await User.findById(decoded.id);
          if (user && (user.role === 'admin' || user.role === 'instructor')) {
            filter = {}; // Show all blogs
            // If instructor, only show their own blogs or all blogs depending on preference. Let's show all for admin/instructor management convenience.
          }
        } catch (e) {
          // Invalid token, fall back to public published filter
        }
      }
    }

    if (search) {
      filter.$text = { $search: search };
    }
    if (tag) {
      filter.tags = tag;
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'name role avatar')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/blogs/:idOrSlug — Get a single blog post
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const blog = await Blog.findOne(query).populate('author', 'name role avatar bio');
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    // If it's a draft, check authorization
    if (!blog.isPublished) {
      let isAuthorized = false;
      let token;
      if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded.id === blog.author.toString() || decoded.role === 'admin') {
            isAuthorized = true;
          }
        } catch (e) {}
      }

      if (!isAuthorized) {
        return res.status(403).json({ error: 'This blog post is currently a draft.' });
      }
    }

    res.json({ blog });
  } catch (err) {
    next(err);
  }
});

// POST /api/blogs — Create a blog post (instructor/admin only)
router.post('/', authMiddleware, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const { title, content, summary, tags, isPublished } = req.body;
    const blog = new Blog({
      title,
      content,
      summary,
      tags: tags || [],
      isPublished: isPublished || false,
      author: req.user._id,
    });

    await blog.save();
    res.status(201).json({ blog, message: 'Blog post created successfully.' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/blogs/:id — Update a blog post
router.put('/:id', authMiddleware, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    // Check ownership
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this blog post.' });
    }

    const { title, content, summary, tags, isPublished } = req.body;
    blog.title = title !== undefined ? title : blog.title;
    blog.content = content !== undefined ? content : blog.content;
    blog.summary = summary !== undefined ? summary : blog.summary;
    blog.tags = tags !== undefined ? tags : blog.tags;
    
    if (isPublished !== undefined) {
      if (isPublished && !blog.isPublished) {
        blog.publishedAt = new Date();
      }
      blog.isPublished = isPublished;
    }

    await blog.save();
    res.json({ blog, message: 'Blog post updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/blogs/:id — Delete a blog post
router.delete('/:id', authMiddleware, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    // Check ownership
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this blog post.' });
    }

    await blog.deleteOne();
    res.json({ message: 'Blog post deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
