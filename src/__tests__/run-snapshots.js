const path = require('path');
const { test, expect, ReactTestRenderer } = require('./custom-runner');

// Mock the necessary React Native components and modules
global.React = require('react');

// Basic component mocks
const mockComponent = (name) => {
    return function(props) {
        return React.createElement(name, props);
    };
};

// Mock React Native components
global.Image = mockComponent('Image');
global.View = mockComponent('View');
global.Text = mockComponent('Text');
global.ScrollView = mockComponent('ScrollView');
global.TouchableOpacity = mockComponent('TouchableOpacity');

// Import and run the snapshot tests
try {
    // First test file
    console.log('\nRunning QRCodeDisplay snapshot tests...');
    require('./components/__tests__/QRCodeDisplay.snapshot.test.tsx');

    // Second test file
    console.log('\nRunning ShareProfileScreen snapshot tests...');
    require('./screens/__tests__/ShareProfileScreen.snapshot.test.tsx');

    console.log('\nAll snapshot tests completed!');
} catch (error) {
    console.error('Error running tests:', error);
}
