import assert from 'assert';

import keytar from 'keytar';
import prompts from 'prompts';
import validator from 'validator';

const pkg = require('../package.json');

export const get = async (url: string, account: 'email' | 'user' = 'email'): Promise<{ account: string, password: string, otp?: string, save: () => Promise<void> }> => {
  const service = `${pkg.name}: ${new URL(url).host}`; // host = sub.example.com:80
  const creds = await keytar.findCredentials(service);
  if (creds.length) {
    assert(creds.length == 1);
    console.log(`Using saved credentials ${service}`);
    return { ...creds[0], save: () => Promise.resolve() };
  } else {
    const cred = await prompts([
      { 'name': 'account', 'type': 'text', 'message': account == 'email' ? 'E-Mail' : 'User', validate: x => account == 'user' || validator.isEmail(x) || 'invalid address' },
      { 'name': 'password', 'type': 'password', 'message': 'Password' },
      { 'name': 'otp', 'type': 'password', 'message': '2FA/OTP (press enter to skip)' }]);
    if (!cred.account || !cred.password) {
      console.error('Can not continue without credentials!')
      process.exit(1);
    }
    // after 'enter' otp is an empty string -> delete
    if ('otp' in cred && !cred.otp.length) delete cred.otp; // no ?. yet for chaining
    return { ...cred, save: () => keytar.setPassword(service, cred.account, cred.password) };
  }
}

export default get;