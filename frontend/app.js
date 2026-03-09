const API_URL = 'http://localhost:5000/api';

let currentView = 'upload';
let analysisMode = 'general';
let selectedSubject = '';
let fileContent = '';

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    const yearInput = document.getElementById('year');
    if (yearInput) {
        yearInput.value = new Date().getFullYear();
    }
});

function initializeEventListeners() {
    document.getElementById('uploadBtn').addEventListener('click', () => switchView('upload'));
    document.getElementById('analysisBtn').addEventListener('click', () => switchView('analysis'));

    document.getElementById('generalModeBtn').addEventListener('click', () => setAnalysisMode('general'));
    document.getElementById('teacherModeBtn').addEventListener('click', () => setAnalysisMode('teacher'));

    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');

    fileUploadArea.addEventListener('click', () => fileInput.click());

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#94a3b8';
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.style.borderColor = '#cbd5e1';
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#cbd5e1';
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);

    document.getElementById('subjectSelect').addEventListener('change', (e) => {
        selectedSubject = e.target.value;
        if (selectedSubject) {
            loadAnalysisData();
        }
    });
}

function switchView(view) {
    currentView = view;

    const uploadSection = document.getElementById('uploadSection');
    const analysisSection = document.getElementById('analysisSection');
    const uploadBtn = document.getElementById('uploadBtn');
    const analysisBtn = document.getElementById('analysisBtn');

    if (view === 'upload') {
        uploadSection.style.display = 'block';
        analysisSection.style.display = 'none';
        uploadBtn.classList.add('active');
        uploadBtn.classList.remove('btn-secondary');
        uploadBtn.classList.add('btn-primary');
        analysisBtn.classList.remove('active');
        analysisBtn.classList.remove('btn-primary');
        analysisBtn.classList.add('btn-secondary');
    } else {
        uploadSection.style.display = 'none';
        analysisSection.style.display = 'block';
        analysisBtn.classList.add('active');
        analysisBtn.classList.remove('btn-secondary');
        analysisBtn.classList.add('btn-primary');
        uploadBtn.classList.remove('active');
        uploadBtn.classList.remove('btn-primary');
        uploadBtn.classList.add('btn-secondary');

        loadSubjects();
        updatePaperCount();
    }
}

function setAnalysisMode(mode) {
    analysisMode = mode;

    const generalBtn = document.getElementById('generalModeBtn');
    const teacherBtn = document.getElementById('teacherModeBtn');
    const chartTitle = document.getElementById('chartTitle');

    if (mode === 'general') {
        generalBtn.classList.add('btn-primary');
        generalBtn.classList.remove('btn-secondary');
        teacherBtn.classList.remove('btn-primary');
        teacherBtn.classList.add('btn-secondary');
        chartTitle.textContent = 'Topic Trends';
    } else {
        teacherBtn.classList.add('btn-primary');
        teacherBtn.classList.remove('btn-secondary');
        generalBtn.classList.remove('btn-primary');
        generalBtn.classList.add('btn-secondary');
        chartTitle.textContent = 'Teacher Comparison';
    }

    if (selectedSubject) {
        loadAnalysisData();
    }
}

