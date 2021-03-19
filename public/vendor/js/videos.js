// declare functions
function formatNumber (num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// api url
const api_url = 'https://beta.winsvideo.net/api/video/recommended'

// Defining async function
async function getapi (url) {
  // Storing response
  const response = await fetch(url)

  // Storing data in form of JSON
  const data = await response.json()
  console.log(data.response)
  document.getElementById('loading').style.display = 'none'
  if (response) {
    hideloader()
  }
  show(data)
}
// Calling that async function
getapi(api_url)

// Function to hide the loader
function hideloader () {
  document.getElementById('loading').style.display = 'none'
}
// Function to define innerHTML for HTML table
function show (data) {

  let tab = ''

  // Loop to access all rows
  for (const r of data.response) {

              tab += `
                <div class="videoGridItem">
                    <a href="watch?v=${r.url}">
                        <div class="thumbnail">
                            <img src="https://videos.winsvideo.net/${r.filePath}">
                            <div class="duration">
                                <span>${r.duration}</span>
                            </div>
                        </div>
                    </a>
                    
                    <div class="details">
                        <a href="watch?v=${r.url}">
                            <h3 class="title">${r.title}</h3>
                        </a>
                        <a href="user/${r.uploadedBy}" class="username">${r.uploadedBy}</a>
                            <div class="stats">
                                <span class="viewCount">${formatNumber(r.views)} views - </span>
                                <span class="timeStamp">${r.uploadDate}</span>
                            </div>        
                        </div>
                    </div>` 

      
  }
  // Setting innerHTML as tab variable
  document.getElementById('videoGrid').innerHTML = tab
}
