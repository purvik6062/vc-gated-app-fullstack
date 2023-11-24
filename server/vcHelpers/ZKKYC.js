module.exports = {
    kycCredentials: (credentialSubject) => ({
      id: 1,
      circuitId: "credentialAtomicQuerySigV2",
      query: {
        allowedIssuers: ["*"],
        type: "ZKKYC",
        context:
        "https://ipfs.io/ipfs/QmX4zWWqJWsTNLL5givEwJc8wKzrw6Wb3eDn2mDDQ7EjSF",
        credentialSubject,
      },
    }),
    // See more off-chain examples
    // https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/#equals-operator-1
  };
  