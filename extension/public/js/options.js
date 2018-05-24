let profile = {}
function hideRecommend (hide = false) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(['bookmark_profile', 'bookmark_token'], function(items) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items);
      }
    })
  }).then(result => {
    console.log(result)
    if (!result) {
      return
    }
    const {bookmark_token = '', bookmark_profile = '{}'} = result
    profile = JSON.parse(bookmark_profile)
    const {id = ''} = profile
    if (!id) return
    return axios.put(
      `https://userkit-identity.mstage.io/v1/profiles/${id}`,
      JSON.stringify({
        hideRecommend: hide
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-USERKIT-TOKEN': bookmark_token
        }
      }
    )
  }).then(respond => {
    if (!profile.id || respond.status !== 200) {
      return
    }
    const {hideRecommend = false} = respond.data
    chrome.storage.sync.set({
      'bookmark_profile': JSON.stringify({...profile, hideRecommend})
    })
  })
}

function renderUserInfo () {
  const {name = '', account_email = '', hideRecommend = false} = profile
  accountName = name
  accountEmail = account_email
  const logout = $(`<button>Logout</button>`)
  $('#user__logged').html('')
  $(logout).click(() => {
    profile = {}
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
  $('#recommend_checkbox').checkbox(`set ${hideRecommend ? 'unchecked' : 'checked'}`);
}

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
    profile = JSON.parse(result.bookmark_profile)
    renderUserInfo()
    // const {name = '', account_email = '', hideRecommend = false} = profile
    // accountName = name
    // accountEmail = account_email
    // const logout = $(`<button>Logout</button>`)
    // $(logout).click(() => {
    //   profile = {}
    //   chrome.storage.sync.remove(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token'])
    //   $('#user__logged').html('')
    //   $(login).appendTo($('#user__logged'))
    // })
    // $('#user__logged').append(`
    //   ${accountEmail}
    // `)
    // $('#user__logged').append('( ')
    // $(logout).appendTo($('#user__logged'))
    // $('#user__logged').append(' )')
    // $('#recommend_checkbox').checkbox(`set ${hideRecommend ? 'unchecked' : 'checked'}`);
  })
  $('#recommend_checkbox').checkbox({
    onChecked: function () {
      hideRecommend()
    },
    onUnchecked: function () {
      hideRecommend(true)
    }
  })
})

chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {
    console.log(request)
    var action = request.action
    var source = request.source || {}
    if (action === "sign-in") {
      profile = source.data.profiles[0]
      renderUserInfo()
    }
  }
);