async function handleFileSelect(file) {
    if (file.type !== 'text/plain') {
        showError('Please upload a text file (.txt)');
        return;
    }

    try {
        const content = await file.text();
        fileContent = content;

        const fileUploadContent = document.getElementById('fileUploadContent');
        fileUploadContent.innerHTML = `
            <div class="file-selected">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>${file.name}</span>
                <button type="button" class="remove-file" onclick="removeFile(event)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;

        hideError();
    } catch (error) {
        showError('Error reading file');
    }
}

function removeFile(event) {
    event.stopPropagation();
    fileContent = '';
    document.getElementById('fileInput').value = '';

    document.getElementById('fileUploadContent').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>Click to upload or drag and drop</p>
        <p class="small-text">Text files only (.txt)</p>
    `;
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!fileContent) {
        showError('Please upload a file');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        <span>Uploading...</span>
    `;

    const formData = {
        title: document.getElementById('title').value,
        subject: document.getElementById('subject').value,
        year: parseInt(document.getElementById('year').value),
        teacherName: document.getElementById('teacherName').value || null,
        fileContent: fileContent
    };

    try {
        const response = await fetch(`${API_URL}/papers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to upload paper');
        }

        document.getElementById('uploadForm').reset();
        document.getElementById('year').value = new Date().getFullYear();
        fileContent = '';
        removeFile({ stopPropagation: () => {} });
        hideError();

        showSuccess('Paper uploaded successfully!');

    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Upload Paper</span>
        `;
    }
}

async function loadSubjects() {
    try {
        const response = await fetch(`${API_URL}/subjects`);
        const subjects = await response.json();

        const subjectSelect = document.getElementById('subjectSelect');
        subjectSelect.innerHTML = '<option value="">Select a subject</option>';

        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });

        if (subjects.length > 0) {
            selectedSubject = subjects[0];
            subjectSelect.value = selectedSubject;
            loadAnalysisData();
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

async function updatePaperCount() {
    try {
        const response = await fetch(`${API_URL}/papers`);
        const papers = await response.json();
        document.getElementById('paperCount').textContent = `${papers.length} papers uploaded`;
    } catch (error) {
        console.error('Error loading paper count:', error);
    }
}

async function loadAnalysisData() {
    if (!selectedSubject) return;

    const loadingSpinner = document.getElementById('loadingSpinner');
    const chartContainer = document.getElementById('chartContainer');
    const noDataMessage = document.getElementById('noDataMessage');

    loadingSpinner.style.display = 'flex';
    chartContainer.style.display = 'none';
    noDataMessage.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/analysis/${analysisMode}?subject=${encodeURIComponent(selectedSubject)}`);
        const data = await response.json();

        if (data.topics.length === 0) {
            loadingSpinner.style.display = 'none';
            noDataMessage.style.display = 'block';
            return;
        }

        renderHeatmap(data);

        loadingSpinner.style.display = 'none';
        chartContainer.style.display = 'block';

    } catch (error) {
        console.error('Error loading analysis data:', error);
        loadingSpinner.style.display = 'none';
        noDataMessage.style.display = 'block';
    }
}

function renderHeatmap(data) {
    const { topics, years, teachers, values } = data;
    const dimensions = analysisMode === 'teacher' ? teachers : years;

    const maxValue = Math.max(...values.flat());

    const getCellClass = (value) => {
        if (value === 0) return 'cell-0';
        const intensity = Math.min(value / maxValue, 1);
        if (intensity < 0.2) return 'cell-1';
        if (intensity < 0.4) return 'cell-2';
        if (intensity < 0.6) return 'cell-3';
        if (intensity < 0.8) return 'cell-4';
        return 'cell-5';
    };

    let tableHTML = '<table class="heatmap-table"><thead><tr><th>Topics</th>';

    dimensions.forEach(dim => {
        tableHTML += `<th>${dim}</th>`;
    });

    tableHTML += '</tr></thead><tbody>';

    topics.forEach((topic, rowIndex) => {
        tableHTML += `<tr><td>${topic}</td>`;

        values[rowIndex].forEach((value, colIndex) => {
            const cellClass = getCellClass(value);
            const displayValue = value > 0 ? value : '-';
            tableHTML += `<td class="${cellClass}" title="${topic} (${dimensions[colIndex]}): ${value} marks">${displayValue}</td>`;
        });

        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';

    document.getElementById('heatmapChart').innerHTML = tableHTML;
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

function showSuccess(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.background = '#f0fdf4';
    errorMessage.style.borderColor = '#bbf7d0';
    errorMessage.style.color = '#15803d';

    setTimeout(() => {
        errorMessage.style.display = 'none';
        errorMessage.style.background = '#fef2f2';
        errorMessage.style.borderColor = '#fecaca';
        errorMessage.style.color = '#b91c1c';
    }, 3000);
}
