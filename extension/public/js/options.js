$(document).ready(function() {
  let accountName = ''
  let accountEmail = ''
  chrome.storage.sync.get('bookmark_profile', result => {
    const login = $(`<button>Click here to login</button>`)
    $(login).click(() => window.open(`http://hasbrain.surge.sh/#/?extensionId=${chrome.runtime.id}`))
    if (!result || !result.bookmark_profile) {
      $(login).appendTo($('#user__logged'))
      return
    }
    const profile = JSON.parse(result.bookmark_profile)
    accountName = profile.name
    accountEmail = profile.account_email
    const logout = $(`<button>Logout</button>`)
    $(logout).click(() => {
      chrome.storage.sync.remove(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token'])
      $('#user__logged').html('')
      $(login).appendTo($('#user__logged'))
    })
    $('#user__logged').append(`
      ${accountEmail}
    `)
    $('#user__logged').append('( ')
    $(logout).appendTo($('#user__logged'))
    $('#user__logged').append(' )')
  })
})