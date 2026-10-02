import type { Post } from "../lib/types.ts";

/**
 * The journal. Each post answers one question a small-business owner actually
 * searches for, in the studio's voice, using only facts the studio publishes
 * (prices, process, ownership) plus general, verifiable know-how. No invented
 * statistics, no invented clients. Third-party pricing is described in general
 * terms because it changes — readers are pointed to the provider instead.
 *
 * Structure that helps search and AI answer engines:
 *   - `takeaways` sit above the article and answer the question outright
 *   - H2s are phrased as the questions people ask
 *   - `faq` is emitted as FAQPage data alongside BlogPosting
 *
 * Newest first. To add a post: copy one, change the slug, run `npm run build`.
 */

const PUBLISHED = "2026-09-27";

export const posts: readonly Post[] = [
  {
    slug: "how-much-does-a-small-business-website-cost",
    category: "Pricing",
    title: "How much does a small business website cost in 2026?",
    metaTitle: "How Much Does a Small Business Website Cost in 2026?",
    description:
      "What a small business website really costs in the US & UK: builders vs freelancers vs agencies, price drivers, running costs and fixed quotes.",
    lede: "The honest answer is “it depends” — so here’s exactly what it depends on, what you should expect to pay, and the costs nobody mentions until the invoice arrives.",
    published: PUBLISHED,
    updated: PUBLISHED,
    takeaways: [
      "A hand-built small business website from an independent studio typically starts in the hundreds of dollars, not thousands. At Pabloch Tech, websites start from $400 and online stores from $1,200.",
      "The biggest price drivers are the number of pages, custom features (estimators, booking, checkout) and who writes the content.",
      "Budget for running costs too: domain, hosting and maintenance, whichever route you choose.",
      "Always get a fixed price in writing before paying a deposit.",
    ],
    blocks: [
      { h2: "The three ways to get a website — and what each really costs", id: "three-routes" },
      {
        p: "Almost every small business ends up on one of three routes. They differ less in the price on the sales page than in what you pay over the next few years, and in who owns the result.",
      },
      { h3: "1. Do it yourself on a website builder" },
      {
        p: "Builders like Wix and Squarespace charge a monthly subscription, and the cheapest plans look very affordable. What you’re really paying with is time: learning the tool, writing the copy, choosing photos and fixing layouts on mobile. You also rent the site — stop paying and it goes offline, and moving it elsewhere usually means starting again.",
      },
      { h3: "2. Hire a freelancer or small independent studio" },
      {
        p: "This is where most small businesses get the best value. You get a custom site designed around your business, usually for a one-off fee, and you talk directly to the person building it. Quality varies a lot, which is why seeing real, working examples matters more than a polished pitch.",
      },
      { h3: "3. Hire an agency" },
      {
        p: "Agencies bring bigger teams — strategists, designers, developers, account managers — and price accordingly. That makes sense for large, complex projects. For a local service business or a small store, you’re often paying for layers of people you’ll never speak to.",
      },

      { h2: "What actually drives the price of a website?", id: "price-drivers" },
      {
        ul: [
          [{ strong: "Number of pages." }, " A focused five-page site costs far less than a thirty-page one. Most service businesses need fewer pages than they think."],
          [{ strong: "Custom features." }, " An instant price estimator, a booking flow or a photo-upload quote form adds real value — and real build time."],
          [{ strong: "E-commerce." }, " A store needs a catalogue, cart, checkout, payment gateway, order emails and often customer accounts. That’s why stores cost more than brochure sites."],
          [{ strong: "Content." }, " If the words and photos are ready, the build is faster. If the designer has to write or source them, it takes longer."],
          [{ strong: "Integrations." }, " Connecting to booking systems, CRMs or payment providers adds scope."],
        ],
      },

      { h2: "What Pabloch Tech charges", id: "our-prices" },
      {
        ul: [
          [{ strong: "Websites:" }, " from $400, with growth builds from $700."],
          [{ strong: "Online stores:" }, " from $1,200."],
          [{ strong: "Landing pages and custom features:" }, " quoted per project."],
          [{ strong: "Website Care:" }, " optional, quoted per site."],
        ],
      },
      {
        p: [
          "Every project gets a one-page scope with a fixed price before the paid build starts, and you see a free working draft before you pay anything. ",
          { a: "See the full list of services", href: "/services/" },
          ".",
        ],
      },

      { h2: "The running costs people forget", id: "running-costs" },
      {
        ul: [
          [{ strong: "Domain name" }, " — renewed every year. Make sure it’s registered in your name, not your designer’s."],
          [{ strong: "Hosting" }, " — where the site lives. Hand-built sites are light and usually cheap to host."],
          [{ strong: "SSL certificate" }, " — the padlock in the browser. Often included with hosting."],
          [{ strong: "Maintenance" }, " — keeping content current, forms working and renewals paid. You can do it yourself or pay someone to."],
          [{ strong: "Transaction fees" }, " — if you sell online, your payment provider takes a small cut of each sale."],
        ],
      },

      { h2: "How to avoid overpaying", id: "avoid-overpaying" },
      {
        ol: [
          "Ask for a fixed price in writing, with what’s included, before any deposit.",
          "Ask to see live sites the designer has built — and open them on your phone.",
          "Confirm you’ll own the domain, the site and the code at the end.",
          "Ask how many revision rounds are included, and what counts as “new work”.",
          "Check what happens after launch: who fixes things, and at what cost?",
        ],
      },
      {
        note: [
          "Want a number for your project? ",
          { a: "Send us a few lines", href: "/contact/" },
          " and we’ll reply within 24 hours with what we’d build, what it would cost and how long it would take.",
        ],
      },
    ],
    faq: [
      {
        q: "How much does a basic small business website cost?",
        a: "From an independent studio, a basic custom website typically costs a few hundred dollars. Pabloch Tech’s websites start from $400, with a fixed price agreed in writing before the paid build starts.",
      },
      {
        q: "Is it cheaper to build a website myself?",
        a: "A website builder has a lower upfront cost, but you pay a monthly subscription for as long as the site is online, you rent rather than own it, and you spend your own time building it.",
      },
      {
        q: "What ongoing costs does a website have?",
        a: "Expect a yearly domain renewal, hosting, an SSL certificate (often included with hosting), optional maintenance, and payment-processing fees if you sell online.",
      },
    ],
  },

  {
    slug: "custom-website-vs-wix-squarespace-wordpress",
    category: "Choosing",
    title: "Custom website vs Wix, Squarespace or WordPress: which is right for your business?",
    metaTitle: "Custom Website vs Wix, Squarespace or WordPress",
    description:
      "Hand-built websites vs Wix, Squarespace and WordPress for small businesses: cost, speed, ownership, SEO and maintenance compared honestly.",
    lede: "Website builders are genuinely good at what they do. The question is whether what they do is what your business needs. Here’s a fair comparison.",
    published: PUBLISHED,
    updated: PUBLISHED,
    takeaways: [
      "Website builders (Wix, Squarespace) are best when you want to build and edit everything yourself and don’t mind renting the platform.",
      "WordPress is flexible but depends on themes and plugins that need regular updates.",
      "A hand-built custom website costs more up front than a builder, but you own it outright, it loads fast, and it has no plugins to break.",
      "If your site needs a custom feature — an estimator, a booking flow, a quote form — custom usually wins.",
    ],
    blocks: [
      { h2: "When a website builder is the right call", id: "builders" },
      {
        p: "Wix and Squarespace make it possible to get online in an afternoon with no code. If you enjoy designing, want to change things daily yourself, and your needs are simple, a builder is a sensible choice. You pay a monthly fee, and the platform handles hosting and security.",
      },
      {
        p: "The trade-offs: you rent rather than own, your site can only do what the platform supports, and moving away later usually means rebuilding from scratch. Templates also mean your site can look a lot like your competitors’.",
      },

      { h2: "When WordPress makes sense", id: "wordpress" },
      {
        p: "WordPress powers a large share of the web and can do almost anything with the right theme and plugins. That flexibility is also its weak point for small businesses: each plugin is written by a different developer, needs updating, and can conflict with the others. Unmaintained WordPress sites are a common target for attacks, so someone has to keep on top of updates.",
      },

      { h2: "What “hand-built” actually means", id: "hand-built" },
      {
        p: "A hand-built website is written directly in HTML, CSS and JavaScript for your business, with a back end added only when it’s needed — for example a store’s checkout. There’s no builder platform underneath and no plugin stack. In practice that means:",
      },
      {
        ul: [
          [{ strong: "Speed." }, " Pages ship only the code they need, so they load quickly — especially on phones and slow connections, which matters to visitors and to search engines."],
          [{ strong: "Ownership." }, " You own the code and can host it anywhere. No subscription keeps it alive."],
          [{ strong: "Fewer moving parts." }, " Nothing updates itself overnight and breaks the layout."],
          [{ strong: "Exactly what you need." }, " Features like an instant cleaning-price estimator or a photo-upload quote form are built around how your business works."],
        ],
      },

      { h2: "Side by side", id: "comparison" },
      {
        ul: [
          [{ strong: "Upfront cost:" }, " builder lowest · WordPress varies · custom a one-off fee (Pabloch Tech from $400)."],
          [{ strong: "Ongoing cost:" }, " builder monthly subscription · WordPress hosting plus maintenance · custom hosting plus optional care."],
          [{ strong: "Ownership:" }, " builder rented · WordPress owned · custom owned."],
          [{ strong: "Custom features:" }, " builder limited to its apps · WordPress via plugins · custom built to fit."],
          [{ strong: "Maintenance:" }, " builder handled by the platform · WordPress frequent updates · custom minimal."],
          [{ strong: "Who edits it:" }, " builder you · WordPress you or a developer · custom your developer, or you for simple changes."],
        ],
      },

      { h2: "The honest recommendation", id: "recommendation" },
      {
        p: "If you want to do it all yourself and your needs are simple, start with a builder. If you want a site that’s fast, looks like no one else’s, does something specific for your customers, and belongs to you — go custom. The easiest way to decide is to see what custom would look like for your business before paying for it.",
      },
      {
        note: [
          "That’s exactly how we work: ",
          { a: "tell us about your business", href: "/contact/" },
          " and we’ll build a working first draft for free. If it isn’t better than what you’d build yourself, you owe nothing.",
        ],
      },
    ],
    faq: [
      {
        q: "Is a custom website better than Wix or Squarespace?",
        a: "It depends on your needs. Builders suit people who want to edit everything themselves and are happy renting the platform. A custom website suits businesses that want speed, full ownership and features built around how they work.",
      },
      {
        q: "Do custom websites rank better on Google?",
        a: "No platform guarantees rankings, but hand-built sites are typically fast and lean, with clean markup and structured data, which gives search engines a solid technical foundation.",
      },
    ],
  },

  {
    slug: "shopify-vs-custom-online-store",
    category: "E-commerce",
    title: "Shopify vs a custom online store: fees, ownership and control",
    metaTitle: "Shopify vs a Custom Online Store: Fees & Ownership",
    description:
      "Shopify or a custom online store? Compare monthly and app fees, ownership, checkout flexibility and when each makes sense for a small brand.",
    lede: "Hosted platforms made selling online easy. A store you own outright can make it cheaper and more yours. Here’s how to decide.",
    published: PUBLISHED,
    updated: PUBLISHED,
    takeaways: [
      "Hosted platforms like Shopify are quick to launch but come with a monthly plan, paid apps and, depending on how you take payments, platform fees.",
      "A custom store costs more up front (Pabloch Tech stores start from $1,200) but you own it, with no platform subscription.",
      "Custom makes the most sense when you want a distinctive brand experience, specific features, or to stop paying for a stack of apps.",
      "Either way, you still pay your payment provider’s processing fees on each sale.",
    ],
    blocks: [
      { h2: "What you pay for on a hosted platform", id: "platform-costs" },
      {
        p: "Hosted e-commerce platforms charge a monthly subscription, and most stores add paid apps for things like reviews, bundles, wishlists or advanced search. Depending on the payment setup, there may also be a platform fee on top of standard card-processing fees. Individually these look small; together they’re a permanent monthly cost that grows with your store. Check the platform’s current pricing page for exact numbers — they change regularly.",
      },

      { h2: "What a custom store includes", id: "custom-store" },
      {
        p: "A custom store is built around your catalogue and your customers, on code you own. A typical Pabloch Tech store includes:",
      },
      {
        ul: [
          "A product catalogue with collections",
          "Cart, checkout and a payment gateway",
          "Order management and confirmation emails",
          "Customer accounts and order tracking",
          "Search, filters and bundles",
          "Shipping and tax configuration",
        ],
      },
      {
        p: [
          "You can see all of this working on ",
          { a: "Al-Abuzer Perfumes", href: "https://alabuzerperfumes.com" },
          ", a live store we designed and built: eight collections, a full-bleed video homepage, customer accounts and an order-tracking page that answers “where’s my order?” before anyone has to email.",
        ],
      },

      { h2: "Ownership: the part that matters later", id: "ownership" },
      {
        p: "On a hosted platform, your store lives inside someone else’s system. You can export products and orders, but the design, apps and checkout don’t come with you. With a custom store, the code, the domain and the data are yours — you can change hosts, developers or direction without starting again.",
      },

      { h2: "When a hosted platform is the better choice", id: "when-platform" },
      {
        ul: [
          "You want to launch this week and manage everything yourself.",
          "You’re testing an idea and may not continue.",
          "You rely on a specific integration that only exists as a platform app.",
        ],
      },

      { h2: "When a custom store is the better choice", id: "when-custom" },
      {
        ul: [
          "Your brand sells on atmosphere and you don’t want to look like every template.",
          "You’re paying for several apps to get features that could simply be built in.",
          "You want a feature the platform can’t do well — bundles, custom catalogues, tailored order tracking.",
          "You want to own the store outright.",
        ],
      },
      {
        note: [
          "Thinking about a store? ",
          { a: "Tell us what you sell", href: "/contact/" },
          " — you’ll get a fixed price and a free working draft before you pay anything.",
        ],
      },
    ],
    faq: [
      {
        q: "Is a custom online store cheaper than Shopify?",
        a: "A custom store usually costs more up front but has no platform subscription or app fees, so over several years it can cost less. Payment-processing fees apply either way.",
      },
      {
        q: "How long does it take to build a custom online store?",
        a: "At Pabloch Tech, the production build for an online store takes 3–5 weeks after you approve the free first draft.",
      },
    ],
  },

  {
    slug: "small-business-website-checklist",
    category: "Guides",
    title: "The small business website checklist: 12 things that turn searches into calls",
    metaTitle: "Small Business Website Checklist: 12 Essentials",
    description:
      "12 essentials for a local or service business website: first-screen content, prices, reviews, areas served, mobile speed and SEO basics.",
    lede: "Most people find your website after they’ve already heard your name. Its job is to turn that search into a phone call. Here’s what makes that happen.",
    published: PUBLISHED,
    updated: PUBLISHED,
    takeaways: [
      "Say what you do, where, and how to contact you in the first screen.",
      "Show prices or an instant estimate — enquiries that arrive with a price attached convert better.",
      "Put your reviews on your own site, and make it fast on a phone.",
      "Cover the SEO basics: a clear title and description per page, your areas served, and structured data.",
    ],
    blocks: [
      { h2: "The first screen", id: "first-screen" },
      {
        ol: [
          [{ strong: "What you do and where." }, " “Deep cleaning in Sylvania & Toledo” beats “Welcome to our website”."],
          [{ strong: "One obvious next step." }, " A call button on mobile, and a short enquiry form or quote tool."],
          [{ strong: "Proof, immediately." }, " Your star rating and number of reviews, visible without scrolling."],
        ],
      },

      { h2: "The content that answers questions", id: "content" },
      {
        ol: [
          [{ strong: "Services, clearly listed." }, " Plain names customers would search for, each with a sentence on what’s included."],
          [{ strong: "Prices — or a way to get one instantly." }, " An estimator that answers “how much for a 3-bed deep clean?” on screen means every enquiry arrives with a price already attached."],
          [{ strong: "Areas served and hours." }, " Towns, postcodes or ZIP codes and when you work. This is also what local search looks for."],
          [{ strong: "Your reviews, in one place." }, " Pull them together from the platforms customers use."],
          [{ strong: "Real people and real work." }, " The team by name and recent jobs build trust faster than stock photos."],
        ],
      },

      { h2: "The technical basics", id: "technical" },
      {
        ol: [
          [{ strong: "Fast on a phone, on a bad connection." }, " Most local searches happen on mobile. Heavy pages lose visitors before they load."],
          [{ strong: "A page title and description for every page." }, " They’re what shows in Google results — write them for people, with your service and location."],
          [{ strong: "Structured data." }, " Machine-readable details about your business (name, services, area, reviews) help search engines and AI assistants understand and quote you."],
          [{ strong: "Forms that never lose an enquiry." }, " Spam-filtered, delivered straight to your inbox, and tested regularly."],
        ],
      },

      { h2: "A common mistake worth checking today", id: "check-today" },
      {
        p: "Open your Google Business Profile and tap the Website button. It’s surprisingly common for it to point at a parked domain, an expired site or an address with no DNS record at all — every tap on it is a lost customer. It takes two minutes to check.",
      },
      {
        note: [
          "Want a site that ticks every box? ",
          { a: "See how we work", href: "/process/" },
          " — or ",
          { a: "send us a few lines", href: "/contact/" },
          " and get a free working draft first.",
        ],
      },
    ],
    faq: [
      {
        q: "What should a small business website include?",
        a: "At minimum: what you do and where, a clear call to action, services and prices (or an estimator), areas served and hours, reviews, contact details, fast mobile performance and a title and description on every page.",
      },
      {
        q: "Should I show prices on my website?",
        a: "Usually yes. Showing prices, or offering an instant estimate, filters out poor-fit enquiries and means the ones you get arrive ready to book.",
      },
    ],
  },

  {
    slug: "see-a-working-draft-before-you-pay",
    category: "Process",
    title: "Why you should see a working draft before paying a web designer",
    metaTitle: "See a Working Draft Before You Pay a Web Designer",
    description:
      "Most web designers want a deposit before you see anything. Why a free working first draft protects small businesses — and how our 5 stages work.",
    lede: "A proposal can promise anything. A working draft on your phone can’t hide. Here’s why the draft should come before the deposit.",
    published: PUBLISHED,
    updated: PUBLISHED,
    takeaways: [
      "Paying a deposit before seeing any work puts all the risk on you.",
      "A clickable first draft — real layout, your services, your words — shows whether a designer understands your business.",
      "At Pabloch Tech the first draft is free; you pay 50% only after approving it and 50% on launch day.",
    ],
    blocks: [
      { h2: "The problem with the usual way", id: "problem" },
      {
        p: "The typical process runs: discovery call, proposal, deposit, then — weeks later — the first design. By the time you see whether the designer “gets” your business, you’ve already paid. If it’s wrong, you’re negotiating revisions instead of choosing someone else.",
      },

      { h2: "What a working draft is (and isn’t)", id: "what-it-is" },
      {
        p: "A working draft isn’t a mood board or a static mock-up. It’s a real web page you open on your phone: your services, your words, the actual layout, clickable. It won’t have every page or feature yet — that’s what the paid build is for — but it answers the only question that matters at this stage: is this the right direction?",
      },

      { h2: "How our five-stage process works", id: "five-stages" },
      {
        ol: [
          [{ strong: "Discover." }, " You tell us about the business. A few lines is enough, or twenty minutes on Zoom or Google Meet."],
          [{ strong: "Define." }, " Within 24 hours we reply with what we’d build, what it would cost and how long it would take."],
          [{ strong: "Design." }, " We build a working first draft and send you a link — usually within a few days. If it isn’t right, you owe nothing."],
          [{ strong: "Build." }, " Approve the draft and you get a one-page scope with a fixed price. Then a 50% deposit and the production build."],
          [{ strong: "Refine." }, " Two full revision rounds, launch, and the final 50%. The site, code and domain are yours."],
        ],
      },

      { h2: "Questions to ask any web designer", id: "questions" },
      {
        ul: [
          "Can I see something built for my business before I pay?",
          "Is the price fixed, and is it in writing?",
          "Will the domain be registered in my name?",
          "Who will I actually talk to while it’s being built?",
          "What happens — and what does it cost — after launch?",
        ],
      },
      {
        note: [
          "See it before you pay for it: ",
          { a: "start with a free draft", href: "/contact/" },
          ".",
        ],
      },
    ],
    faq: [
      {
        q: "Do web designers build a draft before payment?",
        a: "Most ask for a deposit first. Pabloch Tech builds a working first draft for free, and you pay a 50% deposit only after approving it.",
      },
      {
        q: "What is the Discover, Define, Design, Build, Refine process?",
        a: "It is Pabloch Tech’s five-stage workflow: understand the business, propose the approach and price, build a free working draft, do the paid production build, then refine with two revision rounds and launch.",
      },
    ],
  },
];

export const blogIntro = {
  title: "Journal",
  metaTitle: "Journal — Web Design Guides for Small Businesses | Pabloch Tech",
  description:
    "Practical guides on website costs, custom sites vs builders, online stores and winning customers from search — by independent studio Pabloch Tech.",
  lede: "Plain-English answers to the questions small businesses ask before building a website or online store.",
} as const;
