/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./linker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./linker.js":
/*!*******************!*\
  !*** ./linker.js ***!
  \*******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var simple_gql__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! simple-gql */ \"./node_modules/simple-gql/dist/simple-gql.esm.js\");\n\nlet selection = \"\";\nlet pages = [];\nconst client = Object(simple_gql__WEBPACK_IMPORTED_MODULE_0__[\"createClient\"])(\"http://localhost:3000/api/graphql\");\n\n// get current selection and send it to the extension on request\nchrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {\n  if (request.method == \"getSelection\")\n    sendResponse({ selection: window.getSelection().toString() });\n\n  if (request.method == \"menuClicked\") {\n    renderModal();\n  }\n});\n\nasync function renderModal() {\n  let searchText = \"\";\n  selection = window.getSelection().toString();\n  const modal = document.createElement(\"div\");\n  modal.classList = \"newt-modal\";\n  document.body.append(modal);\n\n  const modalContent = document.createElement(\"div\");\n  modalContent.classList = \"newt-modal-content\";\n  modal.append(modalContent);\n\n  const modalTitle = document.createElement(\"h1\");\n  modalTitle.classList = \"newt-modal-title\";\n  modalTitle.innerHTML = \"Add Selection To Page:\";\n  modalContent.append(modalTitle);\n\n  const searchInput = document.createElement(\"input\");\n  searchInput.setAttribute(\"type\", \"text\");\n  searchInput.setAttribute(\"placeholder\", \"Search for a page\");\n  searchInput.classList = \"newt-search-input\";\n  searchInput.addEventListener(\"keyup\", (e) => {\n    updateList(e.target.value, modal, modalContent);\n  });\n  modalContent.append(searchInput);\n\n  try {\n    const data = await getPages();\n    pages = data ? data.pages : [];\n    appendPagesToModalContent(pages, modalContent);\n\n    modalContent.addEventListener(\"click\", (e) => {\n      if (e.target && e.target.nodeName === \"BUTTON\") {\n        addSelectionToPage(e.target.dataset.pageId);\n        modal.remove();\n      }\n    });\n\n    function filterList(value) {}\n  } catch (e) {\n    console.log(e);\n  }\n}\n\nasync function updateList(value, modal, modalContent) {\n  const filter = `LIKE(page.title, \"%${value}%\", true)`;\n  const data = await getPages(filter);\n  const pages = data ? data.pages : [];\n  const existingButtons = modal.querySelectorAll(\".newt-page-button\");\n\n  existingButtons.forEach((button) => {\n    button.remove();\n  });\n\n  appendPagesToModalContent(pages, modalContent);\n}\n\nfunction appendPagesToModalContent(pages, modalContent) {\n  pages.forEach((page) => {\n    const pageNode = document.createElement(\"button\");\n    pageNode.classList = \"newt-page-button\";\n    pageNode.innerText = page.title;\n    pageNode.setAttribute(\"data-page-id\", page._id);\n    modalContent.appendChild(pageNode);\n  });\n}\n\nasync function addSelectionToPage(pageId) {\n  if (pageId) {\n    const mutation = simple_gql__WEBPACK_IMPORTED_MODULE_0__[\"gql\"]`\n      mutation AddSelectionToPageContent(\n        $pageId: String!\n        $selection: String!\n      ) {\n        addSelectionToPageContent(pageId: $pageId, selection: $selection) {\n          _id\n          content\n        }\n      }\n    `;\n    const response = await client.request(mutation, {\n      pageId,\n      selection,\n    });\n  }\n}\n\nasync function getPages(filter = null, offset = 0, count = 10) {\n  try {\n    const query = simple_gql__WEBPACK_IMPORTED_MODULE_0__[\"gql\"]`\n      query AllPages($filters: [FilterInput], $offset: Int, $count: Int) {\n        pages(filters: $filters, offset: $offset, count: $count) {\n          _id\n          title\n        }\n      }\n    `;\n\n    const filters = filter ? [{ filter }] : [];\n\n    return client.request(query, {\n      filters,\n      offset,\n      count,\n    });\n  } catch (e) {\n    console.log(e);\n  }\n}\n\n\n//# sourceURL=webpack:///./linker.js?");

/***/ }),

/***/ "./node_modules/simple-gql/dist/simple-gql.esm.js":
/*!********************************************************!*\
  !*** ./node_modules/simple-gql/dist/simple-gql.esm.js ***!
  \********************************************************/
