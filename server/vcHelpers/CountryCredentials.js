module.exports = {
    countryCredentials: (credentialSubject) => ({
      id: 1,
      circuitId: "credentialAtomicQuerySigV2",
      query: {
        allowedIssuers: ["*"],
        type: "nationality",
        context:
          // "https://ipfs.io/ipfs/QmPhtLn5thsFVpxtdKHf37Pf7ZiJRJYwT7Aj5RqJkUaRqB",
        "https://ipfs.io/ipfs/Qmczk2XoWPxsqEpVc2vwNJn9ekkEf6twXk3hdDW3koQ9yJ",
        credentialSubject,
      },
    }),
    // See more off-chain examples
    // https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/#equals-operator-1
  };
  