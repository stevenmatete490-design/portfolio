// --- SESSION-BASED LOGIN ---
const LOGIN_USER = "admin";
const LOGIN_PASS = "secure123";
const sessionKey = "certi_admin_logged";

function checkSession() {
    if(sessionStorage.getItem(sessionKey)) {
        loginModal.style.display = "none";
        adminDashboard.style.display = "flex";
        loadUploadedCertificates();
    }
}
checkSession();

loginBtn.addEventListener('click', () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if(user === LOGIN_USER && pass === LOGIN_PASS){
        sessionStorage.setItem(sessionKey, "true");
        loginModal.style.display = 'none';
        adminDashboard.style.display = 'flex';
        loadUploadedCertificates();
    } else {
        loginError.style.display = 'block';
    }
});

// --- UPLOAD CERTIFICATES (with PDF check) ---
uploadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        const fileInput = document.querySelector(`.file-input[data-category="${category}"]`);
        const descInput = fileInput.nextElementSibling;
        const file = fileInput.files[0];
        const desc = descInput.value.trim();

        if(!file) return alert("Select a PDF file first.");
        if(file.type !== "application/pdf") return alert("Only PDF files are allowed.");

        const reader = new FileReader();
        reader.onload = function(e){
            const certData = {
                name: file.name,
                description: desc,
                category: category,
                fileData: e.target.result
            };
            const existing = JSON.parse(localStorage.getItem('certificates')) || [];
            existing.push(certData);
            localStorage.setItem('certificates', JSON.stringify(existing));

            fileInput.value = "";
            descInput.value = "";
            alert("Certificate uploaded successfully!");
            loadUploadedCertificates();
        };
        reader.readAsDataURL(file);
    });
});

// --- LOAD EXISTING CERTIFICATES (with edit/delete) ---
function loadUploadedCertificates(){
    const existing = JSON.parse(localStorage.getItem('certificates')) || [];
    ['communication','ai','cloud'].forEach(cat => {
        const list = document.getElementById(`list-${cat}`);
        list.innerHTML = '';
        const certsInCategory = existing.filter(c => c.category === cat);
        if(certsInCategory.length === 0){
            list.innerHTML = '<div class="cert-item no-cert">No certificates uploaded yet.</div>';
        } else {
            certsInCategory.forEach((cert, index) => {
                const div = document.createElement('div');
                div.className = 'cert-item';
                div.innerHTML = `
                    <strong>${cert.name}</strong> — ${cert.description}
                    <button class="edit-btn" data-cat="${cat}" data-idx="${index}">✏️</button>
                    <button class="del-btn" data-cat="${cat}" data-idx="${index}">🗑️</button>
                `;
                list.appendChild(div);
            });
        }
    });

    // --- DELETE & EDIT HANDLERS ---
    document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const cat = btn.getAttribute('data-cat');
            const idx = parseInt(btn.getAttribute('data-idx'));
            const existing = JSON.parse(localStorage.getItem('certificates')) || [];
            const filtered = existing.filter((c, i) => !(c.category===cat && i===idx));
            localStorage.setItem('certificates', JSON.stringify(filtered));
            loadUploadedCertificates();
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const cat = btn.getAttribute('data-cat');
            const idx = parseInt(btn.getAttribute('data-idx'));
            const existing = JSON.parse(localStorage.getItem('certificates')) || [];
            const newDesc = prompt("Edit description:", existing.find((c,i)=>c.category===cat && i===idx).description);
            if(newDesc!==null){
                existing.find((c,i)=>c.category===cat && i===idx).description = newDesc;
                localStorage.setItem('certificates', JSON.stringify(existing));
                loadUploadedCertificates();
            }
        });
    });
}