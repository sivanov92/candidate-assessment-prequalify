import { SSTConfig } from "sst";

export default {
  config(_input) {
    return {
      name: "candidate-assessment-prequalify",
      region: "us-east-1",
    };
  },
};
