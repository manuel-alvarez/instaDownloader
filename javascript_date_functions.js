
function datePrefix(givenDate) {
    var year = String(givenDate.getFullYear())
    var month = String(givenDate.getMonth() + 1).padStart(2, "0")
    var days = String(givenDate.getDate()).padStart(2, "0")
  
    return `${year}${month}${days}_`
}

function subDays(numDays) {
  var d1 = new Date()
  var d2 = new Date()

  d2.setDate(d1.getDate() - numDays)
  return datePrefix(d2)
}

function autoDate() {
    var days = 0
    var weekParts = document.getElementsByTagName('time')[0].innerText.split("w")
    if (weekParts.length > 1) {
        days = 7 * weekParts[0]
    } else {
        var daysParts = document.getElementsByTagName('time')[0].innerText.split("d")
        days = daysParts[0]
    }
    return subDays(days)
}

function getMedia(type, mediaType, index) {
    var mediaString
    var mediaSrc
    if (type == 'story') {
        if (mediaType == 'video') {
            mediaString = "section.szopg div div video source"
        } else {
            mediaString = "section.szopg div div div div img"
        }
    } else {
        if (mediaType == 'video') {
            mediaString = "article[role=presentation] div div div div ul div div div video"
        } else {
            mediaString = "article[role=presentation] div div div div ul div div div img"
        }
        var imageList = document.querySelectorAll(mediaString)
        if (imageList.length > 0) {
            if (index == undefined) {
                console.warn('There is a list of images. Please write the index of the image you want to download')
                return
            } else {
                mediaSrc = document.querySelectorAll(mediaString)[index].getAttribute('src')
            }
        } else {
            if (mediaType == 'video') {
                mediaString = "article[role=presentation] div div div div video"
            } else {
                mediaString = "article[role=presentation] div div div div img"
            }
        }
    }

    try {
        mediaSrc = document.querySelector(mediaString).getAttribute('srcset').split(',http')[0]
    } catch {
        mediaSrc = (mediaSrc != undefined)? mediaSrc: document.querySelector(mediaString).getAttribute('src')
    }
    var pattern = /(.+)\/([^\/].*\.(jpg|mp4))(.*)/g
    var mediaParts = new Array()
    let partial
    //imagen.matchAll(pattern).foreach(function(x) {mediaParts = mediaParts + x})
    while ((partial = pattern.exec(mediaSrc)) !== null) {
        mediaParts = mediaParts.concat(partial)
    }

    return mediaParts
}

function getDatePrefix(type) {
    var stampString
    if (type == 'story') {
        stampString = "div time"
    } else {
        stampString = "article[role=presentation] div a > time"
    }
    var stamp = new Date(document.querySelector(stampString).getAttribute('datetime'))
    var prefix = datePrefix(stamp)
    return prefix
}

function download(mediaParts) {
    var reader = new FileReader()

    var element = document.createElement('a')
    element.setAttribute('download', `${mediaParts[5]}${mediaParts[2]}`)
    element.style.display = 'none'

    fetch(mediaParts[0])
        .then(function(response) {
            response.blob()
                .then(function(data) {
                    reader.readAsDataURL(data);
                    reader.onloadend = function() {
                        var base64data = reader.result;

                        element.setAttribute('href', base64data)
                    
                        document.body.appendChild(element)                        
                        element.click()
                        document.body.removeChild(element)
                    }
                })
        })
}

function downloadMedia(type, mediaType, index) {
    var mediaParts = getMedia(type, mediaType, index)
    if (mediaParts != undefined && mediaParts.length > 0) {
        mediaParts.push(getDatePrefix(type))
        download(mediaParts)
    }
}
