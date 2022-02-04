(() => {
var exports = {};
exports.id = 120;
exports.ids = [120];
exports.modules = {

/***/ 989:
/***/ ((module) => {

module.exports = "/_next/static/images/background-b8850bf73e3c39e280b2f3fbaa73d86b.png";

/***/ }),

/***/ 196:
/***/ ((module) => {

module.exports = "/_next/static/images/phone-frame-83781d3e3247c085ef768fee27b5c0f9.png";

/***/ }),

/***/ 488:
/***/ ((module) => {

module.exports = "/_next/static/videos/background-fe7bb0dc7349730fcc3be3c03748c9db.mp4";

/***/ }),

/***/ 602:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ _slug_),
  "getStaticPaths": () => (/* binding */ getStaticPaths),
  "getStaticProps": () => (/* binding */ getStaticProps)
});

// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(689);
;// CONCATENATED MODULE: external "contentful"
const external_contentful_namespaceObject = require("contentful");
;// CONCATENATED MODULE: ./data/config.json
const config_namespaceObject = JSON.parse('{"Dh":"sn5a22dgyyrk","To":"FFS9gD_ae6ezGTwHEZUX4rduO8mlVcOEBHMkEUwKVXM","NZ":"master","S1":"4obJUOHQOyX7DwebUy2PpX"}');
;// CONCATENATED MODULE: ./data/mapping.ts
const getKeys = Object.keys;

function getValue(value) {
  if (Array.isArray(value)) {
    return value.map(getValue);
  }

  if (value && value.sys) {
    return mapEntry(value);
  }

  return value;
}

function mapEntry(entry) {
  var _entry$sys$contentTyp;

  if (entry.sys.type === "Asset") return mapAsset(entry);
  const result = {
    id: entry.sys.id,
    type: (((_entry$sys$contentTyp = entry.sys.contentType) === null || _entry$sys$contentTyp === void 0 ? void 0 : _entry$sys$contentTyp.sys.id) || entry.sys.type || "[unknown]").toLowerCase()
  };

  for (const fieldName of getKeys(entry.fields)) {
    result[fieldName] = getValue(entry.fields[fieldName]);
  }

  switch (result.type) {
    case "page":
      if (result.slug && result.slug[0] !== "/") {
        result.slug = "/" + result.slug;
      }

      break;
  }

  return result;
}

function mapAsset(entry) {
  return {
    id: entry.sys.id,
    type: "asset",
    name: entry.fields.title,
    url: entry.fields.file.url
  };
}
;// CONCATENATED MODULE: ./data/contentful.ts
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




const client = external_contentful_namespaceObject.createClient({
  accessToken: config_namespaceObject.To,
  space: config_namespaceObject.Dh,
  environment: config_namespaceObject.NZ
});
const DEFAULT_OPTIONS = {
  include: 10
};
async function getEntry(id) {
  const res = await client.getEntry(id, _objectSpread({}, DEFAULT_OPTIONS));
  return mapEntry(res);
}
async function getEntries(query) {
  const res = await client.getEntries(_objectSpread(_objectSpread({}, DEFAULT_OPTIONS), query));
  return res.items.map(item => mapEntry(item));
}
async function getConfig() {
  return await getEntry(config_namespaceObject.S1);
}
;// CONCATENATED MODULE: ./data/index.ts

