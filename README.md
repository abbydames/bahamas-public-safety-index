# Bahamas Public Safety Index

Independent, non-governmental Bahamas-wide public-safety website prototype.

## Named public-record dataset

The current prototype includes **69 named, source-backed public records** spanning modern news archives and a first historical court-record expansion reaching back to the 1980s.

Current status mix:

- 37 conviction / guilty-plea records
- 27 charge / arraignment records
- 1 acquittal record
- 4 appeal / status-change records where an earlier conviction was quashed or otherwise materially changed

This number is not exhaustive. Older Bahamian records are much less consistently digitized, and some reporting withholds accused names to protect victims. Every named entry should preserve the exact public procedural status rather than treating accusation, charge, conviction, acquittal, dismissal and appellate reversal as equivalent.

## Product model

The site separates three kinds of information:

1. **Source-backed named records** — convictions, guilty pleas, publicly reported charges/allegations, acquittals, dismissals, withdrawals and appeal/status changes, each with an explicit label and source.
2. **Historical court records** — older source-backed cases, including final appellate outcomes when located.
3. **Community reports** — immediate unverified safety signals. The reporter supplies the accused person's identity privately. The identity is AES-256-GCM encrypted and never returned by the public community-report API. A keyed HMAC clusters repeat reports concerning the same submitted identity.

Public community cards can therefore say that multiple reports are linked to the same privately identified person without displaying that person's name from an unverified accusation.

## Cloudflare setup

This repository is intended for a Cloudflare Pages project with Pages Functions and D1.

1. Create a D1 database and execute `schema.sql` against it. Bind it as `DB`.
2. Add `MATCH_SECRET` as an encrypted secret with at least 32 random bytes/characters.
3. Add `REPORT_ENCRYPTION_KEY` as an encrypted secret containing exactly 32 random bytes encoded as Base64.
4. Deploy from the repository root. No frontend build command is required for this MVP.
5. Enable Cloudflare Turnstile and rate limiting / WAF rules before broad promotion.

Never commit secrets, decrypted submitted identities, reporter contact information, or victim-identifying information to GitHub.

## Named-record source standard

Preferred source hierarchy:

1. Bahamian court / government publication
2. Royal Bahamas Police Force or another official authority
3. Established Bahamian news organization reporting the court/police record
4. Court of Appeal / Privy Council / recognized legal archive
5. Other established news or institutional source with directly checkable provenance

Store the source URL and verification date with each named record. Track later convictions, acquittals, dismissals, withdrawals, retrials, overturned convictions and other status changes. Do not leave an old charge standing alone when a later public disposition has been located.

## Community-report privacy model

Community reports intentionally do not accept a free-form public narrative. Private identifying fields are encrypted and used for repeat-report matching. The public report exposes only structured fields such as island, settlement/city, firsthand/secondhand status, relationship category, alleged conduct category, approximate period, victim age group, pattern and pseudonymous cluster count/code.

The public API must never return `encrypted_identity`, `identity_match_key`, the accused person's private submitted name/aliases, private evidence links, reporter contact information, or victim-identifying data.

## Bahamas legal review required before public launch

This repository is a technical prototype, not legal advice. Bahamian counsel and/or the Office of the Data Protection Commissioner should review:

- applicability of the Data Protection (Privacy of Personal Information) Act, Ch. 324A
- treatment of criminal convictions and alleged commission of offences as sensitive personal data
- lawful/fair collection, accuracy, purpose limitation, data minimization, retention and security
- rights of access, rectification and erasure
- the data controller's duty of care
- cross-border hosting/processing
- interaction with the Sexual Offences Act's government Sex Offender Register/Registry and section 26J public-notification framework
- defamation and publication liability
- commencement status of the enacted Data Protection Act, 2025, which the official legislation index currently lists as not in force

## Advertising / AdSense

Do not assume every page is monetizable. Google makes publishers responsible for user-generated content appearing on pages with ad code. Content involving shocking descriptions, harassment, illegal content or sexually explicit material can receive restricted ad serving or be prohibited.

Recommended MVP placement:

- homepage: eligible after AdSense approval
- explanatory / safety-resource pages: eligible after review
- source-backed directory pages: test cautiously after policy review
- community-report feed: no AdSense by default
- individual community-report cards/pages: no AdSense by default

## Before launch checklist

- [ ] Bahamian attorney reviews publication/data-protection structure
- [ ] Confirm current commencement status of Data Protection Act, 2025
- [ ] Contact or obtain guidance from the Bahamas Office of the Data Protection Commissioner
- [ ] D1 created and schema applied
- [ ] `MATCH_SECRET` configured
- [ ] `REPORT_ENCRYPTION_KEY` configured
- [ ] Turnstile enabled
- [ ] Cloudflare rate limiting enabled
- [ ] correction/takedown workflow has a monitored inbox or dashboard
- [ ] named records have source URL + exact legal/procedural status
- [ ] later public dispositions are reflected prominently
- [ ] no victim/minor identifying information in public content
- [ ] AdSense approved before ad code is enabled
