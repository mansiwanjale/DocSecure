# 📄 DocSecure – Secure Document Printing System

DocSecure is a  document upload and printing system that ensures secure, verified access to documents through a vendor-specific QR code mechanism. Designed to prevent unauthorized printing and protect sensitive data, it integrates security and usability in one seamless experience.

---

## 🚀 Features

- 🔐 Secure Uploads – Users can upload documents that are only accessible via encrypted session links.
- 📎 Vendor Verification via QR Code – Every vendor has a unique QR code to scan and verify document access.
- 🕵️‍♂️ Inactivity Timeout – Automatically logs out inactive sessions and expires encryption keys for added security.
- 🖥️ Simple Web Interface – User and vendor dashboards built with HTML, CSS, and JavaScript.
- 📂 Session-wise Storage – Uploaded files are stored in session-based folders, which auto-delete upon expiry.

---

## 🛠️ Tech Stack

- Frontend: HTML, CSS
- Backend: Node.js (`server.js`)
- Data Handling: JSON (`data.json`)
- Storage: Local session folders
- QR Code System: Static image-based for prototype

## 📁 Folder Structure
DocSecure/
├── public/
│   ├── user.html
│   ├── vendor.html
│   ├── user_style.css
│   └── qr_codes/
│       └── vendor_123.png
├── server.js
├── package.json
├── package-lock.json
├── data.json
└── .gitignore


---

## 🧪 How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/mansiwanjale/DocSecure.git
   cd DocSecure
2. Install dependencies
   npm install
3. Start the Server
   node server.js
(Vendor dashboard with QR will be displayed)
4. Open given link in your browser.

---
 ## Planned Features
 AI-based print priority management
 Smarter encryption for security
 Cloud integration
 Enhanced security
 
## Developed by :
Mansi Wanjale
Swati Kumbhar
Shrutika Nalavade
Tejal Khot
[BTech Second Year Students]
[Cummins College of Engineering, Pune]


