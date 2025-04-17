document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const categoryFilter = document.getElementById('category-filter');
    const folderFilters = document.getElementById('folder-filters');
    const resourcesContainer = document.getElementById('resources-container');
    
    // Get unique folders
    const uniqueFolders = [...new Set(bookmarksData.map(b => b.folder_path))].filter(Boolean);
    
    // Create folder filter buttons
    uniqueFolders.forEach(folder => {
        if (folder) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-secondary btn-sm folder-btn';
            btn.dataset.folder = folder;
            btn.textContent = folder;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.folder-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderBookmarks();
            });
            folderFilters.appendChild(btn);
        }
    });
    
    // Add "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'btn btn-outline-secondary btn-sm folder-btn active';
    allBtn.textContent = 'All Folders';
    allBtn.addEventListener('click', () => {
        document.querySelectorAll('.folder-btn').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        renderBookmarks();
    });
    folderFilters.prepend(allBtn);
    
    // Event listeners
    searchBtn.addEventListener('click', renderBookmarks);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            renderBookmarks();
        }
    });
    categoryFilter.addEventListener('change', renderBookmarks);
    
    // Initial render
    renderBookmarks();
    
    function renderBookmarks() {
        const searchTerm = searchInput.value.toLowerCase();
        const categoryValue = categoryFilter.value;
        const activeFolder = document.querySelector('.folder-btn.active')?.dataset.folder;
        
        let filteredBookmarks = bookmarksData;
        
        // Filter by search term
        if (searchTerm) {
            filteredBookmarks = filteredBookmarks.filter(b => 
                b.title.toLowerCase().includes(searchTerm) || 
                b.url.toLowerCase().includes(searchTerm) ||
                b.domain.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by category
        if (categoryValue !== 'all') {
            filteredBookmarks = filteredBookmarks.filter(b => 
                b.nocode_categories.includes(categoryValue)
            );
        }
        
        // Filter by folder
        if (activeFolder && activeFolder !== 'All Folders') {
            filteredBookmarks = filteredBookmarks.filter(b => 
                b.folder_path === activeFolder
            );
        }
        
        // Sort bookmarks by title
        filteredBookmarks.sort((a, b) => a.title.localeCompare(b.title));
        
        // Group by categories for display
        const groupedBookmarks = {};
        
        filteredBookmarks.forEach(bookmark => {
            // Use first category as primary for grouping
            const primaryCategory = bookmark.nocode_categories[0] || 'other';
            
            if (!groupedBookmarks[primaryCategory]) {
                groupedBookmarks[primaryCategory] = [];
            }
            
            groupedBookmarks[primaryCategory].push(bookmark);
        });
        
        // Clear container
        resourcesContainer.innerHTML = '';
        
        // Check if no results
        if (filteredBookmarks.length === 0) {
            resourcesContainer.innerHTML = '<div class="alert alert-info">No bookmarks found matching your criteria.</div>';
            return;
        }
        
        // Render bookmarks by category
        Object.keys(groupedBookmarks).sort().forEach(category => {
            const categoryTitle = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            const categorySection = document.createElement('section');
            categorySection.className = 'mb-5';
            categorySection.innerHTML = `<h2 class="mb-4">${categoryTitle}</h2>`;
            
            const cardDeck = document.createElement('div');
            cardDeck.className = 'row';
            
            groupedBookmarks[category].forEach(bookmark => {
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4';
                
                // Create category badges
                const badgesHtml = bookmark.nocode_categories.map(cat => {
                    const badgeClass = getCategoryBadgeClass(cat);
                    return `<span class="badge ${badgeClass} category-badge">${formatCategoryName(cat)}</span>`;
                }).join('');
                
                // Format the favicon or use default icon
                let iconHtml = '';
                if (bookmark.icon && bookmark.icon.startsWith('data:')) {
                    iconHtml = `<img src="${bookmark.icon}" class="bookmark-icon" alt="icon">`;
                } else {
                    iconHtml = `<svg class="bookmark-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                    </svg>`;
                }
                
                card.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${iconHtml}${bookmark.title}</h5>
                            <p class="card-text text-truncate">${bookmark.url}</p>
                            <div class="mb-2">
                                ${badgesHtml}
                            </div>
                            <p class="folder-path mb-3">${bookmark.folder_path || 'Root'}</p>
                            <a href="${bookmark.url}" target="_blank" class="btn btn-sm btn-primary">Visit</a>
                        </div>
                    </div>
                `;
                
                cardDeck.appendChild(card);
            });
            
            categorySection.appendChild(cardDeck);
            resourcesContainer.appendChild(categorySection);
        });
    }
    
    function getCategoryBadgeClass(category) {
        const badgeClasses = {
            'no-code-tools': 'bg-primary',
            'low-code-tools': 'bg-info',
            'databases': 'bg-success',
            'automation': 'bg-warning',
            'templates': 'bg-secondary',
            'tutorials': 'bg-danger',
            'apis': 'bg-dark',
            'design': 'bg-primary',
            'community': 'bg-info',
            'other': 'bg-secondary'
        };
        
        return badgeClasses[category] || 'bg-secondary';
    }
    
    function formatCategoryName(category) {
        return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
});
