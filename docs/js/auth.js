(function () {
  function getToken() {
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  }

  function clearAuth() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = function (resource, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return nativeFetch(resource, { ...options, headers });
  };

  window.auth = {
    getToken,
    clearAuth,
    setToken(token) {
      if (token) sessionStorage.setItem('authToken', token);
    }
  };
})();
