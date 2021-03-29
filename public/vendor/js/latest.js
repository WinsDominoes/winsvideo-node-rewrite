// declare functions
function formatNumber2 (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
  
  // api url
  const latest_api_url = 'http://localhost:3000/api/video/latest'
  
  // Defining async function
  async function getapi2 (url) {
    // Storing response
    const latest_response = await fetch(url)
  
    // Storing data in form of JSON
    const latest_data = await latest_response.json()
    console.log(latest_data.response)
    document.getElementById('loading').style.display = 'none'
    if (latest_response) {
      hideloader2()
    }
    show2(latest_data)
  }
  // Calling that async function
  getapi2(latest_api_url)
  
  // Function to hide the loader
  function hideloader2 () {
    document.getElementById('loading2').style.display = 'none'
  }
  // Function to define innerHTML for HTML table
  function show2 (data) {
  
    let tab2 = ''
  
    // Loop to access all rows
    for (const r2 of data.response) {
  
                tab2 += `
                  <div class="videoGridItem">
                      <a href="watch?v=${r2.url}">
                          <div class="thumbnail">
                              <img src="https://videos.winsvideo.net/${r2.filePath}">
                              <div class="duration">
                                  <span>${r2.duration}</span>
                              </div>
                          </div>
                      </a>
                      
                      <div class="details">
                          <a href="watch?v=${r2.url}">
                              <h3 class="title">${r2.title}</h3>
                          </a>
                          <a href="user/${r2.uploadedBy}" class="username">${r2.uploadedBy}</a>
                              <div class="stats">
                                  <span class="viewCount">${formatNumber2(r2.views)} views - </span>
                                  <span class="timeStamp">${r2.uploadDate}</span>
                              </div>        
                          </div>
                      </div>` 
  
        
    }
    // Setting innerHTML as tab variable
    document.getElementById('videoGridLatest').innerHTML = tab2
  }
  