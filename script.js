// ==========================================
// INISIALISASI FIREBASE DATABASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAZuXGYYv14eKlU4F6WrOncAdt7DynY__k",
    authDomain: "rllll-f5127.firebaseapp.com",
    projectId: "rllll-f5127",
    storageBucket: "rllll-f5127.firebasestorage.app",
    messagingSenderId: "817168787948",
    appId: "1:817168787948:web:6d9c87191ed9746d4ab8c9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.enablePersistence().catch((err) => {
    console.log("Persistence error:", err.message);
});

const auth = firebase.auth(); 

// ==========================================
// FITUR STATUS ONLINE & TERAKHIR DILIHAT
// ==========================================
function updateOnlineStatus() {
    if (auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).set({
            lastOnline: firebase.firestore.FieldValue.serverTimestamp(),
            isOnline: true
        }, { merge: true });
    }
}

// ==========================================
// PELACAK TOP 3 TYPIST GLOBAL (REAL-TIME)
// ==========================================
let topTypistsUIDs = [];
db.collection('typing_scores')
    .orderBy('wpm', 'desc')
    .limit(20) 
    .onSnapshot(snapshot => {
        topTypistsUIDs = [];
        snapshot.forEach(doc => {
            const uid = doc.data().uid;
            if (!topTypistsUIDs.includes(uid) && topTypistsUIDs.length < 3) {
                topTypistsUIDs.push(uid);
            }
        });
    });

let books = [];

const defaultBooks = [
    { title: "Bumi Manusia", author: "Pramoedya Ananta Toer", category: "fiksi", image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1565658920i/1398034.jpg", synopsis: "Kisah cinta Minke dan Annelies di masa kolonial Belanda yang penuh ketidakadilan sosial." },
    { title: "Laskar Pelangi", author: "Andrea Hirata", category: "fiksi", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80", synopsis: "Perjuangan 10 anak desa di Belitung untuk mendapatkan pendidikan di sekolah yang nyaris rubuh." },
    { title: "Nusantara: Sejarah Indonesia", author: "Bernard H.M. Vlekke", category: "sejarah", image: "https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=300&q=80", synopsis: "Catatan panjang sejarah nusantara sejak zaman kerajaan Hindu-Buddha hingga era kemerdekaan." },
    { title: "Fisika Kuantum Dasar", author: "Yohanes Surya", category: "sains", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=300&q=80", synopsis: "Penjelasan fisika kuantum dengan pendekatan matematika yang disederhanakan." },
    { title: "Cantik Itu Luka", author: "Eka Kurniawan", category: "fiksi", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80", synopsis: "Sejarah berdarah yang diceritakan melalui tragedi ironis sebuah keluarga sepanjang masa penjajahan." },
    { title: "Penyambung Lidah Rakyat", author: "Cindy Adams", category: "sejarah", image: "https://images.unsplash.com/photo-1555809403-1002e21b0698?auto=format&fit=crop&w=300&q=80", synopsis: "Buku otobiografi resmi Presiden Soekarno yang menceritakan visi dan perjuangannya untuk bangsa." },
    { title: "Pulang", author: "Tere Liye", category: "fiksi", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=300&q=80", synopsis: "Kisah aksi seorang pemuda desa yang ditarik ke dalam gelapnya dunia ekonomi bayangan." },
    { title: "Anatomi Tumbuhan", author: "Sri Mulyani", category: "sains", image: "https://images.unsplash.com/photo-1466692476877-3aa0c8227d82?auto=format&fit=crop&w=300&q=80", synopsis: "Eksplorasi mendalam mengenai struktur sel dan jaringan penyusun tumbuhan." },
    { title: "Hujan", author: "Tere Liye", category: "fiksi", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=300&q=80", synopsis: "Kisah tentang persahabatan, cinta, dan perpisahan berlatar dunia masa depan yang canggih setelah dilanda bencana alam dahsyat." },
    { title: "Bumi", author: "Tere Liye", category: "fiksi", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=300&q=80", synopsis: "Petualangan fantasi tiga remaja, Raib, Seli, dan Ali, yang menjelajahi klan-klan tersembunyi di dunia paralel menggunakan kekuatan unik mereka." },
    { title: "Perahu Kertas", author: "Dee Lestari", category: "fiksi", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80", synopsis: "Kisah pasang surut hubungan Kugy dan Keenan dalam mengejar cita-cita, cinta, dan jati diri mereka yang penuh idealisme." },
    { title: "Dikta & Hukum", author: "Dhia'an Farah", category: "fiksi", image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=300&q=80", synopsis: "Cerita haru tentang Dikta, seorang mahasiswa hukum cerdas, dan Nadhira, anak SMA yang malas, yang terjebak dalam perjodohan di tengah rahasia besar kehidupan Dikta." },
    { title: "Gadis Kretek", author: "Ratih Kumala", category: "fiksi", image: "https://images.unsplash.com/photo-1524578988636-23961bcf76a6?auto=format&fit=crop&w=300&q=80", synopsis: "Pencarian cinta masa lalu yang mengungkap rahasia keluarga dan sejarah perkembangan industri rokok kretek legendaris di Jawa." },
    { title: "Ronggeng Dukuh Paruk", author: "Ahmad Tohari", category: "fiksi", image: "https://images.unsplash.com/photo-1518341618306-69d25a815a5f?auto=format&fit=crop&w=300&q=80", synopsis: "Kisah tragis Srintil, seorang penari ronggeng di sebuah desa terpencil yang terjebak di tengah kemiskinan dan pergolakan politik tahun 1965." },
    { title: "Laut Bercerita", author: "Leila S. Chudori", category: "fiksi", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=300&q=80", synopsis: "Kisah menyentuh tentang perjuangan para aktivis mahasiswa di era reformasi 1998 dan duka mendalam keluarga yang kehilangan mereka." }
];

window.closeSuccessModal = function() {
    const modal = document.getElementById('successModal');
    if(modal) modal.classList.remove('show');
    const animatedCheck = document.getElementById('animatedCheck');
    if(animatedCheck) animatedCheck.checked = false; 
    showPage('bukusaya'); 
}

const popularBookGrid = document.getElementById('popularBookGrid'); 
const katalogBookGrid = document.getElementById('katalogBookGrid'); 
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');

db.collection('books').onSnapshot((bookSnapshot) => {
    if (bookSnapshot.empty) {
        defaultBooks.forEach(b => db.collection('books').add(b));
        return; 
    }

    db.collection('reviews').onSnapshot((reviewSnapshot) => {
        const ratingStats = {};

        reviewSnapshot.forEach((doc) => {
            const review = doc.data();
            if (!ratingStats[review.bookId]) {
                ratingStats[review.bookId] = { totalStars: 0, count: 0 };
            }
            ratingStats[review.bookId].totalStars += review.rating;
            ratingStats[review.bookId].count += 1;
        });

        books = [];
        const seenTitles = new Set(); 

        bookSnapshot.forEach((doc) => {
            const data = doc.data();
            const judul = data.title ? data.title.toLowerCase().trim() : "";
            
            if (!seenTitles.has(judul)) {
                seenTitles.add(judul);
                const stats = ratingStats[doc.id];
                const avgRating = stats ? parseFloat((stats.totalStars / stats.count).toFixed(1)) : 0.0;
                const totalReviews = stats ? stats.count : 0;

                books.push({ 
                    id: doc.id, 
                    ...data,
                    averageRating: avgRating,
                    reviewCount: totalReviews
                });
            }
        });
        
        const activeNav = document.querySelector('.nav-links a.active');
        if (activeNav && activeNav.id === 'navBeranda') {
            const popularBooks = [...books].sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);
            renderPopularBooks(popularBooks.slice(0, 5), popularBookGrid);
        } else {
            filterAndSearch();
        }
        
        const totalBooksCard = document.getElementById('totalBooksCard');
        if (totalBooksCard) totalBooksCard.textContent = books.length;
    });
}, (error) => console.error("Gagal sinkron data buku: ", error));

function renderPopularBooks(bookArray, targetContainer) {
    if (!targetContainer) return;
    targetContainer.innerHTML = ''; 
    
    if (bookArray.length === 0) {
        targetContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-size: 1.2rem;">Buku tidak ditemukan.</p>';
        return;
    }

    const isAdmin = (roleInfo === 'admin' || auth.currentUser?.email === 'admin@gmail.com');

    bookArray.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        const safeId = book.id;
        
        let ratingBadgeHTML = `<div class="avg-rating">⭐ ${book.averageRating > 0 ? book.averageRating : '0.0'} (${book.reviewCount} Ulasan)</div>`;
        let actionButtonHTML = `<button class="btn-borrow" onclick="borrowBook('${safeId}')">Pinjam Buku</button>`;
        
        if (isAdmin) {
            actionButtonHTML = `
                <div style="display:flex; margin-top:auto;">
                    <button class="btn-borrow" style="background:#e11d48; color:white; width: 100%;" onclick="deleteBook('${safeId}')"><i class="fas fa-trash"></i> Hapus Buku</button>
                </div>
            `;
        }

        card.innerHTML = `
            <img src="${book.image}" alt="${book.title}" class="book-cover" onclick="openBookDetail('${safeId}')" style="cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="book-category">${book.category}</span>
                ${ratingBadgeHTML}
            </div>
            <h3 class="book-title" onclick="openBookDetail('${safeId}')" style="cursor: pointer; color: #1e40af;">${book.title}</h3>
            <p class="book-author">${book.author}</p>
            <p class="book-synopsis">${book.synopsis}</p> 
            ${actionButtonHTML}
        `;
        targetContainer.appendChild(card);
    });
}

function filterAndSearch() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const activeBtn = document.querySelector('.filter-btn.active');
    const activeCategory = activeBtn ? activeBtn.dataset.filter : 'all';
    
    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || book.category === activeCategory;
        return matchesSearch && matchesCategory;
    });
    
    renderPopularBooks(filteredBooks, katalogBookGrid);
    
    if (searchTerm !== '' && document.getElementById('navBeranda') && document.getElementById('navBeranda').classList.contains('active')) {
        showPage('katalog'); 
    }
}

if(searchInput) searchInput.addEventListener('input', filterAndSearch);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterAndSearch();
    });
});

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ==========================================
// VARIABEL STATUS PENGGUNA & NAVIGASI
// ==========================================
let isLoggedIn = false; 
let currentUid = null; 
let borrowedBooksList = []; 
let cartList = []; 
let myFriendsList = []; 
let myPendingRequests = []; 
let roleInfo = 'user';
let userNameInfo = 'Guest';
let userAvatarInfo = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
let currentChatId = null;

