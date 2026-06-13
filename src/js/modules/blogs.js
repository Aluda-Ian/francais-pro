// Français Pro — Blog Management Logic (Public Listing, Details & CMS Portal)

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:5000/api';
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";

    // Date formatter helper
    const formatDate = (dateStr) => {
        if (!dateStr) return { day: '--', month: '---' };
        const date = new Date(dateStr);
        const day = date.getDate();
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = months[date.getMonth()];
        return { day, month };
    };

    // ==========================================
    // 1. PUBLIC BLOG LISTING (blog.html)
    // ==========================================
    if (page === 'blog.html') {
        const blogsContainer = document.getElementById('blogs-container');

        const fetchBlogs = async () => {
            try {
                const res = await fetch(`${API_BASE}/blogs`);
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error || 'Failed to fetch blogs');

                if (!data.blogs || data.blogs.length === 0) {
                    blogsContainer.innerHTML = `
                        <div class="col-12 text-center py-40">
                            <h5 class="text-neutral-500">No blog posts found.</h5>
                            <p class="text-neutral-400">Check back soon for new articles!</p>
                        </div>
                    `;
                    return;
                }

                blogsContainer.innerHTML = data.blogs.map(blog => {
                    const { day, month } = formatDate(blog.publishedAt || blog.createdAt);
                    return `
                        <div class="col-lg-4 col-sm-6">
                            <div class="scale-hover-item bg-main-25 rounded-16 border-neutral-30 h-100 border p-12">
                                <div class="course-item__thumb rounded-12 relative overflow-hidden">
                                    <a href="blog-details.html?slug=${blog.slug}" class="h-100 w-100">
                                        <div class="w-100 rounded-12 transition-2 flex items-center justify-center bg-gradient-to-r from-main-600 to-main-three-600" style="height: 200px;">
                                            <span class="text-white text-3xl font-extrabold">Français Pro</span>
                                        </div>
                                    </a>
                                    <div class="inset-inline-end-0 inset-block-end-0 rounded-8 bg-main-three-600 absolute me-16 mb-16 px-24 py-12 font-medium text-white">
                                        <h3 class="mb-0 font-medium text-white">${day}</h3>
                                        ${month}
                                    </div>
                                </div>
                                <div class="relative px-16 pt-32 pb-24">
                                    <h4 class="mb-28">
                                        <a href="blog-details.html?slug=${blog.slug}" class="link text-line-2">
                                            ${blog.title}
                                        </a>
                                    </h4>
                                    <div class="my-20 flex flex-wrap items-center gap-14">
                                        <div class="flex items-center gap-8">
                                            <span class="flex text-2xl text-neutral-500">
                                                <i class="ph ph-user-circle"></i>
                                            </span>
                                            <span class="text-lg text-neutral-500"> By ${blog.author?.name || 'Instructor'}</span>
                                        </div>
                                        <span class="rounded-circle h-8 w-8 bg-neutral-100"></span>
                                        <div class="flex items-center gap-8">
                                            <span class="flex text-2xl text-neutral-500">
                                                <i class="ph-bold ph-eye"></i>
                                            </span>
                                            <span class="text-lg text-neutral-500">1.2k</span>
                                        </div>
                                    </div>
                                    <div class="border-top mt-28 flex items-center justify-between gap-8 border-0 border-dashed border-neutral-50 pt-24">
                                        <a href="blog-details.html?slug=${blog.slug}" class="text-main-600 hover-text-decoration-underline transition-1 fw-semibold flex items-center gap-8">
                                            Read More
                                            <i class="ph ph-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

            } catch (err) {
                console.error(err);
                blogsContainer.innerHTML = `<div class="col-12 text-center py-40 text-danger-600">Failed to load blogs. Please try again.</div>`;
            }
        };

        fetchBlogs();
    }

    // ==========================================
    // 2. BLOG DETAILS (blog-details.html)
    // ==========================================
    if (page === 'blog-details.html') {
        const blogDetailsCard = document.getElementById('blog-details-card');
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');

        const fetchBlogDetails = async () => {
            if (!slug) {
                blogDetailsCard.innerHTML = `<div class="text-center py-40 text-danger-600">No blog post specified.</div>`;
                return;
            }

            try {
                // Pass auth token optionally to read drafts
                const token = localStorage.getItem('fp_token');
                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`${API_BASE}/blogs/${slug}`, { headers });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Failed to fetch article details.');

                const blog = data.blog;
                const { day, month } = formatDate(blog.publishedAt || blog.createdAt);

                blogDetailsCard.innerHTML = `
                    <div class="rounded-12 relative overflow-hidden">
                        <div class="w-100 rounded-12 transition-2 flex items-center justify-center bg-gradient-to-r from-main-600 to-main-three-600" style="height: 350px;">
                            <span class="text-white text-5xl font-extrabold">Français Pro</span>
                        </div>
                        <div class="inset-inline-end-0 inset-block-end-0 rounded-8 bg-main-two-600 absolute me-16 mb-16 px-24 py-12 font-medium text-white">
                            <h3 class="mb-0 font-medium text-white">${day}</h3>
                            ${month}
                        </div>
                    </div>
                    <div class="relative px-16 pt-32 pb-24">
                        <div class="mb-20 flex flex-wrap items-center gap-14">
                            <div class="flex items-center gap-8">
                                <span class="flex text-2xl text-neutral-500">
                                    <i class="ph ph-user-circle"></i>
                                </span>
                                <span class="text-lg text-neutral-500"> By ${blog.author?.name || 'Instructor'}</span>
                            </div>
                            <span class="rounded-circle h-8 w-8 bg-neutral-100"></span>
                            <div class="flex items-center gap-8">
                                <span class="flex text-2xl text-neutral-500">
                                    <i class="ph-bold ph-eye"></i>
                                </span>
                                <span class="text-lg text-neutral-500">1.2k</span>
                            </div>
                        </div>
                        <h2 class="mb-24">${blog.title}</h2>
                        <div class="text-neutral-600 leading-relaxed mt-24">
                            ${blog.content}
                        </div>
                    </div>
                `;

            } catch (err) {
                console.error(err);
                blogDetailsCard.innerHTML = `<div class="text-center py-40 text-danger-600">${err.message}</div>`;
            }
        };

        fetchBlogDetails();
    }

    // ==========================================
    // 3. BLOG CMS MANAGER (cms-blogs.html)
    // ==========================================
    if (page === 'cms-blogs.html') {
        const blogForm = document.getElementById('blog-form');
        const blogIdInput = document.getElementById('blog-id');
        const titleInput = document.getElementById('title');
        const tagsInput = document.getElementById('tags');
        const summaryInput = document.getElementById('summary');
        const contentInput = document.getElementById('content');
        const isPublishedInput = document.getElementById('isPublished');
        const submitBtn = document.getElementById('submit-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const editorTitle = document.getElementById('editor-title');
        const cmsBlogsList = document.getElementById('cms-blogs-list');

        const token = localStorage.getItem('fp_token');

        const loadCMSBlogs = async () => {
            try {
                const res = await fetch(`${API_BASE}/blogs?admin=true`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Failed to fetch blogs for administration.');

                if (!data.blogs || data.blogs.length === 0) {
                    cmsBlogsList.innerHTML = `
                        <tr>
                            <td colspan="4" class="py-24 text-center text-neutral-400">No blog posts created yet. Write your first post above!</td>
                        </tr>
                    `;
                    return;
                }

                cmsBlogsList.innerHTML = data.blogs.map(blog => {
                    const pubDate = blog.isPublished && blog.publishedAt 
                        ? new Date(blog.publishedAt).toLocaleDateString()
                        : 'Not Published';
                    
                    const statusBadge = blog.isPublished 
                        ? `<span class="bg-success-50 text-success-600 border border-success-100 rounded-10 px-12 py-4 font-medium text-xs">Published</span>`
                        : `<span class="bg-warning-50 text-warning-600 border border-warning-100 rounded-10 px-12 py-4 font-medium text-xs">Draft</span>`;

                    return `
                        <tr class="border-b border-neutral-20 hover:bg-neutral-10 transition-colors">
                            <td class="py-16 px-8 text-neutral-800 font-medium">${blog.title}</td>
                            <td class="py-16 px-8">${statusBadge}</td>
                            <td class="py-16 px-8 text-neutral-500 text-sm">${pubDate}</td>
                            <td class="py-16 px-8 text-right">
                                <div class="flex items-center justify-end gap-12">
                                    <button class="edit-blog-btn text-main-600 hover:text-main-800 font-semibold" data-id="${blog.id}" data-title="${blog.title}" data-summary="${blog.summary || ''}" data-content="${blog.content}" data-tags="${blog.tags ? blog.tags.join(', ') : ''}" data-published="${blog.isPublished}">
                                        Edit
                                    </button>
                                    <button class="delete-blog-btn text-danger-600 hover:text-danger-800 font-semibold" data-id="${blog.id}">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');

                // Attach Action Listeners
                document.querySelectorAll('.edit-blog-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const b = e.target.dataset;
                        blogIdInput.value = e.target.getAttribute('data-id'); // Read ID accurately
                        titleInput.value = b.title;
                        tagsInput.value = b.tags;
                        summaryInput.value = b.summary;
                        contentInput.value = b.content;
                        isPublishedInput.checked = b.published === 'true';

                        editorTitle.textContent = 'Edit Blog Post';
                        submitBtn.textContent = 'Update Post';
                        cancelBtn.classList.remove('hidden');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                });

                document.querySelectorAll('.delete-blog-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.target.getAttribute('data-id');
                        if (!confirm('Are you sure you want to delete this blog post?')) return;

                        try {
                            const res = await fetch(`${API_BASE}/blogs/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) {
                                const data = await res.json();
                                throw new Error(data.error || 'Failed to delete blog post');
                            }
                            alert('Blog post deleted.');
                            loadCMSBlogs();
                        } catch (err) {
                            alert(err.message);
                        }
                    });
                });

            } catch (err) {
                console.error(err);
                cmsBlogsList.innerHTML = `<tr><td colspan="4" class="py-24 text-center text-danger-600">Failed to load blog posts list.</td></tr>`;
            }
        };

        // Form Submit Handler
        blogForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const blogId = blogIdInput.value;
            const payload = {
                title: titleInput.value.trim(),
                tags: tagsInput.value.split(',').map(t => t.trim()).filter(t => t !== ''),
                summary: summaryInput.value.trim(),
                content: contentInput.value.trim(),
                isPublished: isPublishedInput.checked
            };

            const method = blogId ? 'PUT' : 'POST';
            const url = blogId ? `${API_BASE}/blogs/${blogId}` : `${API_BASE}/blogs`;

            try {
                const res = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to save blog post');

                alert(blogId ? 'Blog post updated!' : 'Blog post created!');
                resetForm();
                loadCMSBlogs();
            } catch (err) {
                alert(err.message);
            }
        });

        // Cancel Edit handler
        const resetForm = () => {
            blogIdInput.value = '';
            blogForm.reset();
            editorTitle.textContent = 'Create New Blog Post';
            submitBtn.textContent = 'Save Post';
            cancelBtn.classList.add('hidden');
        };

        cancelBtn.addEventListener('click', resetForm);

        // Load initially
        loadCMSBlogs();
    }
});
