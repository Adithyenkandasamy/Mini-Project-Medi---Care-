// Chat functionality for MediGuide AI

let chatHistory = [];
let isTyping = false;

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
    initializeChatForm();
    initializeQuickActions();
});

// Load chat history from server
async function loadChatHistory() {
    try {
        const response = await fetch('/api/chat_history');
        const history = await response.json();
        
        chatHistory = history;
        displayChatHistory();
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Display chat history in the UI
function displayChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    
    // Keep welcome message, add history after it
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    
    chatHistory.forEach(chat => {
        addMessageToUI(chat.message, 'user', chat.timestamp);
        addMessageToUI(chat.response, 'bot', chat.timestamp, chat.severity_score);
    });
    
    scrollToBottom();
}

// Initialize chat form
function initializeChatForm() {
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    
    chatForm.addEventListener('submit', handleMessageSubmit);
    
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Submit on Enter (but not Shift+Enter)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });
}

// Handle message submission
async function handleMessageSubmit(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || isTyping) return;
    
    // Add user message to UI
    addMessageToUI(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await fetch('/api/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add bot response to UI
            addMessageToUI(data.response, 'bot', null, data.severity_score);
            
            // Show hospitals if recommended
            if (data.hospitals && data.hospitals.length > 0) {
                displayHospitals(data.hospitals);
            }
            
            // Update chat history
            chatHistory.push({
                message: message,
                response: data.response,
                severity_score: data.severity_score,
                timestamp: new Date().toISOString()
            });
        } else {
            hideTypingIndicator();
            addMessageToUI('Sorry, I encountered an error. Please try again.', 'bot');
        }
    } catch (error) {
        hideTypingIndicator();
        addMessageToUI('Sorry, I encountered a network error. Please check your connection and try again.', 'bot');
        console.error('Error sending message:', error);
    }
}

// Add message to UI
function addMessageToUI(message, sender, timestamp = null, severityScore = null) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    
    messageElement.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Format message content
    let formattedMessage = message.replace(/\n/g, '<br>');
    
    // Add severity indicator for bot messages
    if (sender === 'bot' && severityScore !== null) {
        const severityClass = getSeverityClass(severityScore);
        const severityText = getSeverityText(severityScore);
        
        formattedMessage += `
            <div class="severity-indicator ${severityClass}">
                <i class="fas fa-thermometer-${severityScore >= 70 ? 'full' : severityScore >= 40 ? 'half' : 'quarter'}"></i>
                Severity: ${severityScore}/100 - ${severityText}
            </div>
        `;
    }
    
    content.innerHTML = formattedMessage;
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(content);
    
    // Add timestamp if provided
    if (timestamp) {
        const timeElement = document.createElement('div');
        timeElement.className = 'message-timestamp';
        timeElement.textContent = formatTimestamp(timestamp);
        content.appendChild(timeElement);
    }
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    isTyping = true;
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'block';
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'none';
}

// Scroll to bottom of chat
function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Get severity class for styling
function getSeverityClass(score) {
    if (score >= 70) return 'severity-high';
    if (score >= 40) return 'severity-medium';
    return 'severity-low';
}

// Get severity text description
function getSeverityText(score) {
    if (score >= 70) return 'High - Seek immediate medical attention';
    if (score >= 40) return 'Medium - Consider seeing a doctor';
    return 'Low - Monitor symptoms';
}

// Display hospitals in sidebar
function displayHospitals(hospitals) {
    const hospitalResults = document.getElementById('hospitalResults');
    const hospitalList = document.getElementById('hospitalList');
    
    hospitalList.innerHTML = '';
    
    hospitals.forEach(hospital => {
        const hospitalCard = createHospitalCard(hospital);
        hospitalList.appendChild(hospitalCard);
    });
    
    hospitalResults.style.display = 'block';
}

// Create hospital card element
function createHospitalCard(hospital) {
    const card = document.createElement('div');
    card.className = 'hospital-card';
    
    const statusIcon = hospital.is_open === true ? 
        '<i class="fas fa-circle" style="color: #28a745;"></i> Open' :
        hospital.is_open === false ?
        '<i class="fas fa-circle" style="color: #dc3545;"></i> Closed' :
        '<i class="fas fa-circle" style="color: #ffc107;"></i> Unknown';
    
    card.innerHTML = `
        <div class="hospital-header">
            <div>
                <div class="hospital-name">${hospital.name}</div>
                <div class="hospital-rating">
                    <i class="fas fa-star"></i>
                    ${hospital.rating || 'N/A'}
                </div>
            </div>
            <div class="hospital-status">${statusIcon}</div>
        </div>
        <div class="hospital-info">
            <div><i class="fas fa-map-marker-alt"></i> ${hospital.address}</div>
            <div><i class="fas fa-route"></i> ${hospital.distance} km away</div>
            ${hospital.phone ? `<div><i class="fas fa-phone"></i> ${hospital.phone}</div>` : ''}
        </div>
        <div class="hospital-actions">
            ${hospital.phone ? `<button class="hospital-btn btn-call" onclick="callHospital('${hospital.phone}')">
                <i class="fas fa-phone"></i> Call
            </button>` : ''}
            <button class="hospital-btn btn-directions" onclick="getDirections('${hospital.address}')">
                <i class="fas fa-directions"></i> Directions
            </button>
            ${hospital.website ? `<button class="hospital-btn btn-website" onclick="visitWebsite('${hospital.website}')">
                <i class="fas fa-globe"></i> Website
            </button>` : ''}
        </div>
    `;
    
    return card;
}

// Initialize quick actions
function initializeQuickActions() {
    // File upload modal functionality
    const uploadModal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFileUpload);
    }
}

// Quick action functions
function findHospitals() {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = 'I need to find nearby hospitals';
    document.getElementById('chatForm').dispatchEvent(new Event('submit'));
}

function uploadDocument() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = 'block';
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = 'none';
}

function viewProfile() {
    window.location.href = '/profile';
}

// Handle file upload
async function handleFileUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    showLoading(submitButton);
    
    try {
        const response = await fetch('/api/upload_document', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Document uploaded successfully!', 'success');
            closeUploadModal();
            e.target.reset();
        } else {
            showNotification(result.message || 'Upload failed', 'error');
        }
    } catch (error) {
        showNotification('Upload failed. Please try again.', 'error');
        console.error('Upload error:', error);
    } finally {
        hideLoading(submitButton, originalText);
    }
}

// Hospital action functions
function callHospital(phone) {
    window.location.href = `tel:${phone}`;
}

function getDirections(address) {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
}

function visitWebsite(website) {
    window.open(website, '_blank');
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('uploadModal');
    if (e.target === modal) {
        closeUploadModal();
    }
});

// Format timestamp helper
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

// Loading and notification helpers
function showLoading(button) {
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    button.disabled = true;
}

function hideLoading(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}