const navBeranda = document.getElementById('navBeranda');
const navKatalog = document.getElementById('navKatalog');
const navBukuSaya = document.getElementById('navBukuSaya');
const navKeranjang = document.getElementById('navKeranjang');
const navGame = document.getElementById('navGame');
const adminNav = document.getElementById('adminNav');
const userNav = document.getElementById('userNav');
const cartNav = document.getElementById('cartNav');
const navDashboard = document.getElementById('navDashboard');
const navKomunitas = document.getElementById('navKomunitas');
const komunitasNavContainer = document.getElementById('komunitasNavContainer');
const navProfil = document.getElementById('navProfil'); 

const heroSection = document.getElementById('heroSection');
const homeView = document.getElementById('homeView');
const katalogView = document.getElementById('katalogView');
const bukuSayaView = document.getElementById('bukuSayaView');
const keranjangView = document.getElementById('keranjangView');
const gameView = document.getElementById('gameView');
const adminDashboard = document.getElementById('adminDashboard');
const komunitasView = document.getElementById('komunitasView');
const profilView = document.getElementById('profilView'); 

function showPage(page) {
    if(navBeranda) navBeranda.classList.remove('active');
    if(navKatalog) navKatalog.classList.remove('active');
    if(navBukuSaya) navBukuSaya.classList.remove('active');
    if(navKeranjang) navKeranjang.classList.remove('active');
    if(navGame) navGame.classList.remove('active');
    if(navDashboard) navDashboard.classList.remove('active');
    if(navKomunitas) navKomunitas.classList.remove('active');
    if(navProfil) navProfil.classList.remove('active'); 

    if(heroSection) heroSection.style.display = 'none';
    if(homeView) homeView.style.display = 'none';
    if(katalogView) katalogView.style.display = 'none';
    if(bukuSayaView) bukuSayaView.style.display = 'none';
    if(keranjangView) keranjangView.style.display = 'none';
    if(gameView) gameView.style.display = 'none';
    if(adminDashboard) adminDashboard.style.display = 'none';
    if(komunitasView) komunitasView.style.display = 'none';
    if(profilView) profilView.style.display = 'none'; 

    if (page === 'home') {
        if(heroSection) heroSection.style.display = 'block';
        if(homeView) homeView.style.display = 'block'; 
        if(navBeranda) navBeranda.classList.add('active');
        const popularBooks = [...books].sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);
        renderPopularBooks(popularBooks.slice(0, 5), popularBookGrid);
    } else if (page === 'katalog') {
        if(katalogView) katalogView.style.display = 'block'; 
        if(navKatalog) navKatalog.classList.add('active');
        filterAndSearch();
    } else if (page === 'bukusaya') {
        if(bukuSayaView) bukuSayaView.style.display = 'block'; 
        if(navBukuSaya) navBukuSaya.classList.add('active');
        renderBukuSaya(); 
    } else if (page === 'keranjang') {
        if(keranjangView) keranjangView.style.display = 'block'; 
        if(navKeranjang) navKeranjang.classList.add('active');
        renderKeranjang(); 
    } else if (page === 'game') {
        if(gameView) gameView.style.display = 'block';
        if(navGame) navGame.classList.add('active');
        loadLeaderboard(); 
    } else if (page === 'dashboard') {
        if(adminDashboard) adminDashboard.style.display = 'block';
        if(navDashboard) navDashboard.classList.add('active');
    } else if (page === 'komunitas') {
        if(komunitasView) komunitasView.style.display = 'block';
        if(navKomunitas) navKomunitas.classList.add('active');
        renderFriendRequests(); 
        renderMyFriends(); 
    } else if (page === 'profil') {
        if(profilView) profilView.style.display = 'block';
        if(navProfil) navProfil.classList.add('active');
        loadProfileData(); 
    }
}

if(navBeranda) navBeranda.addEventListener('click', (e) => { e.preventDefault(); showPage('home'); });
if(navKatalog) navKatalog.addEventListener('click', (e) => { e.preventDefault(); showPage('katalog'); });
if(navBukuSaya) navBukuSaya.addEventListener('click', (e) => { e.preventDefault(); showPage('bukusaya'); });
if(navKeranjang) navKeranjang.addEventListener('click', (e) => { e.preventDefault(); showPage('keranjang'); });
if(navGame) navGame.addEventListener('click', (e) => { e.preventDefault(); showPage('game'); });
if(navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); showPage('dashboard'); });
if(navKomunitas) navKomunitas.addEventListener('click', (e) => { e.preventDefault(); showPage('komunitas'); });
if(navProfil) navProfil.addEventListener('click', (e) => { e.preventDefault(); showPage('profil'); });

// ==========================================
// LOGIKA FORM AUTHENTICATION
// ==========================================
let authMode = 'login'; 
const authToggleLink = document.getElementById('authToggleLink');
const usernameGroup = document.getElementById('usernameGroup');
const usernameInput = document.getElementById('username');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authToggleText = document.getElementById('authToggleText');

if(authToggleLink) {
    authToggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (authMode === 'login') {
            authMode = 'register';
            usernameGroup.style.display = 'block'; 
            usernameInput.required = true;
            authSubmitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Akun Baru';
            authToggleText.textContent = 'Sudah punya akun?';
            authToggleLink.textContent = 'Login di sini';
        } else {
            authMode = 'login';
            usernameGroup.style.display = 'none'; 
            usernameInput.required = false;
            authSubmitBtn.innerHTML = 'Masuk Sekarang';
            authToggleText.textContent = 'Belum punya akun?';
            authToggleLink.textContent = 'Register di sini';
        }
    });
}

document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'authForm') {
        e.preventDefault(); 
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const username = usernameInput ? usernameInput.value.trim() : '';
        const formAuth = document.getElementById('authForm');
        
        authSubmitBtn.disabled = true;
        authSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

        if (authMode === 'register') {
            auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return db.collection('users').doc(userCredential.user.uid).set({
                    username: username,
                    email: email,
                    role: 'user', 
                    friends: [],
                    pendingRequests: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                showToast('Registrasi berhasil!');
                formAuth.reset();
            })
            .catch((error) => { showToast(`Gagal: ${error.message}`); })
            .finally(() => { authSubmitBtn.disabled = false; });
        } else {
            auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                showToast(`Login berhasil!`);
                formAuth.reset();
            })
            .catch(() => { showToast(`Login Gagal: Email atau Password salah.`); })
            .finally(() => {
                authSubmitBtn.disabled = false;
                authSubmitBtn.innerHTML = 'Masuk Sekarang';
            });
        }
    }
});

const loginBtn = document.getElementById('loginBtn'); 
if(loginBtn) {
    loginBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            showToast("Berhasil keluar.");
            userAvatarInfo = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
        });
    });
}

let unsubsDashboard = null; 
let unsubsUser = null; 
let unsubNotifications = null; 

