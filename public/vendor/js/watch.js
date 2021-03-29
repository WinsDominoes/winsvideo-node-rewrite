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


            $.ajax({
                type: "GET",
                url: "http://localhost:3000/api/video/"+v+"",
                contentType: "application/json",
                dataType: 'json',
                async: false, 
                success: function(data) {
                    let id = data["response"][0]["id"];
                    let uploadedBy = data["response"][0]["uploadedBy"];
                    let title = data["response"][0]["title"];
                    let description = data["response"][0]["description"];
                    // who tf cares about categories
                    let filePath = data["response"][0]["filePath"];

                    $("#videoPlayerSource").attr("src", "https://videos.winsvideo.net/" + filePath);
                    
                    $("#title").text(title);
                    $("#description").text(description);
                    $("#uploadedBy").text(uploadedBy);
                }         
            })
    }

   