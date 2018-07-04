const { Contracts, encodeCall } = require('zos-lib')
const shouldBehaveLikeDonations = require('./Donations.behavior.js');

const DonationsV1 = Contracts.getFromLocal('DonationsV1');

const sendTransaction = (target, method, args, values, opts) => {
  const data = encodeCall(method, args, values);
  return target.sendTransaction(Object.assign({ data }, opts));
};
  
contract('DonationsV1', ([_, owner, donor, wallet]) => {

  beforeEach(async function() {
    this.donations = await DonationsV1.new();
    await sendTransaction(this.donations, 'initialize', ['address'], [owner]);
  });

  shouldBehaveLikeDonations(owner, donor, wallet);
});