auth.onAuthStateChanged((user) => {
    const authInterface = document.getElementById('authInterface');
    const mainAppInterface = document.getElementById('mainAppInterface');

    if (user) {
        isLoggedIn = true; 
        currentUid = user.uid; 
        userNameInfo = user.email; 
        
        if(authInterface) authInterface.style.display = 'none';
        if(mainAppInterface) mainAppInterface.style.display = 'block';

        // UPDATE STATUS ONLINE KE FIREBASE
        updateOnlineStatus();
        window.addEventListener('beforeunload', () => {
            db.collection('users').doc(user.uid).set({
                isOnline: false,
                lastOnline: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });

        if(unsubsUser) unsubsUser();
        unsubsUser = db.collection('users').doc(user.uid).onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                userNameInfo = data.username || user.email;
                userAvatarInfo = data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                roleInfo = data.role || 'user';
                borrowedBooksList = Array.isArray(data.borrowedBooks) ? data.borrowedBooks : [];
                cartList = Array.isArray(data.cart) ? data.cart : [];
                myFriendsList = Array.isArray(data.friends) ? data.friends : [];
                myPendingRequests = Array.isArray(data.pendingRequests) ? data.pendingRequests : [];
                
                updateCartBadge();
            
            // SISTEM LISTENER NOTIFIKASI PESAN BARU
            if (unsubNotifications) unsubNotifications();
            unsubNotifications = db.collection('notifications')
                .where('recipientId', '==', user.uid)
                .where('read', '==', false)
                .onSnapshot(snap => {
                    let unreadCount = 0;
                    
                    snap.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const notif = change.doc.data();
                            const expectedChatId = [user.uid, notif.senderId].sort().join('_');
                            
                            // Jika user sedang membuka obrolan dengan pengirim pesan ini
                            if (currentChatId === expectedChatId && document.getElementById('chatModal').classList.contains('show')) {
                                change.doc.ref.update({ read: true }); // Otomatis tandai sudah dibaca
                            } else {
                                showToast(`💬 Pesan baru dari ${notif.senderName}`);
                            }
                        }
                    });
                    
                    snap.forEach(doc => {
                        const notif = doc.data();
                        const expectedChatId = [user.uid, notif.senderId].sort().join('_');
                        if (!(currentChatId === expectedChatId && document.getElementById('chatModal').classList.contains('show'))) {
                            unreadCount++;
                        }
                    });

                    const badge = document.getElementById('chatNotifBadge');
                    if (badge) {
                        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                        badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
                    }
                });
                
                if (navKomunitas && navKomunitas.classList.contains('active')) {
                    renderFriendRequests();
                    renderMyFriends();
                }

                if (user.email === 'admin@gmail.com' || roleInfo === 'admin') {
                    roleInfo = 'admin';
                    if(adminNav) adminNav.style.display = 'block'; 
                    if(userNav) userNav.style.display = 'none';
                    if(cartNav) cartNav.style.display = 'none';
                    if(komunitasNavContainer) komunitasNavContainer.style.display = 'none';
                    showPage('dashboard'); 
                    activateRealtimeDashboard(); 
                } else {
                    if(adminNav) adminNav.style.display = 'none'; 
                    if(userNav) userNav.style.display = 'block'; 
                    if(cartNav) cartNav.style.display = 'block'; 
                    if(komunitasNavContainer) komunitasNavContainer.style.display = 'block';
                    if(!navBeranda.classList.contains('active') && !navKatalog.classList.contains('active') && !navBukuSaya.classList.contains('active') && !navKeranjang.classList.contains('active') && !navKomunitas.classList.contains('active') && !navProfil.classList.contains('active') && !navGame.classList.contains('active')) {
                        showPage('home');
                    }
                    if(unsubsDashboard) { unsubsDashboard(); unsubsDashboard = null; }
                }
            }
        });
    } else {
        isLoggedIn = false;
        currentUid = null;
        borrowedBooksList = [];
        cartList = [];
        myFriendsList = [];
        myPendingRequests = [];
        roleInfo = 'user';
        userNameInfo = 'Guest';
        if(unsubsDashboard) { unsubsDashboard(); unsubsDashboard = null; }
        if(unsubsUser) { unsubsUser(); unsubsUser = null; }
        
        if(document.getElementById('cartBadge')) document.getElementById('cartBadge').textContent = '(0)';
        if(authInterface) authInterface.style.display = 'flex';
        if(mainAppInterface) mainAppInterface.style.display = 'none';
    }
});

function activateRealtimeDashboard() {
    if(unsubsDashboard) unsubsDashboard();

    // 1. Snapshot untuk menarik total Ulasan (Reviews) secara real-time
    db.collection('reviews').onSnapshot((snap) => {
        const totalReviewsCard = document.getElementById('totalReviewsCard');
        if(totalReviewsCard) totalReviewsCard.textContent = snap.size;
    });

    // 2. Snapshot untuk menarik data Pengguna dan Peminjaman
    unsubsDashboard = db.collection('users').onSnapshot((snapshot) => {
        let liveBorrowData = { fiksi: 0, sejarah: 0, sains: 0 };
        let countTotalBorrowed = 0;
        let countTotalUsers = 0;
        let recentBorrows = []; // Array untuk tabel log

        snapshot.forEach((doc) => {
            const userData = doc.data();
            countTotalUsers++; // Menghitung total pengguna

            if (userData.borrowedBooks && Array.isArray(userData.borrowedBooks)) {
                userData.borrowedBooks.forEach((b) => {
                    countTotalBorrowed++;
                    
                    // Rekap untuk grafik
                    const categoryKey = b.category ? b.category.toLowerCase() : '';
                    if (liveBorrowData[categoryKey] !== undefined) {
                        liveBorrowData[categoryKey]++;
                    }

                    // Push ke array log riwayat peminjaman
                    recentBorrows.push({
                        username: userData.username || 'Anonim',
                        bookTitle: b.title,
                        time: b.borrowTime
                    });
                });
            }
        });

        // Update Kartu Statistik
        const totalPinjamCard = document.getElementById('totalPinjamCard');
        if (totalPinjamCard) totalPinjamCard.textContent = countTotalBorrowed;
        
        const totalUsersCard = document.getElementById('totalUsersCard');
        if (totalUsersCard) totalUsersCard.textContent = countTotalUsers;

        // Update Tabel Log Peminjaman
        const tableBody = document.getElementById('recentBorrowsTable');
        if (tableBody) {
            tableBody.innerHTML = '';
            
            // Urutkan dari yang terbaru (waktu terbesar) ke terlama
            recentBorrows.sort((a, b) => b.time - a.time);
            const top5 = recentBorrows.slice(0, 5); // Ambil 5 transaksi terakhir

            if (top5.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#64748b;">Belum ada aktivitas peminjaman.</td></tr>';
            } else {
                top5.forEach(item => {
                    // Format waktu menjadi lebih rapi
                    const dateStr = new Date(item.time).toLocaleString('id-ID', { 
                        day: '2-digit', month: 'short', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                    });
                    
                    tableBody.innerHTML += `
                        <tr>
                            <td><b style="color: #1e40af;">${item.username}</b></td>
                            <td>${item.bookTitle}</td>
                            <td style="color: #64748b;">${dateStr}</td>
                        </tr>
                    `;
                });
            }
        }

        // Update Grafik (Chart.js)
        if(charts.fiksi && charts.fiksi.data) { 
            charts.fiksi.data.datasets[0].data = [liveBorrowData.fiksi]; 
            charts.fiksi.update(); 
        }
        if(charts.sejarah && charts.sejarah.data) { 
            charts.sejarah.data.datasets[0].data = [liveBorrowData.sejarah]; 
            charts.sejarah.update(); 
        }
        if(charts.sains && charts.sains.data) { 
            charts.sains.data.datasets[0].data = [liveBorrowData.sains]; 
            charts.sains.update(); 
        }
    });
}

// ==========================================
// OPERASI CRUD BUKU (ADMIN)
// ==========================================
const adminBookFormDOM = document.getElementById('adminBookForm');

if (adminBookFormDOM) {
    adminBookFormDOM.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        const inputTitle = document.getElementById('adminBookTitle');
        const inputAuthor = document.getElementById('adminBookAuthor');
        const inputCat = document.getElementById('adminBookCategory');
        const inputImage = document.getElementById('adminBookImage');
        const inputSynopsis = document.getElementById('adminBookSynopsis');
        const btnSubmit = document.getElementById('btnAdminSubmit');

        if (!inputTitle || !inputTitle.value.trim()) {
            showToast("Judul buku harus diisi!");
            return;
        }

        const payload = { 
            title: inputTitle.value.trim(), 
            author: inputAuthor ? inputAuthor.value.trim() : '', 
            category: inputCat ? inputCat.value : 'fiksi', 
            image: inputImage ? inputImage.value.trim() : '', 
            synopsis: inputSynopsis ? inputSynopsis.value.trim() : '' 
        };

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        }

        try {
            await db.collection('books').add(payload);
            showToast("✅ Buku baru ditambahkan!");
            if (adminBookFormDOM) adminBookFormDOM.reset();
        } catch (error) {
            showToast("❌ Terjadi kesalahan sistem saat menyimpan.");
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Simpan Buku';
            }
        }
    });
}

