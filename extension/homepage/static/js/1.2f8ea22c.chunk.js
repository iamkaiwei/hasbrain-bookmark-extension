webpackJsonp([1],{920:function(e,t,n){"use strict";function r(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==typeof t&&"function"!==typeof t?e:t}function i(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),n.d(t,"default",function(){return b});var c,s,l=n(0),u=n.n(l),d=n(923),m=n(90),f=n(89),p=n(922),g=n(228),k=(n.n(g),n(144)),v=n.n(k),h=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),b=(c=Object(m.b)(function(e){return{profile:e.profile,sources:e.common.sources}}))(s=function(e){function t(){var e,n,i,c;a(this,t);for(var s=arguments.length,l=Array(s),u=0;u<s;u++)l[u]=arguments[u];return n=i=o(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(l))),i.state={loadingArticles:!0,showLoadMore:!1,stopLoadingMore:!1,limit:20,skip:0,articles:[],loadingId:""},i.loadMore=function(){i.state.loadingArticles||i.state.stopLoadingMore||i.setState({skip:i.state.skip+i.state.limit,loadingArticles:!0},i.getArticles)},i.getArticles=function(){var e=i.state,t=e.limit,n=e.skip,a=i.props.match.params.sourceId;Object(p.d)({limit:t,skip:n,sourceName:a}).then(function(e){if(i.setState({loadingArticles:!1}),e&&!e.errors){var t=e.data,n=t.count,a=t.hits,o=a.map(function(e){return Object.assign({_id:e._id,isBookmark:!1},e._source)})||[],c=[].concat(r(i.state.articles),r(o)),s=!0,l=!1;c.length!==n&&0!==a.length||(l=!0,s=!1),i.setState({articles:c,stopLoadingMore:l,showLoadMore:s})}},function(e){console.log("error",e),i.setState({loadingArticles:!1,skip:0===n?n:n-t})})},i._handleBookmark=function(e){i.setState({loadingId:e}),Object(p.a)(e).then(function(t){if(i.setState({loadingId:""}),!t||t.errors)return void g.toast.error("Bookmark article failed.");g.toast.success("Bookmark article successfully.");var n=[].concat(r(i.state.articles)),a=v()(n,{_id:e});n[a]=Object.assign({},n[a],{isBookmark:!0}),i.setState({articles:n})})},c=n,o(i,c)}return i(t,e),h(t,[{key:"componentWillMount",value:function(){this.getArticles()}},{key:"componentWillReceiveProps",value:function(e){this.props.match.params.sourceId!==e.match.params.sourceId&&(this.props=e,this.setState({loadingArticles:!0,showLoadMore:!1,stopLoadingMore:!1,limit:20,skip:0,articles:[],loadingId:""},this.getArticles))}},{key:"render",value:function(){var e=this,t=this.state,n=t.articles,r=t.loadingId,a=t.showLoadMore,o=t.loadingArticles,i=this.props,c=i.match.params.sourceId,s=i.sources.items,l=void 0===s?[]:s,m=v()(l,{sourceId:c}),p=l[m].title+" - "||"";return u.a.createElement("div",null,u.a.createElement("div",{className:"heading"},u.a.createElement("div",{className:"heading__left"},u.a.createElement("h2",null,p," Latest articles"))),u.a.createElement("div",{className:"article__list"},n.map(function(t){return u.a.createElement(d.a,{key:t._id,article:t,loading:t._id===r,onBookmark:function(){return e._handleBookmark(t._id)}})})),o&&0===n.length&&u.a.createElement("div",{className:"align-center"},"Loading source's articles..."),a&&u.a.createElement("div",{className:"align-center",style:{paddingTop:10,paddingBottom:30}},u.a.createElement(f.a,{primary:!0,size:"tiny",className:"article__btn-load-more",onClick:this.loadMore,loading:o},"Load More")))}}]),t}(l.Component))||s},922:function(e,t,n){"use strict";function r(e,t){var n={};for(var r in e)t.indexOf(r)>=0||Object.prototype.hasOwnProperty.call(e,r)&&(n[r]=e[r]);return n}n.d(t,"d",function(){return o}),n.d(t,"e",function(){return i}),n.d(t,"c",function(){return c}),n.d(t,"b",function(){return s}),n.d(t,"a",function(){return l}),n.d(t,"f",function(){return u});var a=n(229),o=function(e){var t=e.limit,n=void 0===t?40:t,r=e.skip,o=void 0===r?0:r,i=e.sourceName,c=void 0===i?"":i;return Object(a.a)({query:'\n      query {\n        viewer{\n          articleSearch (\n            sort: sourceCreatedAt__desc,\n            query: {\n              bool: {\n                filter: [\n                  {\n                    terms: {\n                      sourceName: "'+c+'"\n                    }\n                  }\n                ]\n              }\n            },\n            limit: '+n+", skip: "+o+") {\n            count\n            hits {\n              _id\n              _source {\n                category\n                sourceName\n                intentIds\n                contentId\n                content\n                readingTime\n                tags\n                title\n                longDescription\n                shortDescription\n                sourceImage\n                state\n              }\n            }\n          }\n        }\n      }\n    "}).then(function(e){return!e||e.errors?e:{data:e.data.viewer.articleSearch}})},i=function(e){var t=e.page,n=void 0===t?1:t,o=e.perPage,i=void 0===o?20:o,c=r(e,["page","perPage"]),s=c.filter;return Object(a.a)({query:"\n      query ($filter: FilterFindManyuserbookmarktypeInput) {\n        viewer {\n          userbookmarkPagination (\n            page: "+n+",\n            perPage: "+i+",\n            filter: $filter\n          ) {\n            count\n            items {\n              _id\n              state\n              article {\n                _id\n                readingTime\n                custom\n                contentId\n                content\n                title\n                longDescription\n                shortDescription\n                sourceImage\n                sourceName\n                state\n                kind\n              }\n            }\n          }\n        }\n      }\n    ",variables:{filter:s}}).then(function(e){return!e||e.errors?e:{data:e.data.viewer.userbookmarkPagination}})},c=function(e){var t=e.filter,n=e.record;return Object(a.a)({query:"\n      mutation ($record: UpdateOneuserbookmarktypeInput!, $filter: FilterUpdateOneuserbookmarktypeInput) {\n        user {\n          bookmarkUpdateOne (\n            record: $record,\n            filter: $filter\n          ) {\n            recordId\n          }\n        }\n      }\n    ",variables:{filter:t,record:n}}).then(function(e){return!e||e.errors?e:{data:e.data.user.bookmarkUpdateOne}})},s=function(e){return Object(a.a)({query:'\n      mutation {\n        user {\n          bookmarkRemoveOne (\n            filter: {\n              contentId: "'+e+'"\n            }\n          ) {\n            recordId\n          }\n        }\n      }\n    '}).then(function(e){return!e||e.errors?e:{data:e.data.user.bookmarkRemoveOne}})},l=function(e){return Object(a.a)({query:'\n      mutation{\n        user{\n          userbookmarkCreate(record:{\n            contentId: "'+e+'",\n            kind: "articletype"\n          }) {\n            recordId\n          }\n        }\n      }\n    '}).then(function(e){return!e||e.errors?e:{data:e.data.user.userbookmarkCreate}})},u=function(e){var t=e.page,n=void 0===t?1:t,r=e.perPage,o=void 0===r?20:r,i=e.filter,c=void 0===i?{}:i;return Object(a.a)({query:"\n      query ($filter: FilterFindManyfeedtypeInput) {\n        viewer {\n          feedPagination (\n            page: "+n+",\n            perPage: "+o+",\n            filter: $filter\n          ) {\n            count\n            items {\n              contentId\n              rank\n              reason\n              contentType\n              contentData {\n                _id\n                contentId\n                contentIds\n                content\n                readingTime\n                tags\n                title\n                shortDescription\n                longDescription\n                sourceImage\n              }\n            }\n          }\n        }\n      }\n    ",variables:{filter:c}}).then(function(e){return!e||e.errors?e:{data:e.data.viewer.feedPagination}})}},923:function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==typeof t&&"function"!==typeof t?e:t}function o(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}n.d(t,"a",function(){return p});var i,c,s=n(0),l=n.n(s),u=n(1),d=n.n(u),m=n(89),f=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),p=(c=i=function(e){function t(){return r(this,t),a(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return o(t,e),f(t,[{key:"shouldComponentUpdate",value:function(e){return JSON.stringify(this.props.article)!==JSON.stringify(e.article)||this.props.article.isBookmark!==e.article.isBookmark||this.props.loading!==e.loading}},{key:"render",value:function(){var e=this.props,t=e.article,n=e.loading,r=e.onArchive,a=e.onRemove,o=e.onBookmark;return l.a.createElement("div",{className:"article"},n&&l.a.createElement("div",{className:"ui dimmer active inverted"},l.a.createElement("div",{className:"ui loader"})),l.a.createElement("a",{href:t.contentId,target:"_blank",className:"article__title"},t.title||t.contentId),l.a.createElement("a",{className:"article__image",href:t.contentId,target:"_blank"},t.sourceImage?l.a.createElement("img",{src:t.sourceImage,alt:""}):l.a.createElement("p",null,t.shortDescription)),l.a.createElement("div",{className:"article__content"},l.a.createElement("div",{className:"article__actions"},l.a.createElement("div",{className:"article__source"},t.sourceName),l.a.createElement("div",{className:"article_settings"},l.a.createElement("div",{className:"article__action"},l.a.createElement("i",{className:"bookmark"+(!t.isBookmark&&"outline")+"icon"}))),o&&l.a.createElement("div",{className:"article_settings"},l.a.createElement("div",{onClick:o,className:"article__action"},l.a.createElement(m.c,{name:"bookmark"+(t.isBookmark?"":" outline")}))),r&&a&&l.a.createElement("div",{className:"article__settings"},l.a.createElement(m.b,{icon:"ellipsis vertical"},l.a.createElement(m.b.Menu,null,l.a.createElement(m.b.Item,{icon:"bookmark outline",text:"Remove bookmark",onClick:a}),l.a.createElement(m.b.Item,{icon:"trash",text:"Archive bookmark",onClick:r})))))))}}]),t}(s.Component),i.propTypes={article:d.a.object,loading:d.a.bool,onArchive:d.a.func,onRemove:d.a.func,onBookmark:d.a.func},c)}});