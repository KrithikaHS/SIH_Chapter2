fetch('/data')
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById('image-gallery');
    
    data.forEach(row => {
      const imageItem = document.createElement('div');
      imageItem.classList.add('image-item');

      if (row.placeimg) {
        const img = document.createElement('img');
        img.src = row.placeimg;
        img.alt = `${row.placename} Image`;
        img.style.maxWidth = '100%';
        imageItem.appendChild(img);
      }

      const imageName = document.createElement('div');
      imageName.classList.add('image-name');
      imageName.textContent = row.placename;
      imageItem.appendChild(imageName);

      const imageDesc = document.createElement('div');
      imageDesc.classList.add('image-desc');
      imageDesc.textContent = row.placedesc;
      imageItem.appendChild(imageDesc);

      const addButton = document.createElement('button');
      addButton.textContent = 'Add';
      addButton.style.marginTop = '10px';
      addButton.classList.add('add-button');

      addButton.style.backgroundColor = 'green';
      addButton.style.color = 'white';

      imageItem.appendChild(addButton);

      // Toggle button text and send data to server on click
      addButton.addEventListener('click', () => {
        if (addButton.textContent === 'Add') {
          addButton.textContent = 'Added!';
          addButton.style.backgroundColor = 'gray';
          addButton.style.color = 'white';
      
          // Send POST request to add data to database
          fetch('/add-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              placename: row.placename,
              placeloc: row.placeloc,      // Location fetched from DB
              budget: row.budget || 0,     // Budget (use 0 if undefined)
              hours: row.hours || 0        // Hours (use 0 if undefined)
            })
          })
          .then(response => response.json())
          .then(result => {
            console.log('Data added:', result);
          })
          .catch(error => {
            console.error('Error adding data:', error);
          });
        } 
  
      });

      gallery.appendChild(imageItem);
    });
  })
  .catch(error => console.error('Error fetching data:', error));

// display selected item
function fetchData() {
  fetch('/added-places') // Update this URL based on your server setup
    .then(response => response.json())
    .then(data => {
      const gallery = document.getElementById('addedplace');
      gallery.innerHTML = ''; // Clear existing content

      data.forEach(row => {
        const imageItem = document.createElement('div');
        imageItem.classList.add('image-item');

        // Add place name
        const imageName = document.createElement('div');
        imageName.classList.add('image-name');
        imageName.textContent = `Place: ${row.placename}`;
        imageItem.appendChild(imageName);

        // Add place budget
        const imageBudget = document.createElement('div');
        imageBudget.classList.add('image-budget');
        imageBudget.textContent = `Budget: ${row.budget}`;
        imageItem.appendChild(imageBudget);

        // Add description if available
       
        // Add a remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.style.marginTop = '10px';
        removeButton.classList.add('remove-button');
        removeButton.style.backgroundColor = 'red';
        removeButton.style.color = 'white';

        removeButton.addEventListener('click', () => {
          // Send POST request to remove data from the database
          fetch('/remove-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ placeid: row.placeid }) // Make sure this matches the correct field name in your database
          })
            .then(response => response.json())
            .then(result => {
              console.log('Data removed:', result);
              fetchData(); // Refresh the list
            })
            .catch(error => {
              console.error('Error removing data:', error);
            });
        });

        imageItem.appendChild(removeButton);
        gallery.appendChild(imageItem);
      });
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Initial fetch when the page loads
fetchData();