window.deleteBook = async function(id) {
    if (confirm("Hapus buku ini secara permanen dari database?")) {
        try {
            await db.collection('books').doc(id).delete();
            showToast("🗑️ Buku berhasil dihapus.");
        } catch (error) {
            showToast("Gagal menghapus buku.");
        }
    }
}

// ==========================================
// MANAJEMEN TRANSAKSI KERANJANG & PINJAM
// ==========================================
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const totalItems = cartList.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = `(${totalItems})`;
    }
}

function saveCartToDB() {
    if (auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).set({ cart: cartList }, { merge: true })
        .catch(error => console.error("Gagal sinkron cart database:", error));
    }
}

window.borrowBook = function(id) { 
    if (!isLoggedIn) {
        showToast("Silakan Login terlebih dahulu.");
        return; 
    }

    const totalBorrowed = borrowedBooksList.length;
    const totalInCart = cartList.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    if (totalBorrowed + totalInCart >= 3) {
        showToast("Batas maksimal peminjaman adalah 3 buku sekaligus!");
        return;
    }

    const bookData = books.find(b => b.id === id);
    if (!bookData) return;

    const existingCartItem = cartList.find(b => b.id === id);

    if (existingCartItem) {
        existingCartItem.quantity = (existingCartItem.quantity || 1) + 1;
        showToast(`Jumlah buku "${bookData.title}" ditambah.`);
    } else {
        const uniqueCartId = Date.now().toString() + Math.random().toString().substring(2, 8);
        cartList.push({ 
            cartId: uniqueCartId, 
            quantity: 1, 
            ...bookData 
        });
        showToast(`"${bookData.title}" masuk ke Keranjang.`);
    }
    
    updateCartBadge();
    saveCartToDB();
}

window.renderKeranjang = function() {
    const keranjangGrid = document.getElementById('keranjangGrid');
    if (!keranjangGrid) return; 
    keranjangGrid.innerHTML = '';
    
    const btnCheckout = document.getElementById('btnCheckout');
    const checkoutWrapper = btnCheckout ? btnCheckout.parentElement : null;

    if (cartList.length === 0) {
        keranjangGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-size: 1.1rem; padding: 2rem;">Keranjang Anda kosong.</p>';
        if (checkoutWrapper) checkoutWrapper.style.display = 'none';
        return;
    }

    if (checkoutWrapper) checkoutWrapper.style.display = 'block';

    cartList.forEach(book => {
        const qty = book.quantity || 1;
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img src="${book.image}" alt="${book.title}" class="book-cover">
            <span class="book-category">${book.category}</span>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author" style="margin-bottom: 0.5rem;">${book.author}</p>
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin: 15px 0; background: #f1f5f9; border-radius: 8px; padding: 8px; border: 1px solid #e2e8f0;">
                <button onclick="changeQty('${book.cartId}', -1)" style="background: #ef4444; color: white; border: none; width: 35px; height: 35px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1.2rem;">-</button>
                <input type="number" min="1" value="${qty}" onchange="setQty('${book.cartId}', this.value)" style="width: 60px; text-align: center; border: 2px solid #cbd5e1; border-radius: 5px; padding: 5px; font-weight: bold; background: white;">
                <button onclick="changeQty('${book.cartId}', 1)" style="background: #10b981; color: white; border: none; width: 35px; height: 35px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1.2rem;">+</button>
            </div>
            <button class="btn-borrow" style="background: #64748b; color: white; margin-top: auto;" onclick="removeFromCart('${book.cartId}')"><i class="fas fa-trash"></i> Hapus</button>
        `;
        keranjangGrid.appendChild(card);
    });
}

window.changeQty = function(cartId, delta) {
    const item = cartList.find(b => b.cartId === cartId);
    if (item) {
        if (delta > 0) {
            const totalBorrowed = borrowedBooksList.length;
            const totalInCart = cartList.reduce((sum, i) => sum + (i.quantity || 1), 0);
            if (totalBorrowed + totalInCart >= 3) {
                showToast("Batas maksimal peminjaman adalah 3 buku!");
                return;
            }
        }

        let newQty = (item.quantity || 1) + delta;
        if (newQty < 1) newQty = 1; 
        item.quantity = newQty;
        updateCartBadge();
        saveCartToDB();
        renderKeranjang();
    }
}

window.setQty = function(cartId, value) {
    const item = cartList.find(b => b.cartId === cartId);
    if (item) {
        let newQty = parseInt(value);
        if (isNaN(newQty) || newQty < 1) newQty = 1; 
        
        const totalBorrowed = borrowedBooksList.length;
        const otherCartItems = cartList.reduce((sum, i) => sum + (i.cartId === cartId ? 0 : (i.quantity || 1)), 0);
        
        if (totalBorrowed + otherCartItems + newQty > 3) {
            showToast("Batas maksimal peminjaman adalah 3 buku!");
            newQty = 3 - (totalBorrowed + otherCartItems);
            if(newQty < 1) newQty = 1; // Mencegah nilai minus jika sistem error
        }
        
        item.quantity = newQty;
        updateCartBadge();
        saveCartToDB();
        renderKeranjang();
    }
}

window.removeFromCart = function(cartIdToRemove) {
    cartList = cartList.filter(b => b.cartId !== cartIdToRemove);
    updateCartBadge();
    saveCartToDB();
    renderKeranjang();
}

const btnCheckout = document.getElementById('btnCheckout');
if(btnCheckout) {
    btnCheckout.addEventListener('click', () => {
        if(cartList.length === 0) return;

        if (!auth.currentUser) {
            showToast("Sesi bermasalah, silakan re-login.");
            return;
        }

        // Proteksi Ganda sebelum mengirim data
        const totalBorrowed = borrowedBooksList.length;
        const totalCart = cartList.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (totalBorrowed + totalCart > 3) {
            showToast("Gagal! Total buku melebihi batas maksimal (3 buku).");
            return;
        }

        btnCheckout.disabled = true;

        cartList.forEach((book, index) => {
            const qty = book.quantity || 1;
            for (let i = 0; i < qty; i++) {
                const uniqueBorrowId = Date.now().toString() + index.toString() + i.toString();
                borrowedBooksList.push({ 
                    id: book.id,
                    title: book.title,
                    image: book.image,
                    category: book.category,
                    author: book.author,
                    synopsis: book.synopsis,
                    borrowTime: Date.now(), 
                    borrowId: uniqueBorrowId 
                });
            }
        });

        cartList = [];
        updateCartBadge();
        renderKeranjang();
        
        const successModal = document.getElementById('successModal');
        if(successModal) successModal.classList.add('show');
        
        setTimeout(() => {
            const checkAnim = document.getElementById('animatedCheck');
            if(checkAnim) checkAnim.checked = true;
        }, 150);
        
        btnCheckout.disabled = false;

        db.collection('users').doc(auth.currentUser.uid).set({
            borrowedBooks: borrowedBooksList, cart: cartList                    
        }, { merge: true });
    });
}

// ==========================================
// FITUR PENGEMBALIAN BUKU USER
// ==========================================
window.renderBukuSaya = function() {
    const bukuSayaGrid = document.getElementById('bukuSayaGrid');
    if (!bukuSayaGrid) return;
    bukuSayaGrid.innerHTML = '';
    
    if (borrowedBooksList.length === 0) {
        bukuSayaGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-size: 1.1rem; padding: 2rem;">Anda belum meminjam buku apa pun.</p>';
        return;
    }

    borrowedBooksList.forEach(book => {
        const tenggatWaktuMs = book.borrowTime + (7 * 24 * 60 * 60 * 1000);
        const formatTenggat = new Date(tenggatWaktuMs).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        const diffDays = Math.floor((Date.now() - book.borrowTime) / (1000 * 60 * 60 * 24));
        
        let teksDenda = `<span style="color: #10b981;">Aman (Denda Rp 2.000/hari jika telat)</span>`;
        if (diffDays > 7) {
            teksDenda = `<span style="color: #e11d48; font-weight: bold;">Terlambat! Denda: Rp ${((diffDays - 7) * 2000).toLocaleString('id-ID')}</span>`;
        }

        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img src="${book.image}" alt="${book.title}" class="book-cover">
            <h3 class="book-title" style="margin-top: 0.5rem;">${book.title}</h3>
            <div style="background: #f1f5f9; padding: 0.8rem; border-radius: 8px; margin: 0.8rem 0; font-size: 0.85rem; color: #334155;">
                <p style="margin-bottom: 0.3rem;"><i class="fas fa-calendar-alt"></i> Kembali: <b>${formatTenggat}</b></p>
                <p><i class="fas fa-coins"></i> ${teksDenda}</p>
            </div>
            <button class="btn-borrow" style="background: #10b981; color: white;" onclick="openReturnModal('${book.borrowId}')"><i class="fas fa-undo"></i> Kembalikan Buku</button>
        `;
        bukuSayaGrid.appendChild(card);
    });
}

