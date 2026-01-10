// Global variables
let userPhoto = null;
let userName = '';
let currentTemplate = 'attending';
let backgroundImage = new Image();

// Load the template image
function loadTemplate() {
    // Always use the new template
    backgroundImage.src = 'new_template2.0.png';
    backgroundImage.crossOrigin = 'anonymous';
}

loadTemplate();

backgroundImage.onload = function () {
    drawCard();
};

backgroundImage.onerror = function () {
    drawCard();
};

window.addEventListener('load', function () {
    drawCard();
});

// Switch template
function switchTemplate(templateName) {
    currentTemplate = templateName;

    // Update button states
    document.getElementById('btn-attending').classList.remove('active');
    document.getElementById('btn-volunteering').classList.remove('active');

    if (templateName === 'attending') {
        document.getElementById('btn-attending').classList.add('active');
    } else {
        document.getElementById('btn-volunteering').classList.add('active');
    }

    loadTemplate();
}

// Handle photo upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('File size too large! Please upload an image smaller than 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            userPhoto = img;
            drawCard();

            const uploadArea = document.getElementById('uploadArea');
            uploadArea.classList.add('has-image');

            const uploadContent = uploadArea.querySelector('.upload-content');
            uploadContent.innerHTML = `
                <div class="upload-icon">✅</div>
                <p class="upload-text">Photo uploaded successfully!</p>
                <p class="upload-hint">Click to change photo</p>
            `;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Draw card on canvas
function drawCard() {
    const canvas = document.getElementById('cardCanvas');
    const ctx = canvas.getContext('2d');

    const nameInput = document.getElementById('nameInput');
    userName = nameInput ? nameInput.value.trim() : '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage.complete && backgroundImage.width > 0) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // ----------- PHOTO FRAME POSITION -----------
    const frameSize = 420;
    const frameX = (canvas.width - frameSize) / 2;
    const frameY = 250; // perfect location between top logos & I AM VOLUNTEERING

    if (userPhoto) {
        const imgAspect = userPhoto.width / userPhoto.height;
        let drawWidth, drawHeight;

        if (imgAspect > 1) {
            drawHeight = frameSize;
            drawWidth = frameSize * imgAspect;
        } else {
            drawWidth = frameSize;
            drawHeight = frameSize / imgAspect;
        }

        const offsetX = frameX - (drawWidth - frameSize) / 2;
        const offsetY = frameY - (drawHeight - frameSize) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(frameX + frameSize / 2, frameY + frameSize / 2, frameSize / 2, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(userPhoto, offsetX, offsetY, drawWidth, drawHeight);

        ctx.restore();

        // Border around photo
        ctx.strokeStyle = '#FF9900';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(frameX + frameSize / 2, frameY + frameSize / 2, frameSize / 2, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw nameplate if user entered name
    if (userName) {
        drawUserName(ctx, canvas, userName, frameY, frameSize);
    }
}

// ----------- UPDATED NAMEPLATE UNDER PHOTO -----------
function drawUserName(ctx, canvas, name, frameY, frameSize) {

    // Nameplate positioned 60px below photo
    const nameY = frameY + frameSize + 60;

    const plateWidth = canvas.width - 250;
    const plateX = (canvas.width - plateWidth) / 2;

    // Background plate
    // ctx.fillStyle = "rgba(0, 0, 0, 0.80)";
    // ctx.beginPath();
    // ctx.roundRect(plateX, nameY - 45, plateWidth, 90, 25);
    // ctx.fill();

    // Name text
    ctx.fillStyle = "#FF9900";
    ctx.font = "bold 60px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, canvas.width / 2, nameY);
}

// Download card
function downloadCard() {
    const canvas = document.getElementById('cardCanvas');

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `Volunteer-Card-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    const downloadBtn = document.getElementById('downloadBtn');
    const originalText = downloadBtn.innerHTML;

    downloadBtn.innerHTML = 'Downloaded!';
    downloadBtn.style.background = 'var(--success-green)';

    setTimeout(() => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.style.background = '';
    }, 2000);
}

// Add roundRect support
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}