/*! exports provided: createClient, gql, request */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createClient\", function() { return createClient; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"gql\", function() { return gql; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"request\", function() { return _request; });\nfunction _extends() {\n  _extends = Object.assign || function (target) {\n    for (var i = 1; i < arguments.length; i++) {\n      var source = arguments[i];\n\n      for (var key in source) {\n        if (Object.prototype.hasOwnProperty.call(source, key)) {\n          target[key] = source[key];\n        }\n      }\n    }\n\n    return target;\n  };\n\n  return _extends.apply(this, arguments);\n}\n\nfunction _inheritsLoose(subClass, superClass) {\n  subClass.prototype = Object.create(superClass.prototype);\n  subClass.prototype.constructor = subClass;\n  subClass.__proto__ = superClass;\n}\n\nfunction _getPrototypeOf(o) {\n  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {\n    return o.__proto__ || Object.getPrototypeOf(o);\n  };\n  return _getPrototypeOf(o);\n}\n\nfunction _setPrototypeOf(o, p) {\n  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {\n    o.__proto__ = p;\n    return o;\n  };\n\n  return _setPrototypeOf(o, p);\n}\n\nfunction isNativeReflectConstruct() {\n  if (typeof Reflect === \"undefined\" || !Reflect.construct) return false;\n  if (Reflect.construct.sham) return false;\n  if (typeof Proxy === \"function\") return true;\n\n  try {\n    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));\n    return true;\n  } catch (e) {\n    return false;\n  }\n}\n\nfunction _construct(Parent, args, Class) {\n  if (isNativeReflectConstruct()) {\n    _construct = Reflect.construct;\n  } else {\n    _construct = function _construct(Parent, args, Class) {\n      var a = [null];\n      a.push.apply(a, args);\n      var Constructor = Function.bind.apply(Parent, a);\n      var instance = new Constructor();\n      if (Class) _setPrototypeOf(instance, Class.prototype);\n      return instance;\n    };\n  }\n\n  return _construct.apply(null, arguments);\n}\n\nfunction _isNativeFunction(fn) {\n  return Function.toString.call(fn).indexOf(\"[native code]\") !== -1;\n}\n\nfunction _wrapNativeSuper(Class) {\n  var _cache = typeof Map === \"function\" ? new Map() : undefined;\n\n  _wrapNativeSuper = function _wrapNativeSuper(Class) {\n    if (Class === null || !_isNativeFunction(Class)) return Class;\n\n    if (typeof Class !== \"function\") {\n      throw new TypeError(\"Super expression must either be null or a function\");\n    }\n\n    if (typeof _cache !== \"undefined\") {\n      if (_cache.has(Class)) return _cache.get(Class);\n\n      _cache.set(Class, Wrapper);\n    }\n\n    function Wrapper() {\n      return _construct(Class, arguments, _getPrototypeOf(this).constructor);\n    }\n\n    Wrapper.prototype = Object.create(Class.prototype, {\n      constructor: {\n        value: Wrapper,\n        enumerable: false,\n        writable: true,\n        configurable: true\n      }\n    });\n    return _setPrototypeOf(Wrapper, Class);\n  };\n\n  return _wrapNativeSuper(Class);\n}\n\nfunction _objectWithoutPropertiesLoose(source, excluded) {\n  if (source == null) return {};\n  var target = {};\n  var sourceKeys = Object.keys(source);\n  var key, i;\n\n  for (i = 0; i < sourceKeys.length; i++) {\n    key = sourceKeys[i];\n    if (excluded.indexOf(key) >= 0) continue;\n    target[key] = source[key];\n  }\n\n  return target;\n}\n\nvar extractMessage = function extractMessage(response) {\n  if (response.errors && response.errors.length) return response.errors[0].message;\n  return \"GraphQL Error (Code: \" + response.status + \")\";\n};\n\nvar ClientError =\n/*#__PURE__*/\nfunction (_Error) {\n  _inheritsLoose(ClientError, _Error);\n\n  function ClientError(response, request) {\n    return _Error.call(this, extractMessage(response) + \": \" + JSON.stringify({\n      response: response,\n      request: request\n    })) || this;\n  }\n\n  return ClientError;\n}(\n/*#__PURE__*/\n_wrapNativeSuper(Error));\n\nvar _request = function request(_ref) {\n  var _window;\n\n  var url = _ref.url,\n      query = _ref.query,\n      variables = _ref.variables,\n      _ref$options = _ref.options,\n      options = _ref$options === void 0 ? {\n    fetch: (_window = window) === null || _window === void 0 ? void 0 : _window.fetch\n  } : _ref$options;\n\n  try {\n    var _window2;\n\n    var headers = options.headers,\n        baseFetch = options.fetch,\n        otherOptions = _objectWithoutPropertiesLoose(options, [\"headers\", \"fetch\"]);\n\n    var fetch = baseFetch !== null && baseFetch !== void 0 ? baseFetch : (_window2 = window) === null || _window2 === void 0 ? void 0 : _window2.fetch;\n    var body = JSON.stringify({\n      query: query,\n      variables: variables\n    });\n    return Promise.resolve(fetch(url, _extends({\n      method: 'POST',\n      headers: Object.assign({\n        'Content-Type': 'application/json'\n      }, headers),\n      body: body\n    }, otherOptions))).then(function (request) {\n      return Promise.resolve(request.json()).then(function (response) {\n        if (!request.ok || !response.data) {\n          var error = typeof response === 'string' ? {\n            error: response\n          } : response;\n          throw new ClientError(_extends({}, error, {\n            status: request.status\n          }), {\n            query: query,\n            variables: variables\n          });\n        }\n\n        return response.data;\n      });\n    });\n  } catch (e) {\n    return Promise.reject(e);\n  }\n};\nvar createClient = function createClient(url, options) {\n  if (options === void 0) {\n    var _window3;\n\n    options = {\n      fetch: (_window3 = window) === null || _window3 === void 0 ? void 0 : _window3.fetch\n    };\n  }\n\n  return {\n    request: function request(query, variables) {\n      return _request({\n        url: url,\n        query: query,\n        variables: variables,\n        options: options\n      });\n    }\n  };\n};\n\n/**\r\n * Simple `gql` tag for syntax highlighting in code editors.\r\n *\r\n * @param query - GraphQL query template string\r\n */\nvar gql = function gql(query) {\n  return String(query).replace('\\n', ' ');\n};\n\n\n//# sourceMappingURL=simple-gql.esm.js.map\n\n\n//# sourceURL=webpack:///./node_modules/simple-gql/dist/simple-gql.esm.js?");

/***/ })

/******/ });