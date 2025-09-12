class DatingApp {
    constructor() {
        this.profiles = [];
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.cardStack = document.querySelector('.card-stack');
        this.emptyState = document.getElementById('empty-state');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProfiles();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Action buttons
        document.getElementById('reject-btn').addEventListener('click', () => {
            this.swipeCard('left');
        });

        document.getElementById('like-btn').addEventListener('click', () => {
            this.swipeCard('right');
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.swipeCard('left');
            if (e.key === 'ArrowRight') this.swipeCard('right');
        });
    }

    loadProfiles() {
        // Try to load profiles from localStorage first (added by admin)
        const storedProfiles = localStorage.getItem('femboyDatesProfiles');
        if (storedProfiles) {
            try {
                this.profiles = JSON.parse(storedProfiles);
            } catch (e) {
                console.log('Error loading stored profiles, using defaults');
                this.loadSampleProfiles();
            }
        } else {
            // Load sample profiles if no stored profiles exist
            this.loadSampleProfiles();
        }
    }

    loadSampleProfiles() {
        const sampleProfiles = [
            {
                name: "Alex",
                age: 22,
                description: "Love gaming, anime, and long walks on the beach. Looking for someone to share cozy nights in with! 🎮✨",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face"
            },
            {
                name: "Jamie",
                age: 24,
                description: "Art student with a passion for creativity. Soft aesthetic lover and plant parent. Let's create something beautiful together! 🌸🎨",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face"
            },
            {
                name: "Taylor",
                age: 20,
                description: "Bookworm and coffee enthusiast. Love cozy sweaters and deep conversations. Looking for my reading buddy! 📚☕",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face"
            }
        ];

        this.profiles = [...sampleProfiles];
    }

    createCard(profile, index) {
        const template = document.getElementById('card-template');
        const card = template.cloneNode(true);
        card.id = `card-${index}`;
        card.style.display = 'block';
        
        card.querySelector('.name').textContent = profile.name;
        card.querySelector('.age').textContent = `Age ${profile.age}`;
        card.querySelector('.description').textContent = profile.description;
        card.querySelector('img').src = profile.image;
        card.querySelector('img').alt = `${profile.name}'s photo`;

        // Add touch and mouse event listeners for dragging
        this.addCardEventListeners(card);

        return card;
    }

    addCardEventListeners(card) {
        // Mouse events
        card.addEventListener('mousedown', (e) => this.startDrag(e));
        card.addEventListener('mousemove', (e) => this.drag(e));
        card.addEventListener('mouseup', () => this.endDrag());
        card.addEventListener('mouseleave', () => this.endDrag());

        // Touch events
        card.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        card.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.drag(e.touches[0]);
        });
        card.addEventListener('touchend', () => this.endDrag());
    }

    startDrag(e) {
        this.isDragging = true;
        this.startX = e.clientX;
        this.currentCard = e.currentTarget;
    }

    drag(e) {
        if (!this.isDragging || !this.currentCard) return;

        this.currentX = e.clientX;
        const diffX = this.currentX - this.startX;
        const rotation = diffX * 0.1;
        
        this.currentCard.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
        
        // Show overlay based on swipe direction
        const leftOverlay = this.currentCard.querySelector('.swipe-overlay.left');
        const rightOverlay = this.currentCard.querySelector('.swipe-overlay.right');
        
        if (diffX < -50) {
            leftOverlay.style.opacity = Math.min(Math.abs(diffX) / 150, 1);
            rightOverlay.style.opacity = 0;
        } else if (diffX > 50) {
            rightOverlay.style.opacity = Math.min(diffX / 150, 1);
            leftOverlay.style.opacity = 0;
        } else {
            leftOverlay.style.opacity = 0;
            rightOverlay.style.opacity = 0;
        }
    }

    endDrag() {
        if (!this.isDragging || !this.currentCard) return;
        
        const diffX = this.currentX - this.startX;
        const threshold = 100;
        
        if (Math.abs(diffX) > threshold) {
            this.swipeCard(diffX > 0 ? 'right' : 'left');
        } else {
            // Snap back to center
            this.currentCard.style.transform = '';
            this.currentCard.querySelector('.swipe-overlay.left').style.opacity = 0;
            this.currentCard.querySelector('.swipe-overlay.right').style.opacity = 0;
        }
        
        this.isDragging = false;
        this.currentCard = null;
    }

    swipeCard(direction) {
        if (this.currentIndex >= this.profiles.length) return;

        const currentCard = document.getElementById(`card-${this.currentIndex}`);
        if (!currentCard) return;

        currentCard.classList.add(`swiped-${direction}`);
        
        setTimeout(() => {
            if (currentCard.parentNode) {
                currentCard.parentNode.removeChild(currentCard);
            }
            this.currentIndex++;
            this.updateDisplay();
        }, 300);
    }

    updateDisplay() {
        // Clear existing cards
        const existingCards = this.cardStack.querySelectorAll('.card:not(#card-template)');
        existingCards.forEach(card => card.remove());

        if (this.currentIndex >= this.profiles.length) {
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';

        // Create cards for current and next profiles (for stacking effect)
        for (let i = Math.min(this.currentIndex + 2, this.profiles.length - 1); i >= this.currentIndex; i--) {
            if (this.profiles[i]) {
                const card = this.createCard(this.profiles[i], i);
                const zIndex = 100 - (i - this.currentIndex);
                const scale = 1 - (i - this.currentIndex) * 0.05;
                
                card.style.zIndex = zIndex;
                card.style.transform = `scale(${scale})`;
                
                this.cardStack.appendChild(card);
            }
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DatingApp();
});