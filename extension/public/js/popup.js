$(document).ready(function() {
  setTimeout(() => {
    $('#saving').hide()
    $('#saved').show()
// This callback function is never called, so no response is returned. 
// But I can see message's sent successfully to event page from logs.
chrome.runtime.sendMessage({from: 'popup', method:'ping'},
  function(response) {
  console.log(response)
});


postMessage("The user is 'bob' and the password is 'secret'",
                  "*");


  }, 500);
})


