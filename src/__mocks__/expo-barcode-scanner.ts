const mockBarCodeScanner = {
  BarCodeScanner: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    Constants: {
      Type: {
        back: 'back',
        front: 'front'
      }
    }
  }
};

export default mockBarCodeScanner;