let bookIdToReturn = null; 
const returnModal = document.getElementById('returnModal');
const closeReturnModal = document.getElementById('closeReturnModal');
const confirmReturnBtn = document.getElementById('confirmReturnBtn');

window.openReturnModal = function(borrowId) {
    const record = borrowedBooksList.find(b => b.borrowId === borrowId);
    if (!record) return;

    bookIdToReturn = borrowId;
    const diffDays = Math.floor((Date.now() - record.borrowTime) / (1000 * 60 * 60 * 24));
    let statusDenda = `<strong style="color:#10b981;">Tepat Waktu (Bebas Denda)</strong>`;

    if (diffDays > 7) {
        statusDenda = `<strong style="color:#e11d48;">Terlambat ${diffDays - 7} Hari (Denda Rp ${((diffDays - 7) * 2000).toLocaleString('id-ID')})</strong>`;
    }

    document.getElementById('returnDetails').innerHTML = `
        <p><strong>Judul Buku:</strong> ${record.title}</p>
        <p><strong>Kategori:</strong> ${record.category}</p>
        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 0.8rem 0;">
        <p><strong>Status Denda:</strong> ${statusDenda}</p>
    `;
    if(returnModal) returnModal.classList.add('show');
}

if(closeReturnModal) closeReturnModal.addEventListener('click', () => returnModal.classList.remove('show'));

if(confirmReturnBtn) {
    confirmReturnBtn.addEventListener('click', () => {
        if(!bookIdToReturn) return;
        const targetBook = borrowedBooksList.find(b => b.borrowId === bookIdToReturn);
        const titleToToast = targetBook ? targetBook.title : 'Buku';

        borrowedBooksList = borrowedBooksList.filter(b => b.borrowId !== bookIdToReturn);
        
        if (auth.currentUser) {
            db.collection('users').doc(auth.currentUser.uid).set({
                borrowedBooks: borrowedBooksList 
            }, { merge: true })
            .then(() => {
                showToast(`Buku "${titleToToast}" berhasil dikembalikan!`);
                if(returnModal) returnModal.classList.remove('show');
                renderBukuSaya(); 
                bookIdToReturn = null; 
            });
        }
    });
}

// ==========================================
// FITUR KOMUNITAS (REQUEST & LIST TEMAN)
// ==========================================
const searchUserInput = document.getElementById('searchUserInput');

if(searchUserInput) {
    searchUserInput.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('searchUserResults');
        
        if(query.length < 3) {
            resultsContainer.innerHTML = '';
            return;
        }

        resultsContainer.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Mencari pengguna...</p>';

        try {
            const snapshot = await db.collection('users').get();
            let html = '';
            let found = 0;

            snapshot.forEach(doc => {
                const userData = doc.data();
                const uid = doc.id;
                
                if(!auth.currentUser || uid === auth.currentUser.uid) return; 

                const uname = userData.username ? userData.username.toLowerCase() : '';
                if(uname.includes(query)) {
                    found++;
                    const avatar = userData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                    
                    const isFriend = myFriendsList.includes(uid);
                    const isRequested = userData.pendingRequests && userData.pendingRequests.includes(auth.currentUser.uid);
                    
                    let btnHtml = '';
                    if (isFriend) {
                        btnHtml = `<button class="btn-submit" style="background: #64748b; margin-top: 0; padding: 0.5rem; flex: 1;" disabled><i class="fas fa-check"></i> Berteman</button>`;
                    } else if (isRequested) {
                        btnHtml = `<button class="btn-submit" style="background: #f59e0b; margin-top: 0; padding: 0.5rem; flex: 1;" disabled><i class="fas fa-hourglass-half"></i> Menunggu...</button>`;
                    } else {
                        btnHtml = `<button class="btn-submit" style="background: #10b981; margin-top: 0; padding: 0.5rem; flex: 1;" onclick="sendFriendRequest('${uid}')"><i class="fas fa-user-plus"></i> Tambah</button>`;
                    }

                    html += `
                        <div class="friend-card">
                            <img src="${avatar}" class="friend-avatar" style="cursor:pointer;" onclick="openFriendProfile('${uid}')">
                            <div class="friend-name">${userData.username || 'Anonim'}</div>
                            <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 15px;">${userData.city || 'Asal kota tidak diketahui'}</div>
                            
                            <div style="display: flex; gap: 5px; width: 100%;">
                                <button class="btn-submit" style="background: #3b82f6; margin-top: 0; padding: 0.5rem; flex: 1;" onclick="openFriendProfile('${uid}')"><i class="fas fa-eye"></i> Profil</button>
                                ${btnHtml}
                            </div>
                        </div>
                    `;
                }
            });

            if(found === 0) {
                resultsContainer.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:#ef4444;">Pengguna tidak ditemukan.</p>';
            } else {
                resultsContainer.innerHTML = html;
            }
        } catch (err) {
            console.error(err);
        }
    });
}

window.sendFriendRequest = async function(targetUid) {
    if(!auth.currentUser) return;
    try {
        await db.collection('users').doc(targetUid).update({
            pendingRequests: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
        });
        showToast('✅ Permintaan berteman dikirim!');
        if(searchUserInput) searchUserInput.dispatchEvent(new Event('input')); 
    } catch(err) {
        showToast('❌ Gagal mengirim permintaan.');
    }
};

window.renderFriendRequests = async function() {
    const section = document.getElementById('friendRequestsSection');
    const grid = document.getElementById('friendRequestsGrid');
    if(!grid || !section) return;
    
    grid.innerHTML = '';

    if (myPendingRequests.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    for (let uid of myPendingRequests) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                const data = doc.data();
                const avatar = data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                
                grid.innerHTML += `
                    <div class="friend-card" style="border-color: #fca5a5; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.1);">
                        <img src="${avatar}" class="friend-avatar" style="cursor:pointer;" onclick="openFriendProfile('${uid}')">
                        <div class="friend-name">${data.username || 'Anonim'}</div>
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 10px;">Ingin menjadi temanmu</div>
                        <div style="display: flex; gap: 5px; width: 100%;">
                            <button class="btn-submit" style="background: #10b981; margin:0; padding:0.5rem; flex:1;" onclick="acceptRequest('${uid}')"><i class="fas fa-check"></i> Terima</button>
                            <button class="btn-submit" style="background: #ef4444; margin:0; padding:0.5rem; flex:1;" onclick="rejectRequest('${uid}')"><i class="fas fa-times"></i> Tolak</button>
                        </div>
                    </div>
                `;
            }
        } catch (err) {
            console.error(err);
        }
    }
};

window.acceptRequest = async function(senderUid) {
    if(!auth.currentUser) return;
    try {
        const batch = db.batch();
        const myRef = db.collection('users').doc(auth.currentUser.uid);
        const senderRef = db.collection('users').doc(senderUid);

        batch.update(myRef, {
            pendingRequests: firebase.firestore.FieldValue.arrayRemove(senderUid),
            friends: firebase.firestore.FieldValue.arrayUnion(senderUid)
        });
        batch.update(senderRef, {
            friends: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
        });

        await batch.commit();
        showToast("🤝 Kamu dan Dia sekarang berteman!");
    } catch (e) {
        showToast("❌ Gagal menerima pertemanan.");
    }
}

window.rejectRequest = async function(senderUid) {
    if(!auth.currentUser) return;
    try {
        await db.collection('users').doc(auth.currentUser.uid).update({
            pendingRequests: firebase.firestore.FieldValue.arrayRemove(senderUid)
        });
        showToast("Permintaan ditolak.");
    } catch (e) {
        showToast("❌ Gagal menolak pertemanan.");
    }
}

