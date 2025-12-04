import axios from 'axios';

export async function getZecPrice():Promise<number> {
    const url =
      "https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd";
  
      const res = await axios.get(url);

      return res.data?.zcash?.usd ?? 0;
}
