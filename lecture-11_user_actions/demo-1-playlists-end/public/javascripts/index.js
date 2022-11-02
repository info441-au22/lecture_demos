//TODO: Fill in actions

function addUSer(){
    // need to get the name someone typed in from the username
    let name = document.getElementById("name_input").value 

    await fetch("/api/v1/users", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: name})
    })
}