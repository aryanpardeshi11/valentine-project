document.addEventListener('DOMContentLoaded', () => {
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const questionConf = document.getElementById('questionConf');
  const successConf = document.getElementById('successConf');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const mainEmoji = document.getElementById('mainEmoji');
  const container = document.querySelector('.container');
  const mainText = document.querySelector('.main-text');
  let hoverCount = 0;

  // No Button Interaction: Run away inside the container
  const moveNoButton = () => {
    const containerRect = container.getBoundingClientRect();
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    // Calculate limit bounds
    const maxLeft = containerWidth - btnWidth;
    const maxTop = containerHeight - btnHeight;

    // Helper to check collision with other elements
    const isColliding = (x, y) => {
      // Proposed rect (relative to container)
      const rect = {
        left: x,
        top: y,
        right: x + btnWidth,
        bottom: y + btnHeight,
      };

      // Elements to avoid - Only 'Yes' button as requested
      const elementsToAvoid = [yesBtn];
      const padding = 20; // Extra buffer

      for (let el of elementsToAvoid) {
        if (!el) continue;
        const elRect = el.getBoundingClientRect();

        // Convert elRect to be relative to container
        const elLeft = elRect.left - containerRect.left;
        const elTop = elRect.top - containerRect.top;

        const elTarget = {
          left: elLeft - padding,
          top: elTop - padding,
          right: elLeft + elRect.width + padding,
          bottom: elTop + elRect.height + padding,
        };

        // Check intersection
        if (
          rect.left < elTarget.right &&
          rect.right > elTarget.left &&
          rect.top < elTarget.bottom &&
          rect.bottom > elTarget.top
        ) {
          return true;
        }
      }
      return false;
    };

    let randomLeft, randomTop;
    let attempts = 0;

    // Try to find a safe spot
    do {
      randomLeft = Math.random() * maxLeft;
      randomTop = Math.random() * maxTop;
      attempts++;
    } while (isColliding(randomLeft, randomTop) && attempts < 50);

    // Apply new position
    noBtn.style.position = 'absolute';
    noBtn.style.left = `${randomLeft}px`;
    noBtn.style.top = `${randomTop}px`;

    // Shrink (0.85x) and rotate for the "small" effect
    const randomRotate = Math.random() * 20 - 10;
    noBtn.style.transform = `scale(0.85) rotate(${randomRotate}deg)`;

    // Emotional Logic: Cry after every 10 attempts
    hoverCount++;
    if (hoverCount % 10 === 0) {
      mainEmoji.textContent = '😭'; // Crying

      // Highlight Yes Button
      yesBtn.style.transform = 'scale(1.2)';
      yesBtn.style.boxShadow = '0 0 20px rgba(255, 71, 87, 0.8)'; // Glow
      yesBtn.style.transition = 'all 0.3s ease';

      // Reset after 2 seconds
      setTimeout(() => {
        if (mainEmoji.textContent === '😭') {
          mainEmoji.textContent = '🥺';
        }
        yesBtn.style.transform = '';
        yesBtn.style.boxShadow = '';
      }, 2000);
    }
  };

  // Add multiple event listeners to make it really hard to click
  noBtn.addEventListener('mouseover', moveNoButton);
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton();
  });
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent tap
    moveNoButton();
  });

  // Reset 'No' button when mouse leaves the container
  container.addEventListener('mouseleave', () => {
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
    noBtn.style.transform = '';
  });

  // Yes Button Interaction
  yesBtn.addEventListener('mouseenter', () => (mainEmoji.textContent = '😊'));
  yesBtn.addEventListener('mouseleave', () => (mainEmoji.textContent = '🥺'));

  yesBtn.addEventListener('click', () => {
    // 1. Hide Question content
    questionConf.classList.add('hidden');

    // 2. Show Success content
    successConf.classList.remove('hidden');

    // 3. Trigger festivities
    startConfetti();
  });

  // Simple Canvas Confetti Logic
  let confettiCtx = confettiCanvas.getContext('2d');
  let particles = [];
  let animationId = null;

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.x = Math.random() * confettiCanvas.width;
      this.y = -10; // Start above screen
      this.size = Math.random() * 10 + 5;
      this.speedY = Math.random() * 3 + 2;
      this.speedX = Math.random() * 2 - 1;
      this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 5 - 2.5;

      // Heart shape check
      this.isHeart = Math.random() > 0.5;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
      if (this.y > confettiCanvas.height) {
        this.y = -10;
        this.x = Math.random() * confettiCanvas.width;
      }
    }

    draw() {
      confettiCtx.save();
      confettiCtx.translate(this.x, this.y);
      confettiCtx.rotate((this.rotation * Math.PI) / 180);

      if (this.isHeart) {
        // Draw Heart
        confettiCtx.fillStyle = this.color;
        confettiCtx.beginPath();
        const s = this.size;
        confettiCtx.moveTo(0, 0);
        confettiCtx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
        confettiCtx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, 0);
        confettiCtx.fill();
      } else {
        // Draw Square/Confetti
        confettiCtx.fillStyle = this.color;
        confettiCtx.fillRect(
          -this.size / 2,
          -this.size / 2,
          this.size,
          this.size
        );
      }

      confettiCtx.restore();
    }
  }

  function initConfetti() {
    particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle());
    }
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    animationId = requestAnimationFrame(animateConfetti);
  }

  function startConfetti() {
    initConfetti();
    animateConfetti();
    // Stop after 10 seconds to save resources? Or keep going.
    // Let's keep going for the "wow" factor, or maybe slow down.
  }
});
