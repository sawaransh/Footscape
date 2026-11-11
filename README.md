# https://footscape-phi.vercel.app/

## Public venue matches

- Public matches are listed in the Venues tab and do not require a community membership.
- Set `VENUE_MATCH_ORGANIZER_EMAIL` in the backend environment to the account allowed to publish public matches. It defaults to `mittal.sawaransh@gmail.com`.
- Paid bookings use Razorpay Checkout. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` to the backend environment before accepting paid bookings. Use Razorpay test credentials while integrating; `RAZORPAY_CURRENCY` defaults to `INR`.
- Matches can be published before payment is configured. Free matches can be booked immediately; paid bookings stay disabled until the Razorpay API keys and webhook secret are configured.
- In the Razorpay Dashboard, add the deployed backend webhook URL `/api/venues/razorpay-webhook` and subscribe to `payment.captured`.
- Configure the keys in both local and deployed backend environments. Never put the Razorpay secrets in the frontend environment.
- Set `VITE_API_URL` in the Vercel project to the deployed backend URL ending in `/api`.

### Checkout setup checklist

1. In Razorpay Test Mode, generate a Key ID and Key Secret under **Account & Settings → API Keys**. Keep the secret on the backend only.
2. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and a separate `RAZORPAY_WEBHOOK_SECRET` to `backend/.env` locally and to the deployed backend's environment variables.
3. Make sure the backend is reachable over HTTPS. In **Account & Settings → Webhooks**, add `https://<your-backend-host>/api/venues/razorpay-webhook`, use the same webhook secret, and select `payment.captured`.
4. Deploy the backend web service and copy its assigned public `onrender.com` URL. In Vercel, set `VITE_API_URL` to `<backend-url>/api`. On the backend, set `CLIENT_URL` to the Footscape site origin so browser requests are allowed. The root `render.yaml` blueprint prompts for required secrets without committing them.
5. Enable automatic payment capture in Razorpay. Footscape only confirms a paid place after Razorpay reports the payment as captured.
6. Create a paid test match, complete one test checkout, then confirm the booking appears under the selected side. Test mode simulates payment and does not collect real money.

Razorpay references: [generate API keys](https://razorpay.com/docs/api/authentication/), [Standard Checkout integration and signature verification](https://razorpay.com/docs/server-integration/python/test-app/), [webhooks](https://razorpay.com/docs/webhooks/).
