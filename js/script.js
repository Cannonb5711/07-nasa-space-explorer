// NASA API key (replace with your own if needed)
const apiKey = 'soGgT6Nqcckyu2lshO7mW4nv5xZspzSj6VZoKWbv';

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// This function fetches images from NASA's APOD API
function fetchNasaImages(startDate, endDate) {
  // Build the API URL using template literals
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  // Show a loading message
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading images...</p></div>`;

  // Fetch data from NASA's API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      gallery.innerHTML = '';
      let openCard = null;

      if (Array.isArray(data)) {
        data.forEach(item => {
          // Create a div for each entry
          const div = document.createElement('div');
          div.className = 'gallery-item';
          div.tabIndex = 0; // Make the card focusable

          // Prepare the title HTML
          const titleHTML = `<p><strong>${item.title}</strong></p>`;

          // Prepare the details HTML (date and explanation)
          const detailsHTML = `
            <div class="card-details" style="display:none;">
              <p>${item.date}</p>
              <p>${item.explanation}</p>
            </div>
          `;

          // If it's an image, show the image
          if (item.media_type === 'image') {
            div.innerHTML = `
              <img src="${item.url}" alt="${item.title}" />
              ${titleHTML}
              ${detailsHTML}
            `;
          }
          // If it's a video, embed or link to the video
          else if (item.media_type === 'video') {
            // Check if it's a YouTube video and embed it
            let videoEmbed = '';
            if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
              // Extract YouTube video ID
              let videoId = '';
              if (item.url.includes('youtube.com')) {
                const urlParams = new URL(item.url).searchParams;
                videoId = urlParams.get('v');
              } else if (item.url.includes('youtu.be')) {
                videoId = item.url.split('/').pop();
              }
              if (videoId) {
                videoEmbed = `
                  <div class="video-container">
                    <iframe width="100%" height="210" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                  </div>
                `;
              }
            }
            // If not YouTube, just show a clickable link
            if (!videoEmbed) {
              videoEmbed = `
                <a href="${item.url}" target="_blank" class="video-link">
                  <div style="width:100%;height:210px;display:flex;align-items:center;justify-content:center;background:#e6e6e6;border-radius:8px;">
                    <span style="font-size:2rem;">🎬</span>
                  </div>
                  <span style="display:block;text-align:center;margin-top:8px;">Watch Video</span>
                </a>
              `;
            }
            div.innerHTML = `
              ${videoEmbed}
              ${titleHTML}
              ${detailsHTML}
            `;
          } else {
            // Skip unknown media types
            return;
          }

          // Add a click event to show/hide the text and focus the card
          div.addEventListener('click', function (event) {
            event.stopPropagation();
            if (openCard === div) {
              const details = div.querySelector('.card-details');
              details.style.display = 'none';
              openCard = null;
              return;
            }
            if (openCard) {
              const prevDetails = openCard.querySelector('.card-details');
              if (prevDetails) prevDetails.style.display = 'none';
            }
            const details = div.querySelector('.card-details');
            details.style.display = 'block';
            div.focus();
            openCard = div;
          });

          gallery.appendChild(div);
        });

        // Close open card if clicking anywhere else on the page
        document.addEventListener('click', function (event) {
          if (openCard && !openCard.contains(event.target)) {
            const details = openCard.querySelector('.card-details');
            if (details) details.style.display = 'none';
            openCard = null;
          }
        });

        if (gallery.innerHTML === '') {
          gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🛰️</div><p>No images found for this date range.</p></div>`;
        }
      } else {
        gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">❗</div><p>Could not load images. Please try a different date range.</p></div>`;
      }
    })
    .catch(error => {
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">❗</div><p>Error loading images. Please check your internet connection.</p></div>`;
    });
}

// When the button is clicked, get the dates and fetch images
button.addEventListener('click', () => {
  // Get the values from the date inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Check if both dates are selected
  if (!startDate || !endDate) {
    gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">📅</div><p>Please select both a start and end date.</p></div>`;
    return;
  }

  // Call the function to fetch images
  fetchNasaImages(startDate, endDate);
});
