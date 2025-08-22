declare module '@react-native-community/netinfo' {
  interface NetInfoState {
    type: string;
    isConnected: boolean;
    isInternetReachable: boolean | null;
  }

  function fetch(): Promise<NetInfoState>;
  function addEventListener(
    listener: (state: NetInfoState) => void
  ): () => void;

  export { NetInfoState, fetch, addEventListener };
}