async function data_getEntry(id) {
  const result = await getEntry(id);
  return result;
}
async function getEntriesByType(typeName) {
  const result = await getEntries({
    "sys.contentType.sys.id": typeName
  });
  return result;
}
async function getPageBySlug(slug) {
  if (slug[0] === "/") slug = slug.substring(1);
  const result = await getEntries({
    content_type: "page",
    "fields.slug[in]": `${slug},/${slug}`,
    limit: 1
  });
  return result[0];
}
async function data_getConfig() {
  return await getConfig();
}
/* harmony default export */ const data = ({
  getEntry: data_getEntry,
  getEntriesByType,
  getPageBySlug,
  getConfig: data_getConfig
}); // export function queryGraphQL(query: string): Promise<unknown> {
//     return fetch(
//         `https://graphql.contentful.com/content/v1/spaces/${config.space}/environments/${config.environment}`,
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//                 Authorization: "Bearer " + config.accessToken,
//             },
//             body: JSON.stringify({ query }),
//         },
//     ).then((r) => r.json());
// }
// EXTERNAL MODULE: ./src/contentParts/stage/stage.module.css
var stage_module = __webpack_require__(684);
var stage_module_default = /*#__PURE__*/__webpack_require__.n(stage_module);
// EXTERNAL MODULE: ./src/assets/background.mp4
var background = __webpack_require__(488);
var background_default = /*#__PURE__*/__webpack_require__.n(background);
// EXTERNAL MODULE: ./src/assets/background.png
var assets_background = __webpack_require__(989);
var assets_background_default = /*#__PURE__*/__webpack_require__.n(assets_background);
// EXTERNAL MODULE: ./src/contentParts/stage/phone-frame.png
var phone_frame = __webpack_require__(196);
var phone_frame_default = /*#__PURE__*/__webpack_require__.n(phone_frame);
;// CONCATENATED MODULE: external "@contentful/rich-text-html-renderer"
const rich_text_html_renderer_namespaceObject = require("@contentful/rich-text-html-renderer");
// EXTERNAL MODULE: ./src/components/rich-text/rich-text.module.css
var rich_text_module = __webpack_require__(982);
var rich_text_module_default = /*#__PURE__*/__webpack_require__.n(rich_text_module);
// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
;// CONCATENATED MODULE: ./src/components/rich-text/index.tsx