window.renderMyFriends = async function() {
    const grid = document.getElementById('myFriendsGrid');
    if(!grid) return;
    grid.innerHTML = '';

    if(myFriendsList.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-size: 1.1rem; padding: 2rem;">Kamu belum memiliki teman di perpustakaan ini. Cari dan tambah pengguna lain!</p>';
        return;
    }

    try {
        for(let uid of myFriendsList) {
            const doc = await db.collection('users').doc(uid).get();
            if(doc.exists) {
                const data = doc.data();
                const avatar = data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                
                let totalPinjam = 0;
                let lastPinjamText = 'Belum pernah';

                if(data.borrowedBooks && Array.isArray(data.borrowedBooks) && data.borrowedBooks.length > 0) {
                    totalPinjam = data.borrowedBooks.length;
                    const latestTime = Math.max(...data.borrowedBooks.map(b => b.borrowTime));
                    lastPinjamText = new Date(latestTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                }

                const card = document.createElement('div');
                card.className = 'friend-card';
                card.innerHTML = `
                    <img src="${avatar}" class="friend-avatar" style="cursor:pointer;" onclick="openFriendProfile('${uid}')">
                    <div class="friend-name">${data.username || 'Anonim'}</div>
                    
                    <div class="friend-stats">
                        <div style="margin-bottom: 5px;"><i class="fas fa-book" style="color: #3b82f6;"></i> Sedang Dipinjam: <b>${totalPinjam}</b> Buku</div>
                        <div><i class="fas fa-clock" style="color: #f59e0b;"></i> Terakhir Pinjam: <b>${lastPinjamText}</b></div>
                    </div>
                    
                    <div style="display: flex; gap: 5px; width: 100%; margin-bottom: 5px;">
                        <button class="btn-submit" style="background: #3b82f6; margin-top: 0; padding: 0.5rem; flex: 1;" onclick="openFriendProfile('${uid}')" title="Lihat Profil"><i class="fas fa-eye"></i></button>
                        <button class="btn-submit" style="background: #1e40af; margin-top: 0; padding: 0.5rem; flex: 2;" onclick="openChat('${uid}', '${data.username || 'Teman'}')"><i class="fas fa-comments"></i> Chat</button>
                        <button class="btn-submit" style="background: #ef4444; margin-top: 0; padding: 0.5rem; flex: 1;" onclick="removeFriend('${uid}')" title="Hapus Teman"><i class="fas fa-user-minus"></i></button>
                    </div>
                `;
                grid.appendChild(card);
            }
        }
    } catch(err) {
        console.error(err);
    }
};

window.removeFriend = async function(friendUid) {
    if(!confirm("Yakin ingin menghapus teman ini?")) return;
    if(!auth.currentUser) return;

    try {
        const batch = db.batch();
        const myRef = db.collection('users').doc(auth.currentUser.uid);
        const theirRef = db.collection('users').doc(friendUid);

        batch.update(myRef, { friends: firebase.firestore.FieldValue.arrayRemove(friendUid) });
        batch.update(theirRef, { friends: firebase.firestore.FieldValue.arrayRemove(auth.currentUser.uid) });

        await batch.commit();
        showToast('🗑️ Teman berhasil dihapus.');
        if(searchUserInput) searchUserInput.dispatchEvent(new Event('input')); 
    } catch(err) {
        showToast('❌ Gagal menghapus teman.');
    }
};

window.openFriendProfile = async function(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if(doc.exists) {
            const data = doc.data();
            
            document.getElementById('fpAvatar').src = data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
            document.getElementById('fpName').textContent = data.username || 'Anonim';
            
            const roleBadge = document.getElementById('fpRole');
            if (data.role === 'admin' || data.email === 'admin@gmail.com') {
                roleBadge.innerHTML = '👑 Admin';
                roleBadge.className = 'role-badge admin-role';
            } else if (topTypistsUIDs.includes(uid)) {
                roleBadge.innerHTML = '⌨️ Fast Typist';
                roleBadge.className = 'role-badge typist-role';
            } else {
                roleBadge.innerHTML = '👤 Anggota / User';
                roleBadge.className = 'role-badge';
            }

            document.getElementById('fpAge').textContent = data.age ? `${data.age} Tahun` : '-';
            document.getElementById('fpGender').textContent = data.gender || '-';
            document.getElementById('fpCity').textContent = data.city || '-';
            document.getElementById('fpBio').textContent = data.bio || 'Tidak ada bio yang ditulis pengguna ini.';

            document.getElementById('friendProfileModal').classList.add('show');
        }
    } catch (error) {
        console.error("Gagal memuat profil teman:", error);
        showToast("Gagal memuat profil.");
    }
};

const closeFriendProfileModal = document.getElementById('closeFriendProfileModal');
if(closeFriendProfileModal) {
    closeFriendProfileModal.onclick = () => document.getElementById('friendProfileModal').classList.remove('show');
}

// ==========================================
// FITUR CHAT REAL-TIME ANTAR TEMAN
// ==========================================
let unsubChatMessages = null;
let unsubFriendStatus = null; // Tambahan untuk memantau online teman

