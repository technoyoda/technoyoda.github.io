/**
 * plotly-charts.js — Load Plotly from CDN and render all chart containers on the page.
 *
 * Usage in a post:
 *   1. Add `custom_js: [plotly-charts]` to frontmatter
 *   2. Add chart containers in the post body:
 *
 *      <div class="plotly-chart" data-chart="/assets/data/my-chart.json"></div>
 *
 *      Or inline the spec directly:
 *
 *      <div class="plotly-chart" id="my-chart"></div>
 *      <script type="application/json" data-for="my-chart">
 *        { "data": [...], "layout": {...} }
 *      </script>
 *
 * The script handles:
 *   - Loading Plotly.js from CDN (only once)
 *   - Fetching JSON specs from URLs (data-chart attribute)
 *   - Reading inline JSON specs (script[data-for] pattern)
 *   - Responsive resizing
 *   - Dark mode compatibility (counter-invert like code blocks)
 */

(function () {
  var PLOTLY_CDN = 'https://cdn.plot.ly/plotly-2.35.2.min.js';

  function loadPlotly(callback) {
    if (window.Plotly) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = PLOTLY_CDN;
    script.onload = callback;
    script.onerror = function () {
      console.error('Failed to load Plotly from CDN');
    };
    document.head.appendChild(script);
  }

  function renderChart(container, spec) {
    var config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d'],
      displaylogo: false,
    };

    Plotly.newPlot(container, spec.data, spec.layout || {}, config);
  }

  function initCharts() {
    var containers = document.querySelectorAll('.plotly-chart');

    containers.forEach(function (el) {
      // Option 1: Load spec from URL
      var url = el.getAttribute('data-chart');
      if (url) {
        fetch(url)
          .then(function (r) { return r.json(); })
          .then(function (spec) { renderChart(el, spec); })
          .catch(function (err) {
            el.textContent = 'Failed to load chart: ' + err.message;
          });
        return;
      }

      // Option 2: Inline spec via <script data-for="id">
      var id = el.id;
      if (id) {
        var scriptEl = document.querySelector('script[data-for="' + id + '"]');
        if (scriptEl) {
          try {
            var spec = JSON.parse(scriptEl.textContent);
            renderChart(el, spec);
          } catch (err) {
            el.textContent = 'Failed to parse chart spec: ' + err.message;
          }
          return;
        }
      }

      // Option 3: Inline spec in data-spec attribute (for small specs)
      var specAttr = el.getAttribute('data-spec');
      if (specAttr) {
        try {
          var spec = JSON.parse(specAttr);
          renderChart(el, spec);
        } catch (err) {
          el.textContent = 'Failed to parse chart spec: ' + err.message;
        }
      }
    });
  }

  // Entry point: load Plotly, then render all charts
  loadPlotly(initCharts);
})();
