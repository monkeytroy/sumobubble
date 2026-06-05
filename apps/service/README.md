This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn dev
```

## Stripe Notes

Stripe uses webhooks to send subscription information to the server. The api/subscribe endpoint handles this but for localhost testing the stripe cli needs to be used

```
stripe listen --forward-to localhost:3000/apio/subscribe
```

## Config

DB config manually created to start. At some point will be schema based...

```
{
  // mongo db id
  "customerId": "some-unique-val",
  "customer": {
    "title": "wrpc",
    "theme": {
      "primary": "#aaaaff"
    },
    "logo": {
      "url": "https://faithconnector.s3.amazonaws.com/wrpca/images/library/design_assets/8b9988_2.png",
      "align": "center"
    }
  },
  "summary": {
    "content": "**Welcome** Please join us Sunday morning for live worship at 9am and 11am - Or live streaming at 11am on [YouTube](https://www.youtube.com/@WestminsterChurch/streams).  Here's the link to our [Media Page](/media)"
  },
  "special": {
    "content": "***There is no student service this week.*** &#x1F600; \n\n No '<b>html</b>' allowed."
  },
  "contact": {
    "content": "Please let us know how we can serve you.",
    "contact": "fredarters@gmail.com"
  },
  "social": {
    "youtube": "https://www.youtube.com/wrpca"
  },
  "funny": {
    "content": "A bland man walked into a bar, and chair, and a door..."
  },
  "verse": {
    "content": "**Psalm 41:11** Put your hope in God, for I will yet praise him, my Savior and my God."
  },
  "vod": {
    "content": "",
    "url": "https://www.youtube.com/embed/qVEOJzAYIW4"
  }
}

```