const RichText = document => {
  const html = (0,rich_text_html_renderer_namespaceObject.documentToHtmlString)(document, {
    renderNode: {
      ["paragraph"]: (node, next) => `<p>${next(node.content).replace(/\n/g, `</br>`)}</p>`
    }
  });
  return /*#__PURE__*/jsx_runtime_.jsx("div", {
    className: (rich_text_module_default()).wrapper,
    dangerouslySetInnerHTML: {
      __html: html
    }
  });
};
;// CONCATENATED MODULE: ./src/contentParts/stage/index.tsx
function stage_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function stage_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { stage_ownKeys(Object(source), true).forEach(function (key) { stage_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { stage_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function stage_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }









const Stage = props => {
  const {
    0: initializing,
    1: setInitializing
  } = (0,external_react_.useState)(true);
  const classNames = [(stage_module_default()).stage];
  if (initializing) classNames.push((stage_module_default()).initializing);
  console.log(props);
  (0,external_react_.useEffect)(() => {
    setTimeout(() => setInitializing(false));
  }, []);
  return /*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
    className: classNames.join(" "),
    children: [/*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
      className: (stage_module_default()).background,
      children: [/*#__PURE__*/jsx_runtime_.jsx("img", {
        src: (assets_background_default()),
        alt: "Background Image"
      }), /*#__PURE__*/jsx_runtime_.jsx("video", {
        src: (background_default()),
        loop: true,
        autoPlay: true,
        muted: true,
        controls: false
      })]
    }), /*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
      className: (stage_module_default()).inner,
      children: [/*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
        className: (stage_module_default()).intro,
        children: [props.logo && /*#__PURE__*/jsx_runtime_.jsx("div", {
          className: (stage_module_default()).logo,
          children: /*#__PURE__*/jsx_runtime_.jsx("img", {
            src: props.logo.url,
            alt: props.logo.name,
            width: props.logoWidth
          })
        }), props.h2 && /*#__PURE__*/jsx_runtime_.jsx("h2", {
          className: (stage_module_default()).h2,
          children: props.h2
        }), props.h1 && /*#__PURE__*/jsx_runtime_.jsx("h1", {
          className: (stage_module_default()).h1,
          children: props.h1
        }), props.description && /*#__PURE__*/jsx_runtime_.jsx("div", {
          className: (stage_module_default()).description,
          children: /*#__PURE__*/jsx_runtime_.jsx(RichText, stage_objectSpread({}, props.description))
        })]
      }), props.phoneImage && /*#__PURE__*/jsx_runtime_.jsx("div", {
        className: (stage_module_default()).phone,
        style: {
          backgroundImage: `url(${props.phoneImage.url})`
        },
        children: /*#__PURE__*/jsx_runtime_.jsx("img", {
          src: (phone_frame_default()),
          alt: props.phoneImage.name
        })
      })]
    }), /*#__PURE__*/jsx_runtime_.jsx("div", {
      className: (stage_module_default()).waves,
      children: /*#__PURE__*/jsx_runtime_.jsx("svg", {
        "data-name": "Layer 1",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1200 120",
        preserveAspectRatio: "none",
        children: /*#__PURE__*/jsx_runtime_.jsx("path", {
          d: "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
          className: (stage_module_default()).wavesFill
        })
      })
    })]
  });
};
// EXTERNAL MODULE: ./src/contentParts/text/text.module.css
var text_module = __webpack_require__(138);
var text_module_default = /*#__PURE__*/__webpack_require__.n(text_module);
;// CONCATENATED MODULE: ./src/contentParts/text/index.tsx
function text_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function text_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { text_ownKeys(Object(source), true).forEach(function (key) { text_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { text_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function text_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }





const Text = props => {
  return /*#__PURE__*/jsx_runtime_.jsx("div", {
    className: (text_module_default()).text,
    children: /*#__PURE__*/jsx_runtime_.jsx("div", {
      className: (text_module_default()).inner,
      children: props.text && /*#__PURE__*/jsx_runtime_.jsx("div", {
        className: (text_module_default()).text,
        children: /*#__PURE__*/jsx_runtime_.jsx(RichText, text_objectSpread({}, props.text))
      })
    })
  });
};
;// CONCATENATED MODULE: ./src/contentPart.tsx
function contentPart_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function contentPart_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { contentPart_ownKeys(Object(source), true).forEach(function (key) { contentPart_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { contentPart_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function contentPart_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }







const Page = props => {
  return /*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
    "data-id": props.id,
    "data-type": props.type,
    children: [props.type === "stage" && /*#__PURE__*/jsx_runtime_.jsx(Stage, contentPart_objectSpread({}, props)), props.type === "text" && /*#__PURE__*/jsx_runtime_.jsx(Text, contentPart_objectSpread({}, props))]
  });
};

/* harmony default export */ const contentPart = (Page);
// EXTERNAL MODULE: ./src/components/footer/footer.module.css
var footer_module = __webpack_require__(882);
var footer_module_default = /*#__PURE__*/__webpack_require__.n(footer_module);
;// CONCATENATED MODULE: ./src/components/footer/index.tsx
function footer_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function footer_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { footer_ownKeys(Object(source), true).forEach(function (key) { footer_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { footer_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function footer_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }








const Footer = props => {
  const {
    0: initializing,
    1: setInitializing
  } = (0,external_react_.useState)(true);
  const classNames = [(footer_module_default()).footer];
  if (initializing) classNames.push((footer_module_default()).initializing);
  console.log(props);
  (0,external_react_.useEffect)(() => {
    setTimeout(() => setInitializing(false));
  }, []);
  return /*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
    className: classNames.join(" "),
    children: [/*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
      className: (footer_module_default()).background,
      children: [/*#__PURE__*/jsx_runtime_.jsx("img", {
        src: (assets_background_default()),
        alt: "Background Image"
      }), /*#__PURE__*/jsx_runtime_.jsx("video", {
        src: (background_default()),
        loop: true,
        autoPlay: true,
        muted: true,
        controls: false
      })]
    }), /*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
      className: (footer_module_default()).inner,
      children: [props.text && /*#__PURE__*/jsx_runtime_.jsx("div", {
        className: (footer_module_default()).text,
        children: /*#__PURE__*/jsx_runtime_.jsx(RichText, footer_objectSpread({}, props.text))
      }), props.metaNavigation && /*#__PURE__*/jsx_runtime_.jsx("ul", {
        className: (footer_module_default()).metaNav,
        children: props.metaNavigation.map(item => /*#__PURE__*/jsx_runtime_.jsx("li", {
          children: /*#__PURE__*/jsx_runtime_.jsx("a", {
            href: item.slug,
            children: item.teaserTitle || item.title
          })
        }, item.id))
      })]
    }), /*#__PURE__*/jsx_runtime_.jsx("div", {
      className: (footer_module_default()).waves,
      children: /*#__PURE__*/jsx_runtime_.jsx("svg", {
        "data-name": "Layer 1",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 1200 120",
        preserveAspectRatio: "none",
        children: /*#__PURE__*/jsx_runtime_.jsx("path", {
          d: "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
          className: (footer_module_default()).wavesFill
        })
      })
    })]
  });
};
;// CONCATENATED MODULE: ./src/components/page/index.tsx
function page_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function page_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { page_ownKeys(Object(source), true).forEach(function (key) { page_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { page_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function page_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }







const page_Page = props => {
  (0,external_react_.useEffect)(() => {
    document.title = props.title;
  }, []);
  return /*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
    className: "page",
    children: [props.mainContent.map(cp => /*#__PURE__*/jsx_runtime_.jsx(contentPart, page_objectSpread({}, cp), cp.id)), /*#__PURE__*/jsx_runtime_.jsx(Footer, page_objectSpread({}, props.config.footer))]
  });
};

