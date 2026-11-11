# https://footscape-phi.vercel.app/

## Public venue matches

- Public matches are listed in the Venues tab and do not require a community membership.
- Set `VENUE_MATCH_ORGANIZER_EMAIL` in the backend environment to the account allowed to publish public matches. It defaults to `mittal.sawaransh@gmail.com`.
- Paid bookings use Razorpay Checkout. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to the backend environment before accepting paid bookings. Use Razorpay test credentials while integrating; `RAZORPAY_CURRENCY` defaults to `INR`.
- Matches can be published before payment is configured. Free matches can be booked immediately; paid bookings stay disabled until the Razorpay keys are configured.
- Configure the keys in both local and deployed backend environments. Never put the Razorpay secret in the frontend environment.