window.openChat = function(friendUid, friendName) {
    if(!auth.currentUser) return;   

    // Tandai semua notifikasi dari teman ini sudah dibaca
    db.collection('notifications')
        .where('recipientId', '==', auth.currentUser.uid)
        .where('senderId', '==', friendUid)
        .where('read', '==', false)
        .get()
        .then(snap => {
            if (!snap.empty) {
                const batch = db.batch();
                snap.forEach(doc => batch.update(doc.ref, { read: true }));
                batch.commit();
            }
        });
        
    currentChatId = [auth.currentUser.uid, friendUid].sort().join('_');
    
    // PANTAU STATUS ONLINE TEMAN SECARA REAL-TIME
    if(unsubFriendStatus) unsubFriendStatus();
    unsubFriendStatus = db.collection('users').doc(friendUid).onSnapshot(doc => {
        let statusHtml = '';
        if(doc.exists) {
            const data = doc.data();
            if (data.isOnline) {
                statusHtml = '<span style="display:inline-block; width:8px; height:8px; background:#10b981; border-radius:50%; margin-right:5px;"></span> Online';
            } else if (data.lastOnline) {
                const lastSeen = data.lastOnline.toDate().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
                statusHtml = `Terakhir dilihat: ${lastSeen}`;
            }
        }
        
        document.getElementById('chatFriendName').innerHTML = `
            <div style="line-height: 1.2;">
                <div><i class="fas fa-comments"></i> ${friendName}</div>
                <div style="font-size: 0.75rem; color: #cbd5e1; font-weight: normal; margin-top: 4px;">${statusHtml}</div>
            </div>
        `;
    });

    document.getElementById('chatModal').classList.add('show');

    if(unsubChatMessages) unsubChatMessages();

    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML = '<p style="text-align:center; color:#64748b; font-size:0.9rem;">Memuat pesan...</p>';

    unsubChatMessages = db.collection('chats').doc(currentChatId).collection('messages')
        .orderBy('timestamp')
        .onSnapshot(snapshot => {
            messagesDiv.innerHTML = '';
            if(snapshot.empty) {
                messagesDiv.innerHTML = '<p style="text-align:center; color:#64748b; font-size:0.9rem; margin-top:2rem;">Belum ada pesan. Sapa temanmu sekarang!</p>';
                return;
            }

            snapshot.forEach(doc => {
                const msg = doc.data();
                const msgId = doc.id;
                const isMe = msg.senderId === auth.currentUser.uid;

                // FITUR CENTANG BIRU: Jika bukan pesan saya dan belum dibaca, ubah jadi sudah dibaca
                if (!isMe && !msg.isRead) {
                    doc.ref.update({ isRead: true });
                }
                
                let time = '';
                if(msg.timestamp) {
                    time = new Date(msg.timestamp.toDate()).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
                }
                
                // Menentukan ikon centang di pesan pengirim
                let checkIcon = '';
                if (isMe) {
                    if (msg.isRead) {
                        checkIcon = '<i class="fas fa-check-double" style="color: #3b82f6; font-size: 0.75rem; margin-left: 5px;" title="Dibaca"></i>'; // Biru ganda
                    } else {
                        checkIcon = '<i class="fas fa-check" style="color: #94a3b8; font-size: 0.75rem; margin-left: 5px;" title="Terkirim"></i>'; // Abu tunggal
                    }
                }

                const div = document.createElement('div');
                div.className = `chat-bubble ${isMe ? 'chat-sent' : 'chat-received'}`;
                
                div.innerHTML = `
                    ${msg.text} 
                    <div class="chat-time" style="display:flex; justify-content:flex-end; align-items:center; gap:3px;">
                        ${time} ${checkIcon}
                    </div>
                `;
                messagesDiv.appendChild(div);
            });
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
}

window.closeChatModal = function() {
    document.getElementById('chatModal').classList.remove('show');
    if(unsubChatMessages) unsubChatMessages();
    if(unsubFriendStatus) unsubFriendStatus(); 
    currentChatId = null;
}

document.getElementById('closeChatModal').addEventListener('click', closeChatModal);
document.getElementById('sendChatBtn').addEventListener('click', sendMessage);
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();

    if(!text || !currentChatId || !auth.currentUser) return;

    input.value = ''; 

    try {
        // Kirim pesan ke riwayat obrolan (ditambah 'isRead: false')
        await db.collection('chats').doc(currentChatId).collection('messages').add({
            text: text,
            senderId: auth.currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isRead: false 
        });

        // Kirim peringatan ke sistem Notifikasi lawan bicara
        const friendId = currentChatId.split('_').find(id => id !== auth.currentUser.uid);
        await db.collection('notifications').add({
            recipientId: friendId,
            senderId: auth.currentUser.uid,
            senderName: userNameInfo,
            text: text,
            read: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

    } catch(err) {
        showToast("Gagal mengirim pesan.");
        console.error(err);
    }
}

// ==========================================
// GAME: TES KECEPATAN KETIK (TYPING SPEED TEST)
// ==========================================
const quotes = [
    "Buku adalah jendela dunia, tempat di mana kita bisa menjelajahi tempat baru tanpa harus melangkah ke luar rumah.",
    "Membaca bukan hanya sekedar mengeja kata, melainkan memahami makna mendalam di balik setiap kalimat yang tersaji.",
    "Orang yang tidak pernah membaca buku sama sekali tidak memiliki keuntungan dibandingkan orang yang tidak bisa membaca.",
    "Setiap halaman yang kita baca membawa kita selangkah lebih dekat kepada pemahaman sejati tentang arti kehidupan.",
    "Perpustakaan adalah harta karun pengetahuan berharga yang menunggu untuk ditemukan oleh pikiran yang selalu ingin tahu."
];

let timer = 60;
let timeElapsed = 0;
let isPlaying = false;
let currentQuote = "";
let gameInterval = null;

const typingInput = document.getElementById('typingInput');
const btnStartGame = document.getElementById('btnStartGame');

if(btnStartGame) {
    btnStartGame.addEventListener('click', startGame);
}

function startGame() {
    if(!auth.currentUser) {
        showToast("Harap login terlebih dahulu untuk bermain!");
        return;
    }
    
    isPlaying = true;
    timer = 60;
    timeElapsed = 0;
    document.getElementById('timeDisplay').innerText = timer;
    document.getElementById('wpmDisplay').innerText = "0";
    document.getElementById('accuracyDisplay').innerText = "100";
    
    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('textToType').innerHTML = currentQuote.split('').map(char => `<span>${char}</span>`).join('');
    
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
    
    btnStartGame.disabled = true;
    btnStartGame.style.background = "#94a3b8";
    btnStartGame.innerText = "Game Berjalan...";
    
    if(gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if(timer > 0) {
        timer--;
        timeElapsed++;
        document.getElementById('timeDisplay').innerText = timer;
        calculateWPM();
    } else {
        endGame();
    }
}

if(typingInput) {
    typingInput.addEventListener('input', () => {
        if(!isPlaying) return;
        
        const inputVal = typingInput.value;
        const quoteChars = document.querySelectorAll('#textToType span');
        
        quoteChars.forEach((span, index) => {
            span.classList.remove('current');
            const typedChar = inputVal[index];
            
            if (typedChar == null) {
                span.className = '';
            } else if (typedChar === span.innerText) {
                span.className = 'correct';
            } else {
                span.className = 'incorrect';
            }
        });

        if (inputVal.length < quoteChars.length) {
            quoteChars[inputVal.length].classList.add('current');
        }

        if(inputVal.length === currentQuote.length) {
            endGame();
        }
    });
}

function calculateWPM() {
    const inputVal = typingInput.value;
    const minutes = timeElapsed / 60;
    const words = inputVal.length / 5;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    
    document.getElementById('wpmDisplay').innerText = wpm;
    
    const correctChars = document.querySelectorAll('#textToType span.correct').length;
    const accuracy = inputVal.length > 0 ? Math.round((correctChars / inputVal.length) * 100) : 100;
    document.getElementById('accuracyDisplay').innerText = accuracy;
}

async function endGame() {
clearInterval(gameInterval);
isPlaying = false;
typingInput.disabled = true;

btnStartGame.disabled = false;
btnStartGame.style.background = "#10b981";
btnStartGame.innerText = "Main Lagi";

calculateWPM(); 
const finalWPM = parseInt(document.getElementById('wpmDisplay').innerText);
const finalAcc = parseInt(document.getElementById('accuracyDisplay').innerText);

if (finalWPM > 0) {
    try {
        const scoreRef = db.collection('typing_scores').doc(auth.currentUser.uid);
        const doc = await scoreRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            if (finalWPM > data.wpm) {
                await scoreRef.update({
                    wpm: finalWPM,
                    accuracy: finalAcc,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    username: userNameInfo,
                    avatarUrl: userAvatarInfo
                });
                showToast(`Skor Rekor Baru! Kecepatanmu: ${finalWPM} WPM 🚀`);
            } else {
                showToast(`Game Selesai (${finalWPM} WPM). Belum mengalahkan rekor terbaikmu (${data.wpm} WPM)`);
            }
        } else {
            await scoreRef.set({
                uid: auth.currentUser.uid,
                username: userNameInfo,
                avatarUrl: userAvatarInfo,
                wpm: finalWPM,
                accuracy: finalAcc,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast(`Game Selesai! Kecepatanmu: ${finalWPM} WPM`);
        }
    } catch (e) {
        console.error("Gagal menyimpan skor", e);
    }
} else {
    showToast("Waktu habis! Coba lagi.");
}
}

// ==========================================
// PELACAK LEADERBOARD (DENGAN FILTER JS)
// ==========================================
let unsubsLeaderboard = null;
function loadLeaderboard() {
    if(unsubsLeaderboard) unsubsLeaderboard();
    
    unsubsLeaderboard = db.collection('typing_scores')
        .orderBy('wpm', 'desc')
        .limit(50) 
        .onSnapshot(snapshot => {
            const grid = document.getElementById('leaderboardGrid');
            if(!grid) return;
            grid.innerHTML = '';
            
            const seenUsers = new Set(); 
            let rank = 1;
            const maxLeaderboard = 10; 

            snapshot.forEach(doc => {
                const data = doc.data();
                const userId = data.uid || data.username; 
                
                if (!seenUsers.has(userId) && rank <= maxLeaderboard) {
                    seenUsers.add(userId);

                    const avatar = data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                    
                    let rankClass = '';
                    let rankIcon = `#${rank}`;
                    if(rank === 1) { rankClass = 'rank-1'; rankIcon = '🥇'; }
                    else if(rank === 2) { rankClass = 'rank-2'; rankIcon = '🥈'; }
                    else if(rank === 3) { rankClass = 'rank-3'; rankIcon = '🥉'; }
                    
                    grid.innerHTML += `
                        <div class="leaderboard-item">
                            <div class="lb-rank ${rankClass}">${rankIcon}</div>
                            <img src="${avatar}" class="lb-avatar" style="cursor:pointer;" onclick="openFriendProfile('${data.uid}')">
                            <div class="lb-info">
                                <div class="lb-name" style="cursor:pointer;" onclick="openFriendProfile('${data.uid}')">${data.username || 'Anonim'}</div>
                                <div class="lb-date">Akurasi: ${data.accuracy}%</div>
                            </div>
                            <div class="lb-score">${data.wpm} <span style="font-size:0.8rem;color:#64748b;font-weight:normal;">WPM</span></div>
                        </div>
                    `;
                    rank++;
                }
            });
            
            if(snapshot.empty || rank === 1){
                grid.innerHTML = '<p style="padding: 2rem; text-align:center; color:#64748b;">Belum ada skor. Jadilah yang pertama bermain!</p>';
            }
        });
}

// ==========================================
// INSTANSIASI KONFIGURASI DIAGRAM GRAFIK
// ==========================================
let charts = { fiksi: null, sejarah: null, sains: null }; 

function createChartConfig(label, color, bgColor) {
    return {
        type: 'bar',
        data: {
            labels: [label],
            datasets: [{
                label: 'Jumlah Peminjaman',
                data: [0],
                backgroundColor: bgColor,
                borderColor: color,
                borderWidth: 2,
                borderRadius: 6,
                barThickness: 45 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                y: { beginAtZero: true, ticks: { color: '#64748b', stepSize: 1 }, grid: { borderDash: [5,5] }, border: { display: false } }, 
                x: { display: false } 
            },
            plugins: { legend: { display: false } }
        }
    };
}

function initChart() {
    const ctxFiksi = document.getElementById('fiksiChart');
    const ctxSejarah = document.getElementById('sejarahChart'); 
    const ctxSains = document.getElementById('sainsChart');

    if(ctxFiksi) charts.fiksi = new Chart(ctxFiksi.getContext('2d'), createChartConfig('Fiksi', '#3b82f6', 'rgba(59, 130, 246, 0.25)'));
    if(ctxSejarah) charts.sejarah = new Chart(ctxSejarah.getContext('2d'), createChartConfig('Sejarah', '#10b981', 'rgba(16, 185, 129, 0.25)'));
    if(ctxSains) charts.sains = new Chart(ctxSains.getContext('2d'), createChartConfig('Sains', '#f59e0b', 'rgba(245, 158, 11, 0.25)'));
}

function hideLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 600);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    setTimeout(hideLoading, 1200);
});

// ==========================================
// OPERASI SYSTEM RATING & KOMENTAR (REAL-TIME)
// ==========================================
let selectedRating = 0;
let currentBookId = null;

window.openBookDetail = function(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    currentBookId = id; 
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = `
        <div style="display: flex; gap: 20px; align-items: center;">
            <img src="${book.image}" style="width: 100px; height: 140px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div>
                <h2 style="margin: 0; color: #0f172a; font-size: 1.5rem;">${book.title}</h2>
                <p style="color: #64748b; margin: 5px 0; font-size: 1rem;">${book.author}</p>
                <div id="averageRatingDisplay" class="avg-rating">⭐ Memuat rating...</div>
            </div>
        </div>
        <p style="margin-top: 15px; line-height: 1.6; font-size: 0.95rem; color: #334155;">${book.synopsis}</p>
    `;

    const commentInput = document.getElementById('commentInput');
    if (commentInput) commentInput.value = '';
    selectedRating = 0;
    updateStarUI(0);

    loadReviewsRealtime(currentBookId);
    const detailModal = document.getElementById('bookDetailModal');
    if (detailModal) detailModal.classList.add('show');
}; 

const starElements = document.querySelectorAll('#starInput i');
if (starElements) {
    starElements.forEach(star => {
        star.addEventListener('click', (e) => {
            selectedRating = parseInt(e.target.dataset.value);
            updateStarUI(selectedRating);
        });
    });
}

function updateStarUI(rating) {
    document.querySelectorAll('#starInput i').forEach((star, index) => {
        if (index < rating) {
            star.classList.replace('far', 'fas');
        } else {
            star.classList.replace('fas', 'far');
        }
    });
}

const submitCommentBtn = document.getElementById('submitCommentBtn');
if (submitCommentBtn) {
    submitCommentBtn.addEventListener('click', async () => {
        if (!isLoggedIn) return showToast("Kamu harus login dulu untuk memberi ulasan!");
        
        const comment = document.getElementById('commentInput').value.trim();
        if (selectedRating === 0) return showToast("Pilih rating bintang dulu ya!");
        if (!comment) return showToast("Komentar tidak boleh kosong.");

        const reviewData = {
            bookId: currentBookId,
            username: userNameInfo,
            userAvatar: userAvatarInfo, 
            rating: selectedRating,
            comment: comment,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('reviews').add(reviewData);
            showToast("Ulasan berhasil dikirim!");
            document.getElementById('commentInput').value = '';
            selectedRating = 0;
            updateStarUI(0);
        } catch (error) {
            showToast("Gagal mengirim ulasan.");
        }
    });
}

let unsubsReviews = null;
function loadReviewsRealtime(bookId) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    commentsList.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">Memasar ulasan...</p>';

    if(unsubsReviews) unsubsReviews();

    unsubsReviews = db.collection('reviews')
    .where('bookId', '==', bookId)
    .onSnapshot((querySnapshot) => {
        commentsList.innerHTML = '';
        let totalRating = 0;
        let count = 0;

        const avgRatingDisplay = document.getElementById('averageRatingDisplay');

        if (querySnapshot.empty) {
            commentsList.innerHTML = '<p style="color: #94a3b8; font-size: 0.9rem;">Belum ada ulasan untuk buku ini.</p>';
            if (avgRatingDisplay) avgRatingDisplay.innerHTML = '⭐ No Rating';
            return;
        }

        const docs = [];
        querySnapshot.forEach(doc => docs.push(doc.data()));
        docs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        docs.forEach((data) => {
            totalRating += data.rating;
            count++;
            const stars = '⭐'.repeat(data.rating);
            
            const avatarSrc = data.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
            
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `
                <img src="${avatarSrc}" alt="Avatar User" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-user">${data.username}</div>
                    <div class="comment-stars">${stars}</div>
                    <div class="comment-text">${data.comment}</div>
                </div>
            `;
            commentsList.appendChild(div);
        });

        const avg = (totalRating / count).toFixed(1);
        if (avgRatingDisplay) avgRatingDisplay.innerHTML = `⭐ ${avg} (${count} Ulasan)`;
    }, (err) => {
        commentsList.innerHTML = '<p style="color: #ef4444;">Gagal memuat ulasan.</p>';
    });
}

const closeDetailModal = document.getElementById('closeDetailModal');
if(closeDetailModal) {
    closeDetailModal.onclick = () => {
        document.getElementById('bookDetailModal').classList.remove('show');
        if(unsubsReviews) { unsubsReviews(); unsubsReviews = null; }
    };
}

// ==========================================
// OPERASI DATA PROFIL & UPLOAD GAMBAR
// ==========================================
let uploadedAvatarBase64 = "";

const profileAvatarUpload = document.getElementById('profileAvatarUpload');
if (profileAvatarUpload) {
    profileAvatarUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 250; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                uploadedAvatarBase64 = canvas.toDataURL('image/jpeg', 0.8);
                
                document.getElementById('profileAvatar').src = uploadedAvatarBase64;
                document.getElementById('profileAvatarUrl').value = ""; 
            }
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function loadProfileData() {
    if (!auth.currentUser) return;
    uploadedAvatarBase64 = ""; 

    db.collection('users').doc(auth.currentUser.uid).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            
            document.getElementById('profileName').value = data.username || '';
            document.getElementById('profileAge').value = data.age || '';
            document.getElementById('profileCity').value = data.city || '';
            document.getElementById('profileGender').value = data.gender || '';
            
            if(data.avatarUrl && !data.avatarUrl.startsWith('data:image')) {
                document.getElementById('profileAvatarUrl').value = data.avatarUrl;
            } else {
                document.getElementById('profileAvatarUrl').value = "";
            }
            
            document.getElementById('profileAvatarUpload').value = ""; 
            document.getElementById('profileBio').value = data.bio || '';

            document.getElementById('profileNameDisplay').textContent = data.username || 'Nama Pengguna';
            if (data.avatarUrl && data.avatarUrl.trim() !== '') {
                document.getElementById('profileAvatar').src = data.avatarUrl;
            } else {
                document.getElementById('profileAvatar').src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
            }
            
            const roleBadge = document.getElementById('profileRoleBadge');
            if (roleBadge) {
                if (data.role === 'admin' || auth.currentUser.email === 'admin@gmail.com') {
                    roleBadge.innerHTML = '👑 Admin';
                    roleBadge.className = 'role-badge admin-role';
                } else if (topTypistsUIDs.includes(auth.currentUser.uid)) {
                    roleBadge.innerHTML = '⌨️ Fast Typist';
                    roleBadge.className = 'role-badge typist-role';
                } else {
                    roleBadge.innerHTML = '👤 Anggota / User';
                    roleBadge.className = 'role-badge';
                }
            }
        }
    }).catch(err => console.error("Gagal mengambil data profil:", err));
}

