const { kycCredentials } = require("./vcHelpers/ZKKYC");

// design your own customised authentication requirement here using Query Language
// https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/

const humanReadableAuthReason = "Must be born before this year";

const credentialSubject = {
  Nationality: {
    $eq: "Indian",
  },
};

const proofRequest = kycCredentials(credentialSubject);

module.exports = {
  humanReadableAuthReason,
  proofRequest,
};







// const { countryCredentials } = require("./vcHelpers/CountryCredentials")

// const humanReadableAuthReason = "Must be an indian";

// const credentialSubject = {
//   "user-nationality": {
//     $eq: "indian",
//   },
// };

// const proofRequest = countryCredentials(credentialSubject);

// module.exports = {
//   humanReadableAuthReason,
//   proofRequest,
// };



// const { nationalityCredentials } = require("./vcHelpers/NationalityCredentials")

// // design your own customised authentication requirement here using Query Language
// // https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/

// const humanReadableAuthReason = "Must be an indian";

// const credentialSubject = {
//   "user-nationality": {
//     $eq: "indian",
//   },
// };

// const proofRequest = nationalityCredentials(credentialSubject);

// module.exports = {
//   humanReadableAuthReason,
//   proofRequest,
// };







// const { KYCAgeCredential } = require("./vcHelpers/KYCAgeCredential");

// // design your own customised authentication requirement here using Query Language
// // https://0xpolygonid.github.io/tutorials/verifier/verification-library/zk-query-language/

// const humanReadableAuthReason = "Must be born before this year";

// const credentialSubject = {
//   birthday: {
//     // users must be born before this year
//     // birthday is less than Jan 1, 2023
//     $lt: 20230101,
//   },
// };

// const proofRequest = KYCAgeCredential(credentialSubject);

// module.exports = {
//   humanReadableAuthReason,
//   proofRequest,
// };
