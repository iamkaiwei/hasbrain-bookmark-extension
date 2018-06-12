let profile = {}

function updateProfile (data) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(['bookmark_profile', 'bookmark_token'], function(items) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items);
      }
    })
  }).then(result => {
    if (!result) {
      return
    }
    const {bookmark_token = '', bookmark_profile = '{}'} = result
    profile = JSON.parse(bookmark_profile)
    const {id = ''} = profile
    if (!id) return
    return axios.put(
      `https://userkit-identity.mstage.io/v1/profiles/${id}`,
      JSON.stringify(data),
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
    const {hideRecommend = false, highlight_whitelist = []} = respond.data
    chrome.storage.sync.set({
      'bookmark_profile': JSON.stringify({...profile, hideRecommend, highlight_whitelist})
    })
  })
}

function renderUserInfo () {
  const {name = '', account_email = '', hideRecommend = false, highlight_whitelist = []} = profile
  accountName = name
  accountEmail = account_email
  const logout = $(`<button>Logout</button>`)
  $('#user__logged').html('')
  $(logout).click(() => {
    profile = {}
    chrome.storage.sync.remove(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token'])
    $('#user__logged').html('')
    const login = $(`<button>Click here to login</button>`)
    $(login).click(() => window.open(`http://hasbrain.surge.sh/#/?extensionId=${chrome.runtime.id}`))
    $(login).appendTo($('#user__logged'))
  })
  $('#user__logged').append(`
    ${accountEmail}
  `)
  $('#user__logged').append('( ')
  $(logout).appendTo($('#user__logged'))
  $('#user__logged').append(' )')
  
  // set value checked or unchecked for checkbox recommend
  $('#recommend_checkbox').checkbox(`set ${hideRecommend ? 'unchecked' : 'checked'}`);

  // set value checked or unchecked for checkbox homepage
  chrome.storage.sync.get(['bookmark_hide_newtab'], result => {
    $('#newtab_checkbox').checkbox(`set ${result.bookmark_hide_newtab ? 'unchecked' : 'checked'}`);  
  })


  $('#highlight').importTags(highlight_whitelist.join(','))
}

function _handleUpdateTags () {
  updateProfile({
    highlight_whitelist: $('#highlight').val().length ? $('#highlight').val().split(',') : []
  })
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
  })
  $('#recommend_checkbox').checkbox({
    onChecked: function () {
      updateProfile({hideRecommend: false})
    },
    onUnchecked: function () {
      updateProfile({hideRecommend: true})
    }
  })

  $('#newtab_checkbox').checkbox({
    onChecked: function () {
      chrome.storage.sync.set({
        'bookmark_hide_newtab': false
      })
    },
    onUnchecked: function () {
      chrome.storage.sync.set({
        'bookmark_hide_newtab': true
      })
    }
  })

  $('#highlight').tagsInput({
    'onAddTag': _handleUpdateTags,
    'onRemoveTag': _handleUpdateTags
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