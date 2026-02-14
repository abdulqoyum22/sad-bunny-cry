

// Add scroll animation styles
const style = document.createElement('style');
style.textContent = `
  .fade-in-up {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  
  .fade-in-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .slide-up {
    opacity: 0;
    transform: translateY(50px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  
  .slide-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .gallery-img {
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  
  .gallery-img.visible {
    opacity: 1;
    transform: scale(1);
  }
  
  .step-box {
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  
  .step-box.visible {
    opacity: 1;
    transform: scale(1);
  }
  
  .footer-slide {
    opacity: 0;
    transform: translateY(60px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  
  .footer-slide.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);

// Initialize scroll observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains('step-box')) {
        // Stagger animation for step boxes
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 150);
      } else {
        entry.target.classList.add('visible');
      }
    }
  });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in-up, .slide-up, .gallery-img, .step-box, .footer-slide').forEach(el => {
    observer.observe(el);
  });
});

const pairAddress = "2vZ69t7nupP6FDSM6ykCJHGKYEmqEbTq72YNmL2MKuPx";

async function loadTokenData() {
    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`);

        const data = await res.json();
        const pair = data.pairs[0];

            if (pair) {
        document.getElementById("price").textContent = "$" + Number(pair.priceUsd).toFixed(6);
        document.getElementById("liquidity").textContent = "$" + Math.round(pair.liquidity.usd).toLocaleString();
        document.getElementById("mc").textContent = "$" + Math.round(pair.fdv).toLocaleString();
        document.getElementById("vol").textContent = "$" + Math.round(pair.volume.h24).toLocaleString();
            }
    } catch (err) {
        console.log("error loading token data", err);
    }
}

loadTokenData();
setInterval(loadTokenData, 10000);


function copyCA(evt) {
  const text = document.getElementById("contractAddress").innerText;
  navigator.clipboard.writeText(text).catch(() => {});

  const btn = (evt && (evt.currentTarget || evt.target)) || document.querySelector('button[onclick^="copyCA"]');
  if (btn) {
    const prev = btn.innerText;
    btn.innerText = "COPIED";
    setTimeout(() => {
      btn.innerText = prev || "COPY";
    }, 1500);
  }
}

document.querySelectorAll('section img').forEach(img => {
  img.addEventListener('click', () => {
    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightbox').classList.remove('hidden');
  });
});

const lightboxEl = document.getElementById('lightbox');
if (lightboxEl) {
  lightboxEl.addEventListener('click', () => {
    lightboxEl.classList.add('hidden');
  });
}

const menuToggle = document.getElementById("menuToggle");
const menuContent = document.getElementById("menuContent");
const openPfp = document.getElementById("openPfp");
const closePfp = document.getElementById("closePfp");
const pfpBackdrop = document.getElementById("pfpBackdrop");

let menuOpen = false;

if (menuToggle && menuContent) {
  menuToggle.addEventListener("click", () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      menuContent.classList.remove("-translate-x-full");
      menuContent.classList.add("translate-x-0");
    } else {
      menuContent.classList.remove("translate-x-0");
      menuContent.classList.add("-translate-x-full");
    }
  });
}

if (openPfp && menuContent) {
  openPfp.addEventListener("click", () => {
    menuContent.classList.remove("-translate-x-full");
    menuContent.classList.add("translate-x-0");
    menuOpen = true;
  });
}

if (closePfp && menuContent) {
  closePfp.addEventListener("click", () => {
    menuContent.classList.remove("translate-x-0");
    menuContent.classList.add("-translate-x-full");
    menuOpen = false;
  });
}

if (pfpBackdrop && closePfp) {
  pfpBackdrop.addEventListener('click', () => closePfp.click());
}

const generateBtn = document.getElementById("generateBtn");
const seedInput = document.getElementById("seedInput");
const uploadFile = document.getElementById("uploadFile");
const avatarImg = document.getElementById("avatarImg");
const downloadBtn = document.getElementById("downloadBtn");

// PFP Generator State
let pfpState = {
    body: 'sadbunny1',
    background: '#0f0a0a',
    trait: 'none',
    customText: '',
    removeBackground: false,
    bgTolerance: 30,
    bodyX: 0,
    bodyY: 0,
    traitX: 0,
    traitY: 0
};

// Body image mapping
const bodyImages = {
    sadbunny1: './images/sadbuny1.jpeg',
    sadbunny2: './images/sadbunny2.jpeg',
    sadbunny3: './images/sadbunny3.jpeg',
    sadbunny4: './images/sadbunny4.jpeg',
    sadbunny5: './images/sadbunny5.jpeg',
    hero: './images/sadbunnyhero.jpeg'
};

