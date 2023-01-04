
// so this demo is going to demo url requests

const express = require('express')
const app = express()


app.get('*', (req, res) => {

    res.send('You requested this url: ' + req.url + '</br>' +
    'You requested this query parameter: ' + req.query.name + '</br>' +
    'You requested this req.path: ' + req.path + '</br>'
    )

})

/**
 * To summarize:
 *   req.url returns everything after the / in a given request (path + query parameter)
 *   req.query.[parameter name] returns the value associated with the matching [parameter name]
 *   req.path returns the path
 */

app.listen(3000, () => {
    console.log('example app running on port 3000')
})