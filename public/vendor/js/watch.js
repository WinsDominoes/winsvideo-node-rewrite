// declare functions
function formatNumber (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  init();
  function init() {
      fetchVideo()
    }

    function fetchVideo() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        // declare some variables
        const v = urlParams.get('v');

        $.getJSON('https://beta.winsvideo.net/api/video/'+v+'', function(data) {
                let id = data["response"][0]["id"];
                let uploadedBy = data["response"][0]["uploadedBy"];
                let title = data["response"][0]["title"];
                let description = data["response"][0]["description"];
                // who tf cares about categories
                let filePath = data["response"][0]["filePath"];

                let videoPlayerSource = document.querySelector('#videoPlayerSource');
                if (videoPlayerSource) {
                    videoPlayerSource.setAttribute('src', 'https://videos.winsvideo.net/' + filePath);
                }

                document.getElementById('title').innerText = title;
                document.getElementById('description').innerText = description;
                document.getElementById('uploadedBy').innerText = "By: " + uploadedBy;
        });
    }