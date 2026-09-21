/** Long-form legal & policy copy for SHE Collection (Pakistan). */

export const LEGAL_PAGE_SLUGS = [
  "terms",
  "privacy",
  "refund-policy",
  "shipping-policy",
  "cookie-policy",
] as const;

export type LegalPageSlug = (typeof LEGAL_PAGE_SLUGS)[number];

export const LEGAL_PAGES: Record<
  LegalPageSlug,
  {
    title: string;
    eyebrow: string;
    seo_title: string;
    seo_description: string;
    content: string;
  }
> = {
  terms: {
    title: "Terms of Service",
    eyebrow: "Legal",
    seo_title: "Terms of Service | SHE Collection",
    seo_description:
      "Read the terms and conditions for using sheco.pk, placing orders, payments, and customer responsibilities.",
    content: `Last updated: 3 September 2026

These Terms of Service ("Terms") govern your access to and use of the website operated by SHE Collection ("SHE Collection", "we", "us", "our") at sheco.pk and related subdomains (the "Website"). By visiting the Website, creating an account, or placing an order, you agree to be bound by these Terms. If you do not agree, please do not use our services.

## 1. About SHE Collection

SHE Collection is a Pakistan-based artificial and fashion jewellery brand offering necklace sets, earrings, bangles, bridal sets, and related accessories for online purchase and delivery within Pakistan and internationally where available.

## 2. Eligibility

You must be at least 18 years of age, or the age of majority in your jurisdiction, to place an order. By using the Website you represent that you have the legal capacity to enter into a binding contract. Orders placed on behalf of another person must be authorized by that person.

## 3. Account registration

When you create an account, you agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately at hello@sheco.pk if you suspect unauthorized access.

## 4. Products & descriptions

We make reasonable efforts to display product colours, materials, dimensions, and images as accurately as possible. However, screens vary and artificial jewellery may appear slightly different in person due to lighting, plating, and photography. Product descriptions, prices, and availability may change without notice. We reserve the right to limit quantities, refuse orders, or cancel orders affected by pricing or stock errors.

## 5. Pricing & payment

All prices are listed in Pakistani Rupees (PKR) unless stated otherwise. Applicable shipping fees, discounts, and taxes (if any) are shown at checkout before you confirm your order. We accept payment methods displayed at checkout including Cash on Delivery (COD), bank transfer, JazzCash, EasyPaisa, and card payments where enabled. You agree to pay the full order amount for the payment method selected. Failed or fraudulent payments may result in order cancellation.

## 6. Order acceptance

Your order is an offer to purchase. A binding contract is formed when we send order confirmation or begin processing your order. We may refuse or cancel orders due to stock unavailability, suspected fraud, address issues, or violation of these Terms. If your order is cancelled after payment, we will refund the amount paid using the original payment method where possible.

## 7. Shipping & delivery

Delivery timelines, carriers, and shipping charges are described in our Shipping Policy. Risk of loss passes to you upon delivery to the address you provide. You are responsible for providing a complete and accurate shipping address and an reachable phone number for courier coordination.

## 8. Returns & refunds

Returns, exchanges, and refunds are governed by our Refund Policy. Certain items such as earrings, pierced jewellery, customized pieces, or items marked final sale may not be eligible for return where permitted by law.

## 9. Intellectual property

All Website content including logos, product photography, text, graphics, and layout is owned by SHE Collection or its licensors and protected by copyright and trademark laws. You may not copy, reproduce, scrape, or use our content for commercial purposes without written permission.

## 10. Prohibited conduct

You agree not to: misuse the Website; attempt unauthorized access to systems or accounts; use automated bots to scrape inventory or prices; harass our staff; submit false orders; resell products in a manner that misrepresents SHE Collection as the seller; or violate applicable laws of Pakistan or your country.

## 11. Disclaimer of warranties

Products are fashion jewellery unless expressly described otherwise. To the fullest extent permitted by law, the Website and products are provided "as is" without warranties of merchantability or fitness for a particular purpose beyond those required by applicable consumer protection laws.

## 12. Limitation of liability

To the maximum extent permitted by law, SHE Collection shall not be liable for indirect, incidental, special, or consequential damages arising from use of the Website or products. Our total liability for any claim relating to an order shall not exceed the amount you paid for that order.

## 13. Indemnification

You agree to indemnify and hold harmless SHE Collection, its owners, employees, and partners from claims arising from your misuse of the Website, violation of these Terms, or infringement of third-party rights.

## 14. Governing law & disputes

These Terms are governed by the laws of Pakistan. Courts in Lahore, Punjab shall have exclusive jurisdiction unless mandatory consumer protection rules in your province provide otherwise. We encourage you to contact us first to resolve disputes amicably.

## 15. Changes to these Terms

We may update these Terms from time to time. The "Last updated" date at the top will reflect changes. Continued use of the Website after changes constitutes acceptance. Material changes may be announced on the Website or by email where appropriate.

## 16. Contact

Questions about these Terms: hello@sheco.pk | +92 300 0000000 | Lahore, Punjab, Pakistan.`,
  },

  privacy: {
    title: "Privacy Policy",
    eyebrow: "Legal",
    seo_title: "Privacy Policy | SHE Collection",
    seo_description:
      "How sheco.pk collects, uses, stores, and protects your personal information when you shop with us.",
    content: `Last updated: 3 September 2026

SHE Collection ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard personal information when you visit sheco.pk, create an account, or purchase from us.

## 1. Information we collect

We may collect the following categories of information:

• Identity & contact: name, email address, phone number, shipping and billing address.
• Account data: login credentials (stored securely hashed), wishlist, order history.
• Order & payment: items purchased, order totals, payment method selected, transaction references you provide for bank/JazzCash/EasyPaisa transfers. We do not store full card numbers on our servers when card processing is handled by certified payment partners.
• Technical data: IP address, browser type, device information, pages viewed, and cookies (see our Cookie Policy).
• Communications: messages you send via contact forms, email, WhatsApp, or customer support.

## 2. How we use your information

We use personal information to:

• Process and deliver orders, send confirmations, and provide tracking updates.
• Verify identity for guest order tracking and fraud prevention.
• Respond to inquiries and provide customer support.
• Improve our Website, products, and marketing relevance.
• Send promotional messages where you have opted in; you may unsubscribe at any time.
• Comply with legal obligations and enforce our Terms of Service.

## 3. Legal bases for processing

Where applicable, we process data based on: performance of a contract (fulfilling your order), legitimate interests (security, analytics, improving services), consent (marketing cookies or newsletters), and legal compliance.

## 4. Sharing with third parties

We may share information with:

• Courier and logistics partners to deliver your order.
• Payment processors and banks to complete transactions.
• Technology providers hosting our Website, database, and email services.
• Professional advisers where required by law.

We do not sell your personal information to third parties for their independent marketing.

## 5. International transfers

If you order from outside Pakistan, your data may be processed in Pakistan and in countries where our service providers operate. We take reasonable steps to ensure appropriate safeguards for cross-border transfers.

## 6. Data retention

We retain order and account records as long as needed to fulfill orders, resolve disputes, meet tax and accounting requirements, and comply with law. Marketing preferences are retained until you withdraw consent. Inactive accounts may be anonymized or deleted after a reasonable period.

## 7. Security

We implement administrative, technical, and physical safeguards including encrypted connections (HTTPS), access controls, and secure hosting. No method of transmission over the Internet is 100% secure; we cannot guarantee absolute security.

## 8. Your rights

Depending on applicable law, you may have the right to access, correct, delete, or restrict processing of your personal data, and to object to certain processing. To exercise these rights, email hello@sheco.pk with sufficient detail to verify your identity.

## 9. Children's privacy

Our Website is not directed to children under 13. We do not knowingly collect personal information from children. Contact us if you believe a child has provided data and we will delete it.

## 10. Marketing communications

With your consent, we may send emails or SMS about new collections, sales, and order updates. You can opt out using the unsubscribe link in emails or by contacting support. Transactional messages related to active orders may still be sent.

## 11. Third-party links

Our Website may link to social media or third-party sites. We are not responsible for their privacy practices. Review their policies before providing personal information.

## 12. Changes to this policy

We may update this Privacy Policy periodically. The updated version will be posted on this page with a revised "Last updated" date. Significant changes may be communicated by email or Website notice.

## 13. Contact us

Privacy inquiries: hello@sheco.pk
Address: Lahore, Punjab, Pakistan
Phone: +92 300 0000000`,
  },

  "refund-policy": {
    title: "Refund & Return Policy",
    eyebrow: "Legal",
    seo_title: "Refund & Return Policy | SHE Collection",
    seo_description:
      "Return windows, exchange conditions, refund timelines, and non-returnable items for sheco.pk orders.",
    content: `Last updated: 3 September 2026

At SHE Collection we want you to love your purchase. This Refund & Return Policy explains how returns, exchanges, and refunds work for orders placed on sheco.pk.

## 1. Return window

You may request a return or exchange within 7 days of delivery for eligible items in unused, unworn condition with original packaging, tags, and accessories intact. Items showing signs of wear, damage caused after delivery, or missing components may be rejected.

## 2. Eligible items

Generally eligible: necklace sets, bangles, bracelets, rings, bridal sets (non-customized), and accessories in resalable condition.

## 3. Non-returnable items

For hygiene and safety reasons the following are typically non-returnable unless defective on arrival:

• Earrings and pierced jewellery
• Customized or made-to-order bridal pieces
• Items marked "Final Sale" or purchased during clearance unless defective
• Gift cards or digital products

Defective or wrong items remain covered regardless of category.

## 4. Defective or wrong items

If you receive a damaged, defective, or incorrect product, contact us within 48 hours of delivery with your order number, photos/videos of the issue, and unboxing evidence where possible. We will arrange replacement, exchange, or full refund including standard return shipping where applicable.

## 5. How to start a return

Email hello@sheco.pk or WhatsApp our support line with:
• Order number
• Phone number used at checkout
• Item(s) to return and reason
• Photos if reporting damage or defect

Our team will confirm eligibility and provide return instructions including our return address or pickup options where available.

## 6. Return shipping

For change-of-mind returns, the customer is responsible for return courier charges unless we state otherwise in writing. For verified defective/wrong items, SHE Collection will bear reasonable return shipping costs or arrange reverse pickup in major cities.

## 7. Exchanges

Exchanges are subject to stock availability. If the requested item is unavailable, we may offer an alternative, store credit, or refund. Price differences for higher-value exchanges must be paid before dispatch.

## 8. Refund method & timeline

Approved refunds are processed to the original payment method where possible:

• COD orders: bank transfer or JazzCash/EasyPaisa within 7–14 business days after we receive and inspect the return.
• Prepaid orders: reversal to the same channel within 7–14 business days; bank/card processing may add additional days.
• Partial refunds may apply if items are returned incomplete or not in resalable condition.

## 9. Cancellations before dispatch

Orders may be cancelled before dispatch by contacting us immediately. If already shipped, standard return rules apply. Custom or personalized orders may not be cancellable once production begins.

## 10. Store credit

Where refund to the original payment method is not feasible, we may issue store credit valid for 12 months unless otherwise stated.

## 11. Chargebacks

Please contact us before initiating a chargeback so we can resolve the issue. Unwarranted chargebacks may result in account suspension and recovery of associated fees where permitted.

## 12. Contact

Returns & refunds: hello@sheco.pk | +92 300 0000000`,
  },

  "shipping-policy": {
    title: "Shipping & Delivery Policy",
    eyebrow: "Legal",
    seo_title: "Shipping Policy | SHE Collection",
    seo_description:
      "Delivery times, shipping rates, COD, international shipping, and order tracking for sheco.pk.",
    content: `Last updated: 3 September 2026

This Shipping Policy explains how SHE Collection delivers orders placed on sheco.pk within Pakistan and internationally where available.

## 1. Processing time

Orders are typically processed within 1–3 business days after confirmation. Processing may take longer during sale periods, holidays, or for customized bridal pieces. You will receive email/SMS updates when your order is confirmed and dispatched.

## 2. Domestic shipping (Pakistan)

We ship nationwide via trusted courier partners. Estimated delivery times after dispatch:

• Major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan): 2–5 business days
• Other urban areas: 3–7 business days
• Remote or rural areas: 5–10 business days

Timelines are estimates and may vary due to weather, public holidays, or courier delays beyond our control.

## 3. Shipping rates

Standard shipping fee: Rs. 200 for orders below Rs. 5,000.

Free standard shipping on orders of Rs. 5,000 and above within Pakistan.

Express or same-city delivery may be available on request for an additional fee—contact support before ordering.

## 4. Cash on Delivery (COD)

COD is available in most serviceable areas. A small COD handling fee may apply on certain orders and will be shown at checkout. Refusal of COD parcels without valid reason may restrict future COD eligibility.

## 5. Order tracking

After dispatch you will receive a tracking number when provided by the courier. Track your order at /track-order using your order number and phone, or via the link in your confirmation message.

## 6. Delivery attempts & address accuracy

Couriers typically attempt delivery 2–3 times. Ensure your phone is reachable and your address includes house/plot number, street, landmark, city, and province. Incorrect addresses causing failed delivery may incur re-shipping charges.

## 7. International shipping

We offer worldwide shipping to selected countries. International rates and delivery times (usually 7–21 business days) are calculated at checkout or quoted by support for large bridal orders. Customers are responsible for import duties, taxes, and customs clearance in the destination country unless stated otherwise.

## 8. Lost or delayed parcels

If tracking shows no movement for 7+ days domestically or 14+ days internationally, contact hello@sheco.pk with your order number. We will investigate with the courier and offer replacement or refund if the parcel is confirmed lost.

## 9. Damaged in transit

Report visible courier box damage at delivery and photograph packaging and product. Notify us within 48 hours for assistance with replacement or refund per our Refund Policy.

## 10. Multiple items & split shipments

Large orders may ship in multiple parcels at no extra standard shipping cost where possible. You will be notified if split shipment occurs.

## 11. Contact

Shipping support: hello@sheco.pk | +92 300 0000000`,
  },

  "cookie-policy": {
    title: "Cookie Policy",
    eyebrow: "Legal",
    seo_title: "Cookie Policy | SHE Collection",
    seo_description:
      "How sheco.pk uses cookies and similar technologies on our website.",
    content: `Last updated: 3 September 2026

This Cookie Policy explains how SHE Collection ("we", "us") uses cookies and similar technologies on sheco.pk.

## 1. What are cookies?

Cookies are small text files stored on your device when you visit a website. They help the site remember preferences, keep you signed in, and understand how visitors use pages.

## 2. Types of cookies we use

Essential cookies: Required for the Website to function—shopping cart, checkout, account login, and security. These cannot be disabled while using core features.

Functional cookies: Remember choices such as wishlist items stored locally and display preferences.

Analytics cookies: Help us understand traffic, popular products, and errors so we can improve performance. Data is aggregated where possible.

Marketing cookies: May be used to measure ad campaigns or show relevant promotions. We use these only where permitted and with appropriate consent where required.

## 3. Similar technologies

We may use local storage, session storage, and pixels for similar purposes such as keeping cart contents and measuring email open rates.

## 4. Third-party cookies

Payment providers, analytics tools, and embedded content (e.g. video players) may set their own cookies governed by their privacy policies.

## 5. Managing cookies

You can control cookies through your browser settings—block, delete, or alert you when cookies are set. Blocking essential cookies may prevent checkout or account access.

## 6. Updates

We may update this Cookie Policy. Check this page for the latest version.

## 7. Contact

Questions: hello@sheco.pk`,
  },
};