const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        const btnSave = document.getElementById('btnSaveProfile');
        btnSave.disabled = true;
        btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

        const urlInput = document.getElementById('profileAvatarUrl').value.trim();
        const finalAvatarUrl = uploadedAvatarBase64 !== "" ? uploadedAvatarBase64 : urlInput;

        const updatedData = {
            username: document.getElementById('profileName').value.trim(),
            age: parseInt(document.getElementById('profileAge').value) || '',
            city: document.getElementById('profileCity').value.trim(),
            gender: document.getElementById('profileGender').value,
            avatarUrl: finalAvatarUrl,
            bio: document.getElementById('profileBio').value.trim()
        };

        try {
            await db.collection('users').doc(auth.currentUser.uid).set(updatedData, { merge: true });
            showToast("✅ Profil berhasil diperbarui!");
            
            document.getElementById('profileNameDisplay').textContent = updatedData.username;
            if(finalAvatarUrl !== '') {
                document.getElementById('profileAvatar').src = finalAvatarUrl;
            }
            
            userNameInfo = updatedData.username; 
            userAvatarInfo = finalAvatarUrl !== "" ? finalAvatarUrl : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
            
            uploadedAvatarBase64 = ""; 

        } catch (error) {
            showToast("❌ Gagal menyimpan profil.");
            console.error(error);
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';
        }
    });
}