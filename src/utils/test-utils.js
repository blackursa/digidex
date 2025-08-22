const React = require('react');
const { render } = require('@testing-library/react-native');

function renderWithProviders(ui, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  });
}

module.exports = {
  renderWithProviders,
};
