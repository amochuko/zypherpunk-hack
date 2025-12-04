// TODO: use a library to check this address
export function validateZcashAddress(addr: string): boolean {
  return /^(t1|z|u)[0-9A-Za-z]{30,}$/.test(addr);
}

