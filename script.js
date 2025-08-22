// BookBazaar — App Script (vanilla JS + Bootstrap)
// Demo dataset (you can replace with API calls)
const BOOKS = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self‑Help",
    price: 399,
    rating: 4.8,
    condition: "Like New",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    desc: "Tiny changes, remarkable results. Practical strategies to build good habits and break bad ones.",
    featured: true
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Technology",
    price: 699,
    rating: 4.7,
    condition: "Good",
    cover: "https://images.unsplash.com/photo-1515871204537-9f26ae627a2d?q=80&w=800&auto=format&fit=crop",
    desc: "A handbook of agile software craftsmanship.",
    featured: true
  },
  {
    id: 3,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    genre: "Technology",
    price: 649,
    rating: 4.6,
    condition: "New",
    cover: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=800&auto=format&fit=crop",
    desc: "Journey to mastery with timeless tips for building better software.",
    featured: true
  },
  {
    id: 4,
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Business",
    price: 499,
    rating: 4.5,
    condition: "Like New",
    cover: "https://images.unsplash.com/photo-1544717305-996b815c338c?q=80&w=800&auto=format&fit=crop",
    desc: "Rules for focused success in a distracted world.",
    featured: true
  },
  {
    id: 5,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "Science",
    price: 549,
    rating: 4.6,
    condition: "Good",
    cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
    desc: "A brief history of humankind—how we became who we are.",
    featured: false
  },
  {
    id: 6,
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    price: 299,
    rating: 4.4,
    condition: "Fair",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
    desc: "A fable about following your dream.",
    featured: false
  },
  {
    id: 7,
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson, Rivest, Stein",
    genre: "Technology",
    price: 1499,
    rating: 4.9,
    condition: "New",
    cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    desc: "CLRS — the classic. Comprehensive algorithms reference.",
    featured: false
  },
  {
    id: 8,
    title: "Spider‑Man: Blue",
    author: "Jeph Loeb, Tim Sale",
    genre: "Comics",
    price: 399,
    rating: 4.3,
    condition: "Good",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop",
    desc: "A heartfelt Spidey tale—nostalgic and beautifully illustrated.",
    featured: false
  }
];

let state = {
  books: [...BOOKS],
  cart: [],
  visible: 8,
  activeGenre: "",
  search: "",
  sort: "featured"
};

const grid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const genreFilter = document.getElementById('genreFilter');
const sortSelect = document.getElementById('sortSelect');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const cartCount = document.getElementById('cartCount');
const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

// Render helpers
function starBadges(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="bi bi-star-fill"></i>';
  if (half) html += '<i class="bi bi-star-half"></i>';
  return html;
}

function priceText(p) { return `₹${Number(p).toLocaleString('en-IN')}`; }

function makeCard(b) {
  return `
  <div class="col-6 col-md-4 col-lg-3">
    <div class="card h-100">
      <div class="p-2">
        <img class="book-cover" src="${b.cover}" alt="${b.title}"/>
      </div>
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="badge badge-rating"><i class="bi bi-star-fill"></i> ${b.rating}</span>
          <span class="small text-muted">${b.condition}</span>
        </div>
        <h6 class="mb-1">${b.title}</h6>
        <div class="small text-muted mb-2">${b.author}</div>
        <div class="mt-auto d-flex justify-content-between align-items-center">
          <span class="fw-semibold">${priceText(b.price)}</span>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-light" data-action="details" data-id="${b.id}" title="Details"><i class="bi bi-info-circle"></i></button>
            <button class="btn btn-sm btn-primary" data-action="add" data-id="${b.id}"><i class="bi bi-bag-plus"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function applyFilters() {
  let list = [...state.books];
  if (state.activeGenre) list = list.filter(b => b.genre === state.activeGenre);
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }
  switch (state.sort) {
    case 'priceAsc': list.sort((a,b)=>a.price-b.price); break;
    case 'priceDesc': list.sort((a,b)=>b.price-a.price); break;
    case 'rating': list.sort((a,b)=>b.rating-a.rating); break;
    default: list.sort((a,b)=>Number(b.featured)-Number(a.featured));
  }
  return list;
}

function renderGrid() {
  const list = applyFilters();
  const slice = list.slice(0, state.visible);
  grid.innerHTML = slice.map(makeCard).join('');
  loadMoreBtn.style.display = list.length > state.visible ? 'inline-block' : 'none';
}

// Event wiring
// Search
searchBtn?.addEventListener('click', () => { state.search = (searchInput.value || '').trim(); state.visible = 8; renderGrid(); });
searchInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { state.search = (searchInput.value || '').trim(); state.visible = 8; renderGrid(); }});

// Genre select
genreFilter?.addEventListener('change', (e)=>{ state.activeGenre = e.target.value; state.visible = 8; renderGrid(); });

// Pills
for (const btn of document.querySelectorAll('.filter-chip')) {
  btn.addEventListener('click', (e)=>{
    document.querySelectorAll('.filter-chip').forEach(b=>b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    state.activeGenre = e.currentTarget.dataset.genre || '';
    state.visible = 8; renderGrid();
  });
}

// Sort
sortSelect?.addEventListener('change', (e)=>{ state.sort = e.target.value; renderGrid(); });

// Load more
loadMoreBtn?.addEventListener('click', ()=>{ state.visible += 8; renderGrid(); });

// Grid delegate: add/details
grid?.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const book = state.books.find(b=>b.id===id);
  if (!book) return;

  if (btn.dataset.action === 'add') {
    state.cart.push(id);
    cartCount.textContent = String(state.cart.length);
  } else if (btn.dataset.action === 'details') {
    openDetails(book);
  }
});

// Details modal
const modalEl = document.getElementById('bookModal');
const detailsModal = modalEl ? new bootstrap.Modal(modalEl) : null;
const modalTitle = document.getElementById('modalTitle');
const modalAuthor = document.getElementById('modalAuthor');
const modalGenre = document.getElementById('modalGenre');
const modalRating = document.getElementById('modalRating');
const modalCondition = document.getElementById('modalCondition');
const modalPrice = document.getElementById('modalPrice');
const modalDesc = document.getElementById('modalDesc');
const modalCover = document.getElementById('modalCover');
const modalAdd = document.getElementById('modalAddToCart');

function openDetails(book) {
  modalTitle.textContent = book.title;
  modalAuthor.textContent = book.author;
  modalGenre.textContent = book.genre;
  modalRating.textContent = `${book.rating} ⭐`;
  modalCondition.textContent = book.condition;
  modalPrice.textContent = priceText(book.price);
  modalDesc.textContent = book.desc;
  modalCover.src = book.cover;
  modalCover.alt = book.title;
  modalAdd.onclick = () => { state.cart.push(book.id); cartCount.textContent = String(state.cart.length); };
  detailsModal?.show();
}

// Sell form
const sellForm = document.getElementById('sellForm');
if (sellForm) {
  sellForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(sellForm);
    const newBook = {
      id: Date.now(),
      title: fd.get('title'),
      author: fd.get('author'),
      genre: fd.get('genre'),
      price: Number(fd.get('price')) || 0,
      rating: 4.0,
      condition: fd.get('condition'),
      cover: fd.get('cover') || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
      desc: fd.get('desc') || 'Seller did not add a description.',
      featured: false
    };
    state.books.unshift(newBook);
    state.visible = 8;
    renderGrid();
    const modal = bootstrap.Modal.getInstance(document.getElementById('sellModal'));
    modal?.hide();
    sellForm.reset();
  });
}

// Initial render
renderGrid();