/* harmony default export */ const page = (page_Page);
;// CONCATENATED MODULE: ./pages/[[...slug]].tsx
function _slug_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _slug_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { _slug_ownKeys(Object(source), true).forEach(function (key) { _slug_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { _slug_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _slug_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






const DynamicWrapper = props => {
  return /*#__PURE__*/jsx_runtime_.jsx(page, _slug_objectSpread(_slug_objectSpread({}, props.page), {}, {
    config: props.config
  }));
};

const getStaticPaths = async () => {
  const pages = await getEntriesByType("page");
  const paths = pages.map(page => ({
    params: {
      slug: page.slug.split("/").filter(k => k)
    }
  }));
  return {
    paths,
    fallback: false
  };
};
const getStaticProps = async context => {
  var _context$params;

  const params = (context === null || context === void 0 ? void 0 : (_context$params = context.params) === null || _context$params === void 0 ? void 0 : _context$params.slug) || [];
  const slug = "/" + params.join("/");
  const page = await getPageBySlug(slug);
  const config = await data_getConfig();
  return {
    props: {
      page,
      config
    }
  };
};
/* harmony default export */ const _slug_ = (DynamicWrapper);

/***/ }),

/***/ 882:
/***/ ((module) => {

// Exports
module.exports = {
	"footer": "footer_footer__2ui_h",
	"inner": "footer_inner__kWl43",
	"background": "footer_background__FX2wj",
	"text": "footer_text__eL6OI",
	"metaNav": "footer_metaNav__hTYxe",
	"waves": "footer_waves__CY5af",
	"wavesFill": "footer_wavesFill__oNq0T"
};


/***/ }),

/***/ 982:
/***/ ((module) => {

// Exports
module.exports = {
	"wrapper": "rich-text_wrapper__sFjjN"
};


/***/ }),

/***/ 684:
/***/ ((module) => {

// Exports
module.exports = {
	"stage": "stage_stage__1eoiA",
	"inner": "stage_inner__HGHnP",
	"logo": "stage_logo__2CqqD",
	"initializing": "stage_initializing__2Jb7T",
	"h1": "stage_h1__MxfQa",
	"h2": "stage_h2__z5Ji6",
	"description": "stage_description__6100C",
	"intro": "stage_intro__EE8Mc",
	"background": "stage_background__8rpG6",
	"phone": "stage_phone__0AyC7",
	"waves": "stage_waves__WBhy8",
	"wavesFill": "stage_wavesFill__bhDm1"
};


/***/ }),

/***/ 138:
/***/ ((module) => {

// Exports
module.exports = {
	"text": "text_text__oL1nC",
	"inner": "text_inner__AD9rc"
};


/***/ }),

/***/ 689:
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(602));
module.exports = __webpack_exports__;

})();