const fs = require('fs').promises

const songLyrics = async () => {
    let files = await fs.readdir('song_lyrics')
    console.log(files)

    // fs.readFile takes relative path
    let selectedFile = await fs.readFile('song_lyrics/' + files[0])
    console.log(selectedFile)

    let actualLyrics = selectedFile.toString()
    console.log(actualLyrics)
}

songLyrics();