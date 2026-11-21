// Runs before the iubenda consent widget and before hydration (root layout,
// beforeInteractive). It hooks the widget's callbacks so the page learns when
// the widget is ready and when the visitor's choice changes, then fires
// "marianna:privacy". It decides nothing: the consent rule lives in
// frontend/lib/privacy/consent.ts.
(function () {
  var state = (window.mariannaPrivacy = { ready: false });

  function changed() {
    window.dispatchEvent(new Event("marianna:privacy"));
  }

  window._iub = window._iub || [];
  var config = (window._iub.csConfiguration = window._iub.csConfiguration || {});
  // vercel.app is a public suffix. iubenda's inferred .vercel.app cookie
  // domain is rejected, so previews store consent on their own host.
  if (window.location.hostname.endsWith(".vercel.app")) {
    config.localConsentDomainExact = true;
  }
  var callbacks = (config.callback = config.callback || {});
  ["onReady", "onPreferenceExpressed", "onPreferenceExpressedOrNotNeeded"].forEach(function (name) {
    var previous = callbacks[name];
    callbacks[name] = function () {
      if (name === "onReady") state.ready = true;
      changed();
      // Read once more after the widget completes its current callback cycle.
      Promise.resolve().then(changed);
      if (typeof previous === "function") previous.apply(this, arguments);
    };
  });
  window.addEventListener("pageshow", changed);
  window.addEventListener("focus", changed);
})();