// Initialize PFP button handlers
document.addEventListener('DOMContentLoaded', () => {
    // Body selection
    document.querySelectorAll('.pfp-body-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pfp-body-btn').forEach(b => b.classList.remove('pfp-btn-active'));
            btn.classList.add('pfp-btn-active');
            pfpState.body = btn.dataset.body;
            generatePFPLocal();
        });
    });

    // Background selection
    document.querySelectorAll('.pfp-bg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pfp-bg-btn').forEach(b => b.classList.remove('pfp-btn-active'));
            btn.classList.add('pfp-btn-active');
            pfpState.background = btn.dataset.bg;
            generatePFPLocal();
        });
    });

    // Trait selection
    document.querySelectorAll('.pfp-trait-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pfp-trait-btn').forEach(b => b.classList.remove('pfp-btn-active'));
            btn.classList.add('pfp-btn-active');
            pfpState.trait = btn.dataset.trait;
            generatePFPLocal();
        });
    });

    // Background removal checkbox
    const removeBgCheckbox = document.getElementById('removeBg');
    const bgRemovalOptions = document.getElementById('bgRemovalOptions');
    if (removeBgCheckbox) {
        removeBgCheckbox.addEventListener('change', (e) => {
            pfpState.removeBackground = e.target.checked;
            if (bgRemovalOptions) {
                bgRemovalOptions.classList.toggle('hidden', !e.target.checked);
            }
            generatePFPLocal();
        });
    }

    // Background tolerance slider
    const bgTolerance = document.getElementById('bgTolerance');
    const toleranceValue = document.getElementById('toleranceValue');
    if (bgTolerance) {
        bgTolerance.addEventListener('input', (e) => {
            pfpState.bgTolerance = parseInt(e.target.value);
            if (toleranceValue) {
                toleranceValue.textContent = e.target.value;
            }
            generatePFPLocal();
        });
    }

    // Trait position X offset
    const traitXOffset = document.getElementById('traitXOffset');
    const traitXValue = document.getElementById('traitXValue');
    if (traitXOffset) {
        traitXOffset.addEventListener('input', (e) => {
            pfpState.traitX = parseInt(e.target.value);
            if (traitXValue) {
                traitXValue.textContent = e.target.value;
            }
            generatePFPLocal();
        });
    }

    // Trait position Y offset
    const traitYOffset = document.getElementById('traitYOffset');
    const traitYValue = document.getElementById('traitYValue');
    if (traitYOffset) {
        traitYOffset.addEventListener('input', (e) => {
            pfpState.traitY = parseInt(e.target.value);
            if (traitYValue) {
                traitYValue.textContent = e.target.value;
            }
            generatePFPLocal();
        });
    }

    // Reset trait position button
    const resetTraitPosition = document.getElementById('resetTraitPosition');
    if (resetTraitPosition) {
        resetTraitPosition.addEventListener('click', () => {
            pfpState.traitX = 0;
            pfpState.traitY = 0;
            if (traitXOffset) traitXOffset.value = 0;
            if (traitXValue) traitXValue.textContent = '0';
            if (traitYOffset) traitYOffset.value = 0;
            if (traitYValue) traitYValue.textContent = '0';
            generatePFPLocal();
        });
    }

    // Body position X offset
    const bodyXOffset = document.getElementById('bodyXOffset');
    const bodyXValue = document.getElementById('bodyXValue');
    if (bodyXOffset) {
        bodyXOffset.addEventListener('input', (e) => {
            pfpState.bodyX = parseInt(e.target.value);
            if (bodyXValue) {
                bodyXValue.textContent = e.target.value;
            }
            generatePFPLocal();
        });
    }

    // Body position Y offset
    const bodyYOffset = document.getElementById('bodyYOffset');
    const bodyYValue = document.getElementById('bodyYValue');
    if (bodyYOffset) {
        bodyYOffset.addEventListener('input', (e) => {
            pfpState.bodyY = parseInt(e.target.value);
            if (bodyYValue) {
                bodyYValue.textContent = e.target.value;
            }
            generatePFPLocal();
        });
    }

    // Reset body position button
    const resetBodyPosition = document.getElementById('resetBodyPosition');
    if (resetBodyPosition) {
        resetBodyPosition.addEventListener('click', () => {
            pfpState.bodyX = 0;
            pfpState.bodyY = 0;
            if (bodyXOffset) bodyXOffset.value = 0;
            if (bodyXValue) bodyXValue.textContent = '0';
            if (bodyYOffset) bodyYOffset.value = 0;
            if (bodyYValue) bodyYValue.textContent = '0';
            generatePFPLocal();
        });
    }

    // Generate initial preview
    generatePFPLocal();
});

