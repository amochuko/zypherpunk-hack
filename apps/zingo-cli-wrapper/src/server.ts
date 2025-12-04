import { config } from './config';
import app from './app'

app.listen(config.port, () => {
  console.log(`Zcash-cli-wrapper running on http://localhost:${config.port}`);
});
