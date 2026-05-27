document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.getElementById('sliderContainer');
    const sliderHandle = document.getElementById('sliderHandle');
    const sliderProgress = document.getElementById('sliderProgress');
    const loadingOverlay = document.getElementById('loadingOverlay');

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    const maxSlide = sliderContainer.offsetWidth - sliderHandle.offsetWidth - 10;

    const startDrag = (e) => {
        isDragging = true;
        startX = (e.type === 'mousedown') ? e.clientX : e.touches[0].clientX;
        sliderHandle.style.transition = 'none';
        sliderProgress.style.transition = 'none';
    };

    const moveDrag = (e) => {
        if (!isDragging) return;

        const x = (e.type === 'mousemove') ? e.clientX : e.touches[0].clientX;
        currentX = Math.max(0, Math.min(x - startX, maxSlide));

        sliderHandle.style.left = `${currentX + 5}px`;
        sliderProgress.style.width = `${currentX + 25}px`;

        // Change color as it progresses
        const progress = currentX / maxSlide;
        if (progress > 0.9) {
            sliderProgress.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
        } else {
            sliderProgress.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;

        const progress = currentX / maxSlide;

        if (progress >= 0.95) {
            // Success
            sliderHandle.style.left = `${maxSlide + 5}px`;
            sliderProgress.style.width = '100%';
            sliderProgress.style.backgroundColor = '#22c55e';
            sliderHandle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            sliderHandle.style.backgroundColor = '#22c55e';

            setTimeout(() => {
                loadingOverlay.style.display = 'flex';
                setTimeout(() => {
                    window.location.href = 'home' + window.location.search;
                }, 1500);
            }, 300);
        } else {
            // Reset
            sliderHandle.style.transition = 'left 0.3s ease-out';
            sliderProgress.style.transition = 'width 0.3s ease-out';
            sliderHandle.style.left = '5px';
            sliderProgress.style.width = '0';
            currentX = 0;
        }
    };

    // Desktop
    sliderHandle.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    // Mobile
    sliderHandle.addEventListener('touchstart', startDrag);
    window.addEventListener('touchmove', moveDrag);
    window.addEventListener('touchend', endDrag);
});
