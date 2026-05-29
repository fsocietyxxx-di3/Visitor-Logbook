/* main.js */

document.addEventListener('DOMContentLoaded', () => {
    const VISTORS_XML_KEY = 'visitorsXML';
    const THEME_PREFERENCE_KEY = 'themePreference';

    // Initial seed data
    const seedXML = `
        <visitors>
            <visitor>
                <id>V-001</id>
                <name>Juan Dela Cruz</name>
                <purpose>Meeting with HR</purpose>
                <host>Jane Doe</host>
                <contact>09171234567</contact>
                <date>2023-10-26</date>
                <time_in>09:00</time_in>
                <time_out>10:00</time_out>
                <status>Completed</status>
            </visitor>
            <visitor>
                <id>V-002</id>
                <name>Maria Clara</name>
                <purpose>Package Delivery</purpose>
                <host>John Smith</host>
                <contact>09287654321</contact>
                <date>${new Date().toISOString().slice(0, 10)}</date>
                <time_in>10:30</time_in>
                <time_out></time_out>
                <status>Active</status>
            </visitor>
            <visitor>
                <id>V-003</id>
                <name>Jose Rizal</name>
                <purpose>Job Interview</purpose>
                <host>Juan Luna</host>
                <contact>09998765432</contact>
                 <date>${new Date().toISOString().slice(0, 10)}</date>
                <time_in>14:00</time_in>
                <time_out></time_out>
                <status>Pending</status>
            </visitor>
        </visitors>
    `;

    // --- Theme Management ---
    function applyTheme() {
        const preferredTheme = localStorage.getItem(THEME_PREFERENCE_KEY);
        if (preferredTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem(THEME_PREFERENCE_KEY, theme);
        });
    }
    
    applyTheme(); // Apply theme on initial load

    // --- XML Data Layer ---
    function getVisitorsXML() {
        let xmlString = localStorage.getItem(VISTORS_XML_KEY);
        if (!xmlString) {
            localStorage.setItem(VISTORS_XML_KEY, seedXML);
            xmlString = seedXML;
        }
        return new DOMParser().parseFromString(xmlString, 'application/xml');
    }

    function saveVisitorsXML(xmlDoc) {
        localStorage.setItem(VISTORS_XML_KEY, new XMLSerializer().serializeToString(xmlDoc));
    }

    function getAllVisitors(xmlDoc) {
        const doc = xmlDoc || getVisitorsXML();
        return Array.from(doc.querySelectorAll('visitor'));
    }

    // --- Page Initializers ---
    const page = document.body.id;
    if (page === 'dashboard-page') initDashboard();
    if (page === 'add-visitor-page') initAddVisitorForm();
    if (page === 'edit-visitor-page') initEditVisitorForm();
    
    initSidebar();
    initThemeToggle();

    // --- Initializers ---
    function initSidebar() {
        const hamburger = document.querySelector('.hamburger');
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.querySelector('.backdrop');

        if(hamburger) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                backdrop.classList.toggle('active');
            });
        }

        if(backdrop) {
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('active');
                backdrop.classList.remove('active');
            });
        }
    }

    function initDashboard() {
        renderTable();
        updateSummaryCards();
        
        const searchInput = document.getElementById('search-bar');
        searchInput.addEventListener('keyup', () => renderTable(searchInput.value));

        initImportExport();
    }

    function initAddVisitorForm() {
        document.getElementById('visitor-id').value = generateNewVisitorId();
        document.getElementById('date').valueAsDate = new Date();

        const form = document.getElementById('add-visitor-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(form)) {
                addVisitor(form);
            }
        });
         document.getElementById('cancel-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    function initEditVisitorForm() {
        const form = document.getElementById('edit-visitor-form');
        const visitorId = new URLSearchParams(window.location.search).get('id');
        const visitors = getAllVisitors();
        const visitorNode = visitors.find(v => v.querySelector('id').textContent === visitorId);

        if (visitorNode) {
            prefillEditForm(form, visitorNode);
        } else {
            showNotFoundError();
            return;
        }
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(form)) {
                updateVisitor(form, visitorId);
            }
        });
         document.getElementById('cancel-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }


    // --- DOM Manipulation & Rendering ---
    function renderTable(searchTerm = '') {
        const tableBody = document.getElementById('visitor-table-body');
        const emptyState = document.getElementById('empty-state');
        const visitors = getAllVisitors();
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        tableBody.innerHTML = '';

        const filteredVisitors = visitors.filter(visitor => {
            const name = visitor.querySelector('name').textContent.toLowerCase();
            const purpose = visitor.querySelector('purpose').textContent.toLowerCase();
            return name.includes(lowerCaseSearchTerm) || purpose.includes(lowerCaseSearchTerm);
        });

        if (filteredVisitors.length === 0) {
            emptyState.style.display = 'block';
            tableBody.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tableBody.style.display = '';
            filteredVisitors.forEach(visitor => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${visitor.querySelector('id').textContent}</td>
                    <td>${visitor.querySelector('name').textContent}</td>
                    <td>${visitor.querySelector('purpose').textContent}</td>
                    <td>${visitor.querySelector('host').textContent}</td>
                    <td>${visitor.querySelector('contact').textContent}</td>
                    <td>${visitor.querySelector('date').textContent}</td>
                    <td>${visitor.querySelector('time_in').textContent}</td>
                    <td>${visitor.querySelector('time_out').textContent || '--'}</td>
                    <td><span class="status status-${visitor.querySelector('status').textContent}">${visitor.querySelector('status').textContent}</span></td>
                    <td class="action-buttons">
                        <a href="edit.html?id=${visitor.querySelector('id').textContent}" class="btn-edit"><i class="fas fa-pencil-alt"></i></a>
                        <button class="btn-delete" data-id="${visitor.querySelector('id').textContent}"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }

        // Add event listeners for delete buttons
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                deleteVisitor(id);
            });
        });
    }

    function updateSummaryCards() {
        const visitors = getAllVisitors();
        const today = new Date().toISOString().slice(0, 10);

        const totalVisitors = visitors.length;
        const todaysVisitors = visitors.filter(v => v.querySelector('date').textContent === today).length;
        const activeVisitors = visitors.filter(v => v.querySelector('status').textContent === 'Active').length;
        const completedVisitors = visitors.filter(v => v.querySelector('status').textContent === 'Completed').length;

        document.getElementById('total-visitors').textContent = totalVisitors;
        document.getElementById('todays-visitors').textContent = todaysVisitors;
        document.getElementById('active-visitors').textContent = activeVisitors;
        document.getElementById('completed-visitors').textContent = completedVisitors;
    }

    function prefillEditForm(form, visitor) {
        form.querySelector('#visitor-id').value = visitor.querySelector('id').textContent;
        form.querySelector('#full-name').value = visitor.querySelector('name').textContent;
        form.querySelector('#purpose').value = visitor.querySelector('purpose').textContent;
        form.querySelector('#host').value = visitor.querySelector('host').textContent;
        form.querySelector('#contact').value = visitor.querySelector('contact').textContent;
        form.querySelector('#date').value = visitor.querySelector('date').textContent;
        form.querySelector('#time-in').value = visitor.querySelector('time_in').textContent;
        form.querySelector('#time-out').value = visitor.querySelector('time_out').textContent;
        form.querySelector('#status').value = visitor.querySelector('status').textContent;
    }

    function showNotFoundError() {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('edit-visitor-form').style.display = 'none';
    }

    // --- Data Logic ---

    function generateNewVisitorId() {
        const xmlDoc = getVisitorsXML();
        const lastVisitor = xmlDoc.querySelector('visitor:last-of-type > id');
        if(lastVisitor){
            const lastId = parseInt(lastVisitor.textContent.split('-')[1]);
            return `V-${(lastId + 1).toString().padStart(3, '0')}`;
        }
        return 'V-001';
    }

    function addVisitor(form) {
        const xmlDoc = getVisitorsXML();
        const newVisitor = xmlDoc.createElement('visitor');
        
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            const node = xmlDoc.createElement(key.replace('-','_'));
            node.textContent = value;
             newVisitor.appendChild(node);
        }
        
        xmlDoc.querySelector('visitors').appendChild(newVisitor);
        saveVisitorsXML(xmlDoc);
        window.location.href = 'index.html';
    }

    function updateVisitor(form, visitorId) {
        const xmlDoc = getVisitorsXML();
        const visitors = getAllVisitors(xmlDoc);
        const visitorNode = visitors.find(v => v.querySelector('id').textContent === visitorId);

        if (visitorNode) {
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                if(visitorNode.querySelector(key.replace('-','_'))) {
                    visitorNode.querySelector(key.replace('-','_')).textContent = value;
                }
            }
            
            saveVisitorsXML(xmlDoc);
            window.location.href = 'index.html';
        } else {
             showToast('Error: Could not save changes. Visitor not found.', 'error');
        }
    }
    
    function deleteVisitor(visitorId) {
        if (!confirm(`Are you sure you want to delete visitor ${visitorId}?`)) return;

        const xmlDoc = getVisitorsXML();
        const visitors = getAllVisitors(xmlDoc);
        const visitorNode = visitors.find(v => v.querySelector('id').textContent === visitorId);
        
        if (visitorNode) {
            visitorNode.remove();
            saveVisitorsXML(xmlDoc);
            renderTable();
            updateSummaryCards();
            showToast(`Visitor ${visitorId} deleted successfully.`, 'success');
        } else {
            showToast(`Error: Could not delete visitor ${visitorId}. Not found.`, 'error');
        }
    }

    // --- Validation ---
    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            const errorEl = field.nextElementSibling;
            if (!field.value.trim()) {
                field.style.borderColor = 'var(--error-color)';
                if (errorEl && errorEl.classList.contains('validation-error')) {
                     errorEl.style.display = 'block';
                }
                isValid = false;
            } else {
                field.style.borderColor = '';
                if (errorEl && errorEl.classList.contains('validation-error')) {
                     errorEl.style.display = 'none';
                }
            }
        });

        return isValid;
    }

    // --- EXPORT / IMPORT ---
    function initImportExport() {
        const importBtn = document.getElementById('import-btn');
        const exportBtn = document.getElementById('export-btn');
        const fileInput = document.getElementById('import-file-input');

        exportBtn.addEventListener('click', exportXML);
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFileImport(e.target.files[0]));
    }

    function exportXML() {
        const xmlDoc = getVisitorsXML();
        if (!xmlDoc.querySelector('visitor')) {
            showToast('No visitor records to export.', 'warning');
            return;
        }
        const xmlString = new XMLSerializer().serializeToString(xmlDoc);
        const formattedXml = `<?xml version="1.0" encoding="UTF-8"?>\n${formatXml(xmlString)}`;
        const blob = new Blob([formattedXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `visitors_export_${date}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleFileImport(file) {
        if (!file) return;
        if (!file.name.endsWith('.xml')) {
            showToast('Invalid file type. Please select a .xml file.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const xmlString = e.target.result;
            validateAndProcessImport(xmlString);
        };
        reader.readAsText(file);
    }

    function validateAndProcessImport(xmlString) {
        const parser = new DOMParser();
        const importedDoc = parser.parseFromString(xmlString, 'application/xml');

        if (importedDoc.querySelector('parsererror')) {
            showToast('The file could not be parsed as valid XML.', 'error');
            return;
        }

        if (importedDoc.documentElement.tagName !== 'visitors') {
            showToast(`Root element must be <visitors>. Found: <${importedDoc.documentElement.tagName}> instead.`, 'error');
            return;
        }

        const importedVisitors = Array.from(importedDoc.querySelectorAll('visitor'));
        const validationErrors = validateImportedVisitors(importedVisitors);

        if (validationErrors.length > 0) {
            validationErrors.forEach(error => showToast(error, 'error'));
            return;
        }
        
        const existingIds = getAllVisitors().map(v => v.querySelector('id').textContent);
        const newRecords = importedVisitors.filter(v => !existingIds.includes(v.querySelector('id').textContent));
        const duplicateRecords = importedVisitors.filter(v => existingIds.includes(v.querySelector('id').textContent));

        showImportModal(newRecords, duplicateRecords, importedDoc);
    }
    
    function validateImportedVisitors(visitors) {
        const errors = [];
        const requiredFields = ['id', 'name', 'purpose', 'host', 'contact', 'date', 'time_in', 'time_out', 'status'];
        const validStatuses = ['Active', 'Completed', 'Pending'];
        const ids = new Set();

        visitors.forEach((visitor, index) => {
            const recordNum = index + 1;

            for (const field of requiredFields) {
                const node = visitor.querySelector(field);
                // time_out can be empty, but the tag must exist
                if (field !== 'time_out' && (!node || !node.textContent.trim())) {
                    errors.push(`Visitor record ${recordNum} is missing the <${field}> field.`);
                }
            }
            
            const id = visitor.querySelector('id')?.textContent;
            if (!id || !/^V-\d+$/.test(id)) {
                 errors.push(`Visitor record ${recordNum} has an invalid ID format. Expected 'V-000'.`);
            } else if (ids.has(id)) {
                errors.push(`Duplicate ID found in imported file: ${id} appears more than once.`);
            } else {
                ids.add(id);
            }

            const date = visitor.querySelector('date')?.textContent;
            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                 errors.push(`Visitor record ${recordNum} has an invalid date format: ${date}. Expected YYYY-MM-DD.`);
            }
            
            const status = visitor.querySelector('status')?.textContent;
            if (!status || !validStatuses.includes(status)) {
                 errors.push(`Visitor record ${recordNum} has an invalid status: '${status}'. Must be Active, Completed, or Pending.`);
            }

            const contact = visitor.querySelector('contact')?.textContent;
             if (!contact || !/^\d{7,}$/.test(contact)) {
                 errors.push(`Visitor record ${recordNum} has an invalid contact number.`);
            }
        });

        return errors;
    }

    function showImportModal(newRecords, duplicateRecords, importedDoc) {
        const modal = document.getElementById('import-modal');
        document.getElementById('import-new-count').textContent = newRecords.length;
        document.getElementById('import-duplicate-count').textContent = duplicateRecords.length;

        modal.classList.add('active');

        const mergeBtn = document.getElementById('merge-btn');
        const replaceBtn = document.getElementById('replace-btn');
        const cancelBtn = document.getElementById('cancel-import-btn');

        const clickHandler = (e) => {
            if (e.target === mergeBtn) {
                mergeData(newRecords);
            } else if (e.target === replaceBtn) {
                replaceData(importedDoc);
            } // Cancel does nothing but close the modal
            
            modal.classList.remove('active');
            // Remove listeners to prevent multiple fires
            mergeBtn.removeEventListener('click', clickHandler);
            replaceBtn.removeEventListener('click', clickHandler);
            cancelBtn.removeEventListener('click', clickHandler);
        }

        mergeBtn.addEventListener('click', clickHandler);
        replaceBtn.addEventListener('click', clickHandler);
        cancelBtn.addEventListener('click', clickHandler);
    }

    function mergeData(newRecords) {
        const xmlDoc = getVisitorsXML();
        const visitorsNode = xmlDoc.querySelector('visitors');
        newRecords.forEach(record => {
            // Import node into the document before appending
            const importedNode = xmlDoc.importNode(record, true);
            visitorsNode.appendChild(importedNode);
        });
        saveVisitorsXML(xmlDoc);
        renderTable();
        updateSummaryCards();
        showToast(`Import complete. ${newRecords.length} new records added.`, 'success');
    }

    function replaceData(importedDoc) {
        saveVisitorsXML(importedDoc);
        renderTable();
        updateSummaryCards();
        const total = importedDoc.querySelectorAll('visitor').length;
        showToast(`Import complete. All ${total} records replaced.`, 'success');
    }
    
    // --- Toast Notifications ---
    function showToast(message, type = 'info') { // types: info, success, error, warning
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100); // Animate in

        const closeBtn = toast.querySelector('.toast-close');
        const close = () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500); // Remove from DOM after animation
        };
        
        closeBtn.addEventListener('click', close);
        setTimeout(close, 5000);
    }

    // --- UTILITY ---
    function formatXml(xml) {
        let formatted = '';
        const reg = /(>)(<)(\/?[^>]+>)/g;
        xml = xml.replace(reg, '$1\r\n$2$3');
        let pad = 0;
        xml.split('\r\n').forEach(node => {
            let indent = 0;
            if (node.match( /.+<\/.+>/ )) {
                indent = 0;
            } else if (node.match( /^<\/.+/ )) {
                if (pad !== 0) {
                    pad -= 1;
                }
            } else if (node.match( /^<[^\/]/ )) {
                indent = 1;
            }

            let padding = '';
            for (let i = 0; i < pad; i++) {
                padding += '  ';
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        });

        return formatted;
    }
});
