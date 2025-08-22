const mockCamera = {
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    Constants: {
      Type: {
        back: 'back',
        front: 'front'
      }
    }
  }
};

export default mockCamera;