// Enhanced PFP Generator with full customization
async function generatePFPLocal() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw background
    if (pfpState.background.startsWith('gradient')) {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        if (pfpState.background === 'gradient1') {
            gradient.addColorStop(0, '#7a1c1c');
            gradient.addColorStop(1, '#0f0a0a');
        } else if (pfpState.background === 'gradient2') {
            gradient.addColorStop(0, '#f97316');
            gradient.addColorStop(1, '#7a1c1c');
        }
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = pfpState.background;
    }
    ctx.fillRect(0, 0, size, size);

    // Load and draw body image
    let src = bodyImages[pfpState.body] || './images/sadbuny1.jpeg';
    let isCustomUpload = false;
    
    // Check if user uploaded a custom image
    if (uploadFile && uploadFile.files && uploadFile.files[0]) {
        try {
            src = await new Promise((res, rej) => {
                const r = new FileReader();
                r.onload = () => res(r.result);
                r.onerror = rej;
                r.readAsDataURL(uploadFile.files[0]);
            });
            isCustomUpload = true;
        } catch (e) {
            console.log('Using default body image');
        }
    }

    const img = await new Promise((res) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => res(i);
        i.onerror = () => {
            // Fallback to default image
            const fallback = new Image();
            fallback.crossOrigin = 'anonymous';
            fallback.onload = () => res(fallback);
            fallback.onerror = () => res(null);
            fallback.src = './images/sadbuny1.jpeg';
        };
        i.src = src;
    });

    if (img) {
        // Calculate position offsets based on bodyX/bodyY
        const xOffset = (pfpState.bodyX / 100) * (size * 0.3);
        const yOffset = (pfpState.bodyY / 100) * (size * 0.3);
        
        // Cover-fit draw (square to square)
        const sw = img.width, sh = img.height;
        const scale = Math.max(size / sw, size / sh);
        const dw = sw * scale, dh = sh * scale;
        const dx = (size - dw) / 2 + xOffset, dy = (size - dh) / 2 + yOffset;
        
        // Apply background removal if enabled and not custom upload
        if (pfpState.removeBackground && !isCustomUpload) {
            // Create temporary canvas for background removal
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = size;
            tempCanvas.height = size;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw image on temp canvas
            tempCtx.drawImage(img, dx, dy, dw, dh);
            
            // Get image data
            const imageData = tempCtx.getImageData(0, 0, size, size);
            const data = imageData.data;
            
            // Get the background color (top-left pixel as reference)
            const bgR = data[0];
            const bgG = data[1];
            const bgB = data[2];
            
            // Tolerance for color matching
            const tolerance = pfpState.bgTolerance * 2.55; // Convert 0-100 to 0-255
            
            // Simple background removal - make pixels transparent if they match background
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Check if pixel is close to background color
                const diff = Math.sqrt(
                    Math.pow(r - bgR, 2) +
                    Math.pow(g - bgG, 2) +
                    Math.pow(b - bgB, 2)
                );
                
                if (diff < tolerance) {
                    data[i + 3] = 0; // Make transparent
                }
            }
            
            tempCtx.putImageData(imageData, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0);
        } else {
            ctx.drawImage(img, dx, dy, dw, dh);
        }
    }

    // Draw vignette overlay
    const grad = ctx.createRadialGradient(size * 0.5, size * 0.4, size * 0.2, size * 0.5, size * 0.5, size * 0.9);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Draw trait overlays with position offsets
    drawTrait(ctx, pfpState.trait, size, pfpState.traitX, pfpState.traitY);

    // Draw custom text
    const customText = seedInput ? seedInput.value : '';
    if (customText) {
        // Text background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const textWidth = ctx.measureText(customText).width + 40;
        ctx.fillRect(size/2 - textWidth/2, size - 100, textWidth, 50);
        
        // Text
        ctx.fillStyle = '#f3f3f3';
        ctx.font = 'bold 36px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(customText, size / 2, size - 65);
    }

    // Set preview + download
    const dataUrl = canvas.toDataURL('image/png');
    if (avatarImg) avatarImg.src = dataUrl;
    if (downloadBtn) {
        downloadBtn.href = dataUrl;
        downloadBtn.download = 'sad-bunny-pfp.png';
        downloadBtn.classList.remove('hidden');
    }
}

