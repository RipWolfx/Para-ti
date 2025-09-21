onload = () =>{
    document.body.classList.remove("container");
};

// Interactive parallax for the starry night background
(() => {
    const nightEl = document.querySelector('.night');
    if (!nightEl) return;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const handleMove = (event) => {
        const { innerWidth, innerHeight } = window;
        const xRatio = (event.clientX / innerWidth) * 2 - 1; // -1 .. 1
        const yRatio = (event.clientY / innerHeight) * 2 - 1; // -1 .. 1

        const parallaxX = clamp(xRatio * 30, -30, 30); // px
        const parallaxY = clamp(yRatio * 20, -20, 20); // px

        nightEl.style.setProperty('--parallax-x', parallaxX + 'px');
        nightEl.style.setProperty('--parallax-y', parallaxY + 'px');

        // Speed up twinkle as cursor nears the moon (top-right corner)
        const distX = 1 - (event.clientX / innerWidth);
        const distY = event.clientY / innerHeight;
        const proximity = clamp(1 - Math.hypot(distX, distY), 0, 1); // 0..1
        const speed = 6 - proximity * 2; // 6s -> 4s
        nightEl.style.setProperty('--twinkle-speed', speed.toFixed(2) + 's');
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
})();

// Preloader hide after assets settle
(function setupPreloader(){
    const pre = document.getElementById('preloader');
    if (!pre) return;
    const hide = () => pre.style.display = 'none';
    // Fallback hide after 2s
    setTimeout(hide, 2000);
    window.addEventListener('load', () => setTimeout(hide, 500));
})();

// Bees: orbit around the flowers (pure CSS handles motion)
(() => {
    const beesRoot = document.getElementById('bees');
    if (!beesRoot) return;
    const bees = Array.from(beesRoot.querySelectorAll('.bee'));

    // Collect petal targets (use .flower__white-circle as the center of each flor)
    function getFlowerTargets(){
        const circles = Array.from(document.querySelectorAll('.flower__white-circle'));
        if (circles.length) {
            return circles.map(c => {
                const r = c.getBoundingClientRect();
                return { x: r.left + r.width/2, y: r.top + r.height/2 - 14 };
            });
        }
        // fallback to flower bounding boxes
        const centers = Array.from(document.querySelectorAll('.flower'))
          .map(f => f.getBoundingClientRect())
          .sort((a,b) => a.left - b.left);
        return centers.map(r => ({ x: r.left + r.width/2, y: r.top + r.height*0.15 }));
    }

    function positionBees(){
        const targets = getFlowerTargets();
        bees.forEach((bee, i) => {
            const t = targets[i % targets.length] || { x: window.innerWidth/2, y: window.innerHeight/2 };
            bee.style.left = `${t.x}px`;
            bee.style.top = `${t.y}px`;
            bee.classList.remove('flying');
            bee.classList.add('landed');
        });
    }

    // initial landing after small delay
    setTimeout(positionBees, 800);
    // reposition on resize to keep landed on heads
    window.addEventListener('resize', () => setTimeout(positionBees, 200));

    // continuous small walk over petals
    function patrol(){
        const targets = getFlowerTargets();
        bees.forEach((bee, i) => {
            const t = targets[i % targets.length];
            if (!t) return;
            const angle = (performance.now()/800 + i*0.9) % (Math.PI*2);
            const radius = 14 + (i%2)*4; // move over petal area
            const x = t.x + Math.cos(angle) * radius;
            const y = t.y + Math.sin(angle) * radius * 0.5; // ellipse path
            bee.style.left = x + 'px';
            bee.style.top = y + 'px';
            bee.classList.add('landed');
        });
        requestAnimationFrame(patrol);
    }
    requestAnimationFrame(patrol);
})();