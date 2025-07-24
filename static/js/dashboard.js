flatpickr("#datetimeRange", {
    mode: "range",
    enableTime: true,
    dateFormat: "d M, Y H:i",
    defaultHour: 12
  });

  function toggleTheme() {
    document.body.classList.toggle("dark-mode");
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main');
    if (window.innerWidth <= 576) {
      sidebar.classList.toggle('active');
    } else {
      sidebar.classList.toggle('shrunk');
      main.classList.toggle('shrunk');
    }
  }
  // Connect to backend Socket.IO server
const socket = io('http://0.0.0.0:5500');  // Adjust if deployed on a different IP/domain

socket.on('connect', () => {
  console.log('Connected to server');
});

// Listen for 'alert' events
socket.on('alert', (data) => {
  console.log("Alert received:", data);
  addRecentActivity(data.type, data.timestamp);
  updateCounts(data.type);
});


// Function to add alert to the Recent Activity box
function addRecentActivity(type, timestamp) {
  const iconMap = {
    'Accident': 'car-crash',
    'Fire': 'fire',
    'Smoke': 'smog',
    'Unknown': 'bolt'
  };

  const alertBox = document.querySelector('.activity-box .card-body');

  // Create alert div
  const alertEntry = document.createElement('div');
  alertEntry.classList.add('alert-entry');
  alertEntry.innerHTML = `<i class="fas fa-${iconMap[type] || 'bolt'} alert-icon"></i> ${type} - ${timestamp}`;

  // Insert at the top
  alertBox.prepend(alertEntry);

  // Optional: Limit to 5 items
  const alerts = alertBox.querySelectorAll('.alert-entry');
  if (alerts.length > 12) {
    alerts[alerts.length - 1].remove();
  }
}


// Initial counts
let counts = {
  'Accident': 0,
  'Fire': 0,
  'Smoke': 0
};

// Update UI counters
function updateCounts(type) {
  if (counts.hasOwnProperty(type)) {
    counts[type]++;
    if (type === 'Accident') {
      document.getElementById('crashCount').innerText = counts[type];
    } else if (type === 'Fire') {
      document.getElementById('fireCount').innerText = counts[type];
    } else if (type === 'Smoke') {
      document.getElementById('smokeCount').innerText = counts[type];
    }
  }
}


window.addEventListener('DOMContentLoaded', () => {
  const datetimeInput = document.getElementById("datetimeRange");

  if (datetimeInput) {
    const now = new Date();
    const formatted = now.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).replace(',', '');
    
    datetimeInput.value = formatted;
  }
});


function uploadVideo() {
  const formData = new FormData(document.getElementById('uploadForm'));

  fetch('/upload_video', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (response.ok) {
      alert('Video uploaded. Switching to selected file...');
      // Reload video iframe
      const iframe = document.querySelector('iframe');
      iframe.src = iframe.src;
    } else {
      alert('Failed to upload video.');
    }
  });
}
function startWebcam() {
  fetch('/start_webcam', {
      method: 'POST'
  }).then(res => {
      if (res.ok) {
        
          location.reload(); // reloads iframe to show webcam stream
      }
  }).catch(err => console.error("Error starting webcam:", err));
}