// Draw trait overlays on canvas
function drawTrait(ctx, trait, size, offsetX = 0, offsetY = 0) {
    const cx = size * 0.5 + (offsetX / 100) * (size * 0.3);
    const cy = size * 0.5 + (offsetY / 100) * (size * 0.3);
    
    // Calculate offsets for individual trait elements
    const xOff = (offsetX / 100) * (size * 0.3);
    const yOff = (offsetY / 100) * (size * 0.3);

    switch (trait) {
        case 'tear':
            // Draw red tear drops
            ctx.fillStyle = 'rgba(185, 28, 28, 0.9)';
            
            // Left tear
            ctx.beginPath();
            ctx.ellipse(size * 0.38 + xOff, size * 0.55 + yOff, size * 0.025, size * 0.05, Math.PI * 0.1, 0, Math.PI * 2);
            ctx.fill();
            
            // Right tear
            ctx.beginPath();
            ctx.ellipse(size * 0.62 + xOff, size * 0.55 + yOff, size * 0.025, size * 0.05, -Math.PI * 0.1, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'sunglasses':
            // Draw cool sunglasses
            ctx.fillStyle = '#111';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            
            // Left lens
            ctx.beginPath();
            ctx.roundRect(size * 0.28 + xOff, size * 0.38 + yOff, size * 0.18, size * 0.12, 10);
            ctx.fill();
            ctx.stroke();
            
            // Right lens
            ctx.beginPath();
            ctx.roundRect(size * 0.54 + xOff, size * 0.38 + yOff, size * 0.18, size * 0.12, 10);
            ctx.fill();
            ctx.stroke();
            
            // Bridge
            ctx.beginPath();
            ctx.moveTo(size * 0.46 + xOff, size * 0.43 + yOff);
            ctx.lineTo(size * 0.54 + xOff, size * 0.43 + yOff);
            ctx.lineWidth = 4;
            ctx.stroke();
            break;

        case 'crown':
            // Draw golden crown
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#b8860b';
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(size * 0.3 + xOff, size * 0.32 + yOff);
            ctx.lineTo(size * 0.3 + xOff, size * 0.22 + yOff);
            ctx.lineTo(size * 0.4 + xOff, size * 0.28 + yOff);
            ctx.lineTo(size * 0.5 + xOff, size * 0.18 + yOff);
            ctx.lineTo(size * 0.6 + xOff, size * 0.28 + yOff);
            ctx.lineTo(size * 0.7 + xOff, size * 0.22 + yOff);
            ctx.lineTo(size * 0.7 + xOff, size * 0.32 + yOff);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Crown jewels
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(size * 0.5 + xOff, size * 0.26 + yOff, size * 0.02, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'hat':
            // Draw top hat
            ctx.fillStyle = '#1a1a1a';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            
            // Hat top
            ctx.beginPath();
            ctx.roundRect(size * 0.35 + xOff, size * 0.12 + yOff, size * 0.3, size * 0.22, 5);
            ctx.fill();
            ctx.stroke();
            
            // Hat brim
            ctx.beginPath();
            ctx.ellipse(size * 0.5 + xOff, size * 0.34 + yOff, size * 0.22, size * 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Red band
            ctx.fillStyle = '#7a1c1c';
            ctx.fillRect(size * 0.35 + xOff, size * 0.30 + yOff, size * 0.3, size * 0.04);
            break;

        case 'halo':
            // Draw glowing halo
            const haloGrad = ctx.createRadialGradient(cx, size * 0.22 + yOff, 0, cx, size * 0.22 + yOff, size * 0.12);
            haloGrad.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            haloGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
            haloGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.ellipse(cx, size * 0.22 + yOff, size * 0.12, size * 0.03, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(cx, size * 0.22 + yOff, size * 0.1, size * 0.025, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;

        case 'blush':
            // Draw cute blush marks
            ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
            
            // Left cheek
            ctx.beginPath();
            ctx.ellipse(size * 0.32 + xOff, size * 0.55 + yOff, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Right cheek
            ctx.beginPath();
            ctx.ellipse(size * 0.68 + xOff, size * 0.55 + yOff, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'chains':
            // Draw gold chains
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 6;
            
            // Main chain
            ctx.beginPath();
            ctx.moveTo(size * 0.35 + xOff, size * 0.4 + yOff);
            ctx.quadraticCurveTo(cx, size * 0.65 + yOff, size * 0.65 + xOff, size * 0.4 + yOff);
            ctx.stroke();
            
            // Chain links detail
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(size * 0.38 + xOff, size * 0.42 + yOff);
            ctx.quadraticCurveTo(cx, size * 0.62 + yOff, size * 0.62 + xOff, size * 0.42 + yOff);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Pendant
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(cx - 15, size * 0.55 + yOff);
            ctx.lineTo(cx + 15, size * 0.55 + yOff);
            ctx.lineTo(cx, size * 0.7 + yOff);
            ctx.closePath();
            ctx.fill();
            break;

        case 'hearteyes':
            // Draw heart eyes
            ctx.fillStyle = '#ff4444';
            
            // Left heart eye
            ctx.beginPath();
            const lx = size * 0.35 + xOff;
            const ly = size * 0.45 + yOff;
            ctx.moveTo(lx, ly - size * 0.03);
            ctx.bezierCurveTo(lx - size * 0.03, ly - size * 0.05, lx - size * 0.05, ly, lx, ly + size * 0.02);
            ctx.bezierCurveTo(lx + size * 0.05, ly, lx + size * 0.03, ly - size * 0.05, lx, ly - size * 0.03);
            ctx.fill();
            
            // Right heart eye
            ctx.beginPath();
            const rx = size * 0.65 + xOff;
            const ry = size * 0.45 + yOff;
            ctx.moveTo(rx, ry - size * 0.03);
            ctx.bezierCurveTo(rx - size * 0.03, ry - size * 0.05, rx - size * 0.05, ry, rx, ry + size * 0.02);
            ctx.bezierCurveTo(rx + size * 0.05, ry, rx + size * 0.03, ry - size * 0.05, rx, ry - size * 0.03);
            ctx.fill();
            break;

        case 'moneyeyes':
            // Draw dollar sign eyes
            ctx.fillStyle = '#22c55e';
            ctx.font = `bold ${size * 0.08}px Arial`;
            ctx.textAlign = 'center';
            
            // Left eye $
            ctx.fillText('$', size * 0.35 + xOff, size * 0.48 + yOff);
            // Right eye $
            ctx.fillText('$', size * 0.65 + xOff, size * 0.48 + yOff);
            break;

        case 'stareyes':
            // Draw star eyes
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            
            // Draw star function
            function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
                let rot = Math.PI / 2 * 3;
                let x = cx;
                let y = cy;
                let step = Math.PI / spikes;
                
                ctx.beginPath();
                ctx.moveTo(cx, cy - outerRadius);
                for (let i = 0; i < spikes; i++) {
                    x = cx + Math.cos(rot) * outerRadius;
                    y = cy + Math.sin(rot) * outerRadius;
                    ctx.lineTo(x, y);
                    rot += step;
                    
                    x = cx + Math.cos(rot) * innerRadius;
                    y = cy + Math.sin(rot) * innerRadius;
                    ctx.lineTo(x, y);
                    rot += step;
                }
                ctx.lineTo(cx, cy - outerRadius);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            
            drawStar(size * 0.35 + xOff, size * 0.45 + yOff, 5, size * 0.04, size * 0.02);
            drawStar(size * 0.65 + xOff, size * 0.45 + yOff, 5, size * 0.04, size * 0.02);
            break;

        case 'bandana':
            // Draw red bandana
            ctx.fillStyle = '#dc2626';
            ctx.strokeStyle = '#991b1b';
            ctx.lineWidth = 2;
            
            // Bandana shape across forehead
            ctx.beginPath();
            ctx.moveTo(size * 0.2 + xOff, size * 0.35 + yOff);
            ctx.lineTo(size * 0.8 + xOff, size * 0.35 + yOff);
            ctx.lineTo(size * 0.75 + xOff, size * 0.42 + yOff);
            ctx.lineTo(size * 0.25 + xOff, size * 0.42 + yOff);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Bandana ties
            ctx.beginPath();
            ctx.moveTo(size * 0.25 + xOff, size * 0.4 + yOff);
            ctx.quadraticCurveTo(size * 0.15 + xOff, size * 0.5 + yOff, size * 0.1 + xOff, size * 0.55 + yOff);
            ctx.lineWidth = size * 0.02;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(size * 0.75 + xOff, size * 0.4 + yOff);
            ctx.quadraticCurveTo(size * 0.85 + xOff, size * 0.5 + yOff, size * 0.9 + xOff, size * 0.55 + yOff);
            ctx.stroke();
            break;

        case 'goldteeth':
            // Draw gold teeth/grillz
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#b8860b';
            ctx.lineWidth = 2;
            
            // Top row teeth
            ctx.beginPath();
            ctx.roundRect(size * 0.35 + xOff, size * 0.58 + yOff, size * 0.3, size * 0.08, 5);
            ctx.fill();
            ctx.stroke();
            
            // Bottom row teeth
            ctx.beginPath();
            ctx.roundRect(size * 0.35 + xOff, size * 0.67 + yOff, size * 0.3, size * 0.06, 3);
            ctx.fill();
            ctx.stroke();
            
            // Add shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(size * 0.37 + xOff, size * 0.59 + yOff, size * 0.1, size * 0.02);
            break;

        case 'earrings':
            // Draw diamond earrings
            ctx.fillStyle = '#60a5fa';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            
            // Left earring
            ctx.beginPath();
            ctx.moveTo(size * 0.18 + xOff, size * 0.48 + yOff);
            ctx.lineTo(size * 0.22 + xOff, size * 0.58 + yOff);
            ctx.lineTo(size * 0.18 + xOff, size * 0.65 + yOff);
            ctx.lineTo(size * 0.14 + xOff, size * 0.58 + yOff);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Right earring
            ctx.beginPath();
            ctx.moveTo(size * 0.82 + xOff, size * 0.48 + yOff);
            ctx.lineTo(size * 0.86 + xOff, size * 0.58 + yOff);
            ctx.lineTo(size * 0.82 + xOff, size * 0.65 + yOff);
            ctx.lineTo(size * 0.78 + xOff, size * 0.58 + yOff);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Earring shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(size * 0.17 + xOff, size * 0.55 + yOff, size * 0.01, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(size * 0.81 + xOff, size * 0.55 + yOff, size * 0.01, 0, Math.PI * 2);
            ctx.fill();
            break;

        case '3dglasses':
            // Draw 3D glasses
            // Left lens - red
            ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.strokeStyle = '#991b1b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(size * 0.25 + xOff, size * 0.4 + yOff, size * 0.18, size * 0.14, 8);
            ctx.fill();
            ctx.stroke();
            
            // Right lens - cyan
            ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
            ctx.strokeStyle = '#0e7490';
            ctx.beginPath();
            ctx.roundRect(size * 0.57 + xOff, size * 0.4 + yOff, size * 0.18, size * 0.14, 8);
            ctx.fill();
            ctx.stroke();
            
            // Bridge
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(size * 0.43 + xOff, size * 0.47 + yOff);
            ctx.lineTo(size * 0.57 + xOff, size * 0.47 + yOff);
            ctx.stroke();
            break;

        case 'fireaura':
            // Draw fire aura around the character
            const fireGrad = ctx.createRadialGradient(cx, cy, size * 0.2, cx, cy, size * 0.5);
            fireGrad.addColorStop(0, 'rgba(249, 115, 22, 0)');
            fireGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.2)');
            fireGrad.addColorStop(0.8, 'rgba(239, 68, 68, 0.3)');
            fireGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            
            ctx.fillStyle = fireGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Fire flames at bottom
            ctx.fillStyle = 'rgba(249, 115, 22, 0.6)';
            for (let i = 0; i < 7; i++) {
                const fx = size * (0.2 + i * 0.1) + xOff;
                ctx.beginPath();
                ctx.moveTo(fx - size * 0.03, size * 0.85 + yOff);
                ctx.quadraticCurveTo(fx, size * 0.7 + yOff, fx + size * 0.03, size * 0.85 + yOff);
                ctx.fill();
            }
            break;
    }
}


if (generateBtn) {
  generateBtn.addEventListener('click', async () => {
    generateBtn.disabled = true;
    generateBtn.innerText = "Generating...";

    // Show status under button if element exists
    const statusEl = document.getElementById("generateStatus");
    if (statusEl) {
      statusEl.textContent = "Generating your PFP...";
      statusEl.classList.remove("hidden");
    }

    try {
      await generatePFPLocal();
      if (statusEl) statusEl.textContent = "Done!";
    } catch (err) {
      console.error("Generation error:", err);
      if (statusEl) {
        statusEl.textContent = "Failed: " + err.message;
      } else {
        alert("Generation failed: " + err.message);
      }
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerText = "Generate PFP";
    }
  });
}

// Draw first preview on page load
generatePFPLocal